from __future__ import annotations

import asyncio
import json
import os
from contextlib import asynccontextmanager
from time import perf_counter
from typing import List, Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from symptom_disease_model.symptom_checker import (
    get_classifier,
    run_symptom_checker,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the trained classifier once when the API starts.

    This prevents the first completed symptom-check request from
    having to wait for the model to load.
    """
    print("Loading AidFidelis disease classifier...")

    start_time = perf_counter()

    try:
        await run_in_threadpool(get_classifier)
    except Exception as error:
        print(f"Failed to load disease classifier: {error}")
        raise

    loading_time = perf_counter() - start_time

    print(
        "AidFidelis disease classifier loaded successfully "
        f"in {loading_time:.2f} seconds."
    )

    yield

    print("AidFidelis Symptom Checker API is shutting down.")


app = FastAPI(
    title="AidFidelis Symptom Checker API",
    description=(
        "Backend API for symptom information gathering, disease-pattern "
        "classification and health-information explanations."
    ),
    version="1.1.0",
    lifespan=lifespan,
)


def configured_cors_origins() -> list[str]:
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    origins = []
    for origin in raw_origins.split(","):
        normalized = origin.strip().rstrip("/")
        if normalized and normalized not in origins:
            origins.append(normalized)

    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_processing_time_header(
    request: Request,
    call_next,
):
    """
    Measure how long each API request takes.

    The result appears in the browser Network tab as:
    X-Process-Time
    """
    start_time = perf_counter()

    response = await call_next(request)

    processing_time = perf_counter() - start_time

    response.headers["X-Process-Time"] = f"{processing_time:.4f}"

    print(
        f"{request.method} {request.url.path} "
        f"completed in {processing_time:.2f} seconds"
    )

    return response


class SymptomCheckRequest(BaseModel):
    symptoms: str = Field(
        min_length=2,
        max_length=2000,
        examples=["fever, headache and chills"],
    )

    age: int | None = Field(
        default=None,
        ge=0,
        le=120,
    )

    sex: Literal[
        "male",
        "female",
        "other",
        "prefer_not_to_say",
    ] | None = None

    duration: str | None = Field(
        default=None,
        max_length=200,
    )

    previous_answers: List[str] = Field(
        default_factory=list,
        max_length=20,
    )

    contraindication_screen_complete: bool = False


@app.get("/")
async def home() -> dict:
    return {
        "name": "AidFidelis Symptom Checker API",
        "status": "running",
        "version": "1.1.0",
    }


@app.get("/health")
async def health_check() -> dict:
    return {
        "status": "healthy",
        "classifier_loaded": True,
    }


def run_checker_from_request(
    request: SymptomCheckRequest,
) -> dict:
    """
    Keep one shared call path for both normal and streaming endpoints.
    """
    return run_symptom_checker(
        symptoms=request.symptoms,
        age=request.age,
        sex=request.sex,
        duration=request.duration,
        previous_answers=request.previous_answers,
        contraindication_screen_complete=(
            request.contraindication_screen_complete
        ),
    )


@app.post("/api/symptom-check")
async def symptom_check(
    request: SymptomCheckRequest,
) -> dict:
    """
    Existing non-streaming endpoint.

    Keep this route so older frontend code continues to work.
    """
    try:
        result = await run_in_threadpool(
            run_checker_from_request,
            request,
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except RuntimeError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    except Exception as error:
        print(
            "Unexpected symptom checker error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected symptom-checker error occurred."
            ),
        ) from error


def sse_event(
    event: str,
    payload: dict,
) -> str:
    """
    Format one Server-Sent Events message.
    """
    return (
        f"event: {event}\n"
        f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
    )


@app.post("/api/symptom-check/stream")
async def symptom_check_stream(
    request: SymptomCheckRequest,
) -> StreamingResponse:
    """
    Streaming symptom-check endpoint.

    The frontend receives progress events immediately while the main
    symptom checker runs in a background thread, then receives the
    final response as a `completed` event.

    Progress messages are user-experience status updates. The final
    clinical result still comes entirely from run_symptom_checker().
    """

    async def event_generator():
        started = perf_counter()

        yield sse_event(
            "status",
            {
                "stage": "received",
                "message": "I’ve received your information.",
            },
        )

        await asyncio.sleep(0)

        task = asyncio.create_task(
            run_in_threadpool(
                run_checker_from_request,
                request,
            )
        )

        progress_messages = [
            (
                "reviewing",
                "Reviewing your symptoms and answers...",
            ),
            (
                "checking",
                "Checking the symptom pattern...",
            ),
            (
                "preparing",
                "Preparing your AidFidelis response...",
            ),
        ]

        progress_index = 0

        try:
            while not task.done():
                stage, message = progress_messages[
                    progress_index % len(progress_messages)
                ]

                yield sse_event(
                    "status",
                    {
                        "stage": stage,
                        "message": message,
                    },
                )

                progress_index += 1

                try:
                    await asyncio.wait_for(
                        asyncio.shield(task),
                        timeout=1.25,
                    )
                except asyncio.TimeoutError:
                    continue

            result = await task

            yield sse_event(
                "result",
                {
                    "elapsed_seconds": round(
                        perf_counter() - started,
                        3,
                    ),
                    "data": result,
                },
            )

        except ValueError as error:
            yield sse_event(
                "error",
                {
                    "status": 400,
                    "message": str(error),
                },
            )

        except RuntimeError as error:
            yield sse_event(
                "error",
                {
                    "status": 502,
                    "message": str(error),
                },
            )

        except Exception as error:
            print(
                "Unexpected streaming symptom checker error:",
                repr(error),
            )

            yield sse_event(
                "error",
                {
                    "status": 500,
                    "message": (
                        "An unexpected symptom-checker error occurred."
                    ),
                },
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )