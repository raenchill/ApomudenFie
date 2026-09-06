from __future__ import annotations

import json
import os
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter


DEFAULT_COLLECTION = "conditionMedicationRules"
FIRESTORE_LOOKUP_TIMEOUT_SECONDS = 10


def normalize_condition(value: str) -> str:
    return " ".join(
        (value or "")
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .split()
    )


@lru_cache(maxsize=1)
def get_firestore_client():
    """
    Reuse Firebase Admin across symptom-check requests.

    Set this in your backend .env:

    FIREBASE_SERVICE_ACCOUNT_PATH=apomudenfie-new-firebase-adminsdk-fbsvc-2a45f52181.json
    """
    if not firebase_admin._apps:
        service_account = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT_PATH",
            "",
        ).strip()
        service_account_json = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT_JSON",
            "",
        ).strip()

        if not service_account and not service_account_json:
            raise RuntimeError(
                "Firebase credentials are missing. Set "
                "FIREBASE_SERVICE_ACCOUNT_PATH or "
                "FIREBASE_SERVICE_ACCOUNT_JSON."
            )

        if service_account_json:
            try:
                certificate = json.loads(service_account_json)
            except json.JSONDecodeError as error:
                raise RuntimeError(
                    "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON."
                ) from error
        else:
            if not os.path.exists(service_account):
                raise RuntimeError(
                    "Firebase service-account file was not found at: "
                    f"{service_account}"
                )
            certificate = service_account

        firebase_admin.initialize_app(
            credentials.Certificate(certificate)
        )

    return firestore.client()


@lru_cache(maxsize=256)
def get_condition_medication_rule(
    predicted_condition: str,
    collection_name: str = DEFAULT_COLLECTION,
) -> dict | None:
    """
    Dynamically resolve the model's predicted condition.

    Only Firestore rules with isApproved == true are eligible.
    """
    db = get_firestore_client()

    wanted = normalize_condition(
        predicted_condition
    )

    if not wanted:
        return None

    docs = (
        db.collection(collection_name)
        .where(
            filter=FieldFilter(
                "isApproved",
                "==",
                True,
            )
        )
        .stream(timeout=FIRESTORE_LOOKUP_TIMEOUT_SECONDS)
    )

    for doc in docs:
        data = doc.to_dict() or {}

        aliases = (
            data.get("aliases")
            if isinstance(
                data.get("aliases"),
                list,
            )
            else []
        )

        candidates = [
            data.get(
                "normalizedCondition",
                "",
            ),
            data.get(
                "condition",
                "",
            ),
            *aliases,
        ]

        if any(
            normalize_condition(
                str(candidate)
            )
            == wanted
            for candidate in candidates
        ):
            return {
                "id": doc.id,
                **data,
            }

    return None


def clear_rule_cache():
    """
    Useful after editing rules during development.
    """
    get_condition_medication_rule.cache_clear()