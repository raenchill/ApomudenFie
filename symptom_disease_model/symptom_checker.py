from __future__ import annotations

import os
from typing import Callable

from symptom_disease_model.gemini_explainer import explain
from symptom_disease_model.inference import DiseaseClassifier
from symptom_disease_model.medication_policy import build_medication_guidance
from symptom_disease_model.triage_questions import (
    assess_symptom_information,
    extract_answer_text,
    fallback_safety_guidance,
)


# ============================================================
# AidFidelis symptom-checker orchestration
# ------------------------------------------------------------
# Responsibilities:
# - Accept almost any user symptom description.
# - Route obvious greetings/general chat away from the medical flow.
# - Run dynamic triage and emergency screening first.
# - Build a clean classifier input from positive user findings only.
# - Preserve negative findings for the explanation/context layer.
# - Run the trained classifier.
# - Assess prediction confidence conservatively.
# - Ask for more information only through triage.py, never here.
# - Generate explanation and medication guidance after prediction.
# ============================================================


_classifier: DiseaseClassifier | None = None


def get_classifier() -> DiseaseClassifier:
    """
    Load the trained disease classifier once and reuse it.
    """
    global _classifier

    if _classifier is None:
        _classifier = DiseaseClassifier()

    return _classifier


def normalize_text(value: str) -> str:
    return " ".join((value or "").strip().lower().split())


def detect_message_intent(message: str) -> str:
    """
    Classify the incoming message before starting clinical triage.

    Categories:
    - greeting: simple greeting / assistant small talk
    - general_message: normal conversational response with no complaint
    - vague_health_report: user says they feel unwell but gives no symptom
    - health_report: an actual symptom/body complaint is present

    The key safety/usability rule is that triage only starts when there is
    evidence of a real symptom or bodily complaint.
    """
    normalized = normalize_text(message)

    if not normalized:
        return "general_message"

    greetings = {
        "hi",
        "hello",
        "hey",
        "hello there",
        "hey there",
        "good morning",
        "good afternoon",
        "good evening",
        "how are you",
        "how are you doing",
        "what can you do",
        "who are you",
    }

    if normalized in greetings:
        return "greeting"

    # Clearly positive / neutral conversational replies.
    positive_or_neutral_replies = {
        "i am good",
        "i'm good",
        "im good",
        "i am fine",
        "i'm fine",
        "im fine",
        "i am okay",
        "i'm okay",
        "im okay",
        "i am ok",
        "i'm ok",
        "im ok",
        "i am kinda good",
        "i'm kinda good",
        "im kinda good",
        "i feel good",
        "i feel fine",
        "i feel okay",
        "i feel ok",
        "doing good",
        "doing fine",
        "doing okay",
        "doing ok",
        "not bad",
        "pretty good",
        "quite good",
        "all good",
        "thank you",
        "thanks",
        "okay",
        "ok",
        "alright",
        "bye",
        "goodbye",
        "what is your name",
        "help",
    }

    if normalized in positive_or_neutral_replies:
        return "general_message"

    # Vague "I feel unwell" statements should NOT launch triage yet.
    vague_health_reports = {
        "i am not well",
        "i'm not well",
        "im not well",
        "i don't feel well",
        "i dont feel well",
        "i do not feel well",
        "i feel unwell",
        "i'm feeling unwell",
        "im feeling unwell",
        "i am feeling unwell",
        "i feel sick",
        "i am sick",
        "i'm sick",
        "im sick",
        "i feel bad",
        "i am feeling bad",
        "i'm feeling bad",
        "not feeling well",
        "not well",
        "feeling sick",
        "feeling unwell",
        "i dont feel good",
        "i don't feel good",
        "i do not feel good",
        "i feel terrible",
        "i feel awful",
    }

    if normalized in vague_health_reports:
        return "vague_health_report"

    # A broad but explicit set of symptom/body terms. These are not used to
    # diagnose anything; they only decide whether the message is specific
    # enough to begin triage.
    symptom_terms = (
        "fever",
        "temperature",
        "chills",
        "headache",
        "migraine",
        "pain",
        "ache",
        "cough",
        "sore throat",
        "runny nose",
        "congestion",
        "vomit",
        "vomiting",
        "nausea",
        "diarrhea",
        "diarrhoea",
        "rash",
        "itch",
        "itching",
        "blister",
        "dizzy",
        "dizziness",
        "weakness",
        "weak",
        "fatigue",
        "tired",
        "shortness of breath",
        "difficulty breathing",
        "breathless",
        "chest pain",
        "chest pressure",
        "stomach pain",
        "abdominal pain",
        "belly pain",
        "joint pain",
        "muscle pain",
        "body ache",
        "body pain",
        "swelling",
        "bleeding",
        "blood",
        "burning",
        "urination",
        "urine",
        "discharge",
        "yellow eyes",
        "yellow skin",
        "jaundice",
        "dark urine",
        "pale stool",
        "pale stools",
        "ear pain",
        "earache",
        "hearing",
        "eye pain",
        "red eye",
        "blurred vision",
        "vision",
        "leg pain",
        "arm pain",
        "back pain",
        "numbness",
        "tingling",
        "weight loss",
        "weight gain",
        "palpitations",
        "fainting",
        "fainted",
        "seizure",
        "seizures",
        "confusion",
        "constipation",
    )

    if any(term in normalized for term in symptom_terms):
        return "health_report"

    # Body-part + complaint phrasing catches unusual symptoms that may not
    # be in the explicit symptom-term list.
    body_parts = (
        "head",
        "eye",
        "eyes",
        "ear",
        "ears",
        "nose",
        "mouth",
        "throat",
        "neck",
        "chest",
        "stomach",
        "abdomen",
        "belly",
        "back",
        "arm",
        "arms",
        "hand",
        "hands",
        "leg",
        "legs",
        "knee",
        "knees",
        "ankle",
        "ankles",
        "foot",
        "feet",
        "skin",
        "groin",
        "penis",
        "vagina",
        "pelvis",
        "shoulder",
        "shoulders",
    )

    complaint_markers = (
        "hurts",
        "hurt",
        "painful",
        "swollen",
        "swelling",
        "itchy",
        "itching",
        "burning",
        "numb",
        "numbness",
        "tingling",
        "red",
        "sore",
        "weak",
        "heavy",
        "tight",
        "stiff",
        "strange",
        "different",
        "problem",
    )

    if (
        any(part in normalized for part in body_parts)
        and any(marker in normalized for marker in complaint_markers)
    ):
        return "health_report"

    # If we still do not have actual symptom evidence, keep it conversational
    # rather than launching triage.
    return "general_message"


def real_predictor(
    symptoms: str,
    top_k: int = 5,
    minimum_confidence: float = 0.03,
) -> list[dict]:
    """
    Run the trained model and return the strongest predictions.

    A slightly lower filtering threshold is useful for differential-style
    output because scores are often distributed across many disease classes.
    """
    classifier = get_classifier()

    raw_predictions = classifier.predict(
        text=symptoms,
        top_k=top_k,
    )

    predictions = [
        {
            "disease": str(disease),
            "confidence": float(confidence),
        }
        for disease, confidence in raw_predictions
        if float(confidence) >= minimum_confidence
    ]

    # Always preserve the strongest model result when the classifier
    # returned something, even if all scores are below the threshold.
    if not predictions and raw_predictions:
        disease, confidence = raw_predictions[0]

        predictions.append(
            {
                "disease": str(disease),
                "confidence": float(confidence),
            }
        )

    return predictions[:3]


def assess_prediction_confidence(
    predictions: list[dict],
) -> dict:
    """
    Provide a conservative interpretation of model scores.

    These values represent model confidence, not disease probability.
    """
    if not predictions:
        return {
            "level": "insufficient",
            "message": (
                "No usable prediction could be produced from the available "
                "symptom information."
            ),
        }

    top_score = float(predictions[0]["confidence"])

    second_score = (
        float(predictions[1]["confidence"])
        if len(predictions) > 1
        else 0.0
    )

    margin = top_score - second_score

    if top_score < 0.25:
        return {
            "level": "low",
            "message": (
                "The model found only a weak match to its learned symptom "
                "patterns. The result should be treated cautiously."
            ),
        }

    if top_score < 0.45 or margin < 0.10:
        return {
            "level": "uncertain",
            "message": (
                "Several conditions may fit the symptom pattern, or the "
                "strongest match is not sufficiently distinct."
            ),
        }

    return {
        "level": "higher",
        "message": (
            "One condition matched the model's learned symptom patterns "
            "more strongly than the alternatives. This is not a diagnosis."
        ),
    }


def is_negative_answer(answer: str) -> bool:
    """
    Detect statements describing symptoms/findings the user denies.

    Negative findings remain available to Gemini as clinical context, but
    are omitted from the disease-classifier text because many symptom-text
    classifiers do not understand negation reliably.
    """
    normalized = normalize_text(answer)

    if not normalized:
        return False

    negative_prefixes = (
        "no ",
        "not ",
        "never ",
        "without ",
        "none ",
        "i do not ",
        "i don't ",
        "i am not ",
        "i'm not ",
        "do not have ",
        "don't have ",
        "have not ",
        "haven't ",
        "not experiencing ",
        "not having ",
        "did not ",
        "didn't ",
    )

    if normalized.startswith(negative_prefixes):
        return True

    negative_phrases = (
        "no shortness of breath",
        "no chest pain",
        "no rash",
        "no stiff neck",
        "no confusion",
        "no light sensitivity",
        "not sensitive to light",
        "without light sensitivity",
        "no difficulty breathing",
        "no vomiting",
        "not vomiting",
        "no fever",
        "no bleeding",
        "no swelling",
        "no discharge",
        "no dizziness",
        "no weakness",
        "no numbness",
        "no diarrhea",
        "no diarrhoea",
        "able to keep fluids down",
        "can keep fluids down",
    )

    return any(
        phrase in normalized
        for phrase in negative_phrases
    )


def extract_clean_answers(
    previous_answers: list[str],
) -> list[str]:
    """
    Extract only the user's answer text from triage history.

    This avoids feeding strings such as:
      Question: Do you have a fever?
      Answer: No

    directly into the classifier.
    """
    return [
        answer.strip()
        for answer in extract_answer_text(previous_answers)
        if answer and answer.strip()
    ]


def build_combined_context(
    symptoms: str,
    duration: str | None,
    previous_answers: list[str],
) -> str:
    """
    Build the full context used by the explanation layer.

    Both positive and negative findings are retained here because they can
    be clinically meaningful when Gemini explains why conditions are more
    or less consistent with the user's report.
    """
    parts: list[str] = [symptoms.strip()]

    if duration and duration.strip():
        parts.append(
            f"Duration: {duration.strip()}"
        )

    answers = extract_clean_answers(previous_answers)

    if answers:
        parts.append(
            "Follow-up answers: "
            + "; ".join(answers)
        )

    return ". ".join(
        part for part in parts
        if part.strip()
    )


def build_classifier_input(
    symptoms: str,
    duration: str | None,
    previous_answers: list[str],
) -> str:
    """
    Build a cleaner text input for the trained symptom classifier.

    Only positive/affirmative follow-up findings are included.
    Negative findings are deliberately excluded to reduce false matches
    caused by models that treat 'no fever' as containing 'fever'.
    """
    parts: list[str] = [symptoms.strip()]

    if duration and duration.strip():
        parts.append(
            f"Symptoms have lasted {duration.strip()}"
        )

    answers = extract_clean_answers(previous_answers)

    positive_answers = [
        answer
        for answer in answers
        if not is_negative_answer(answer)
    ]

    if positive_answers:
        parts.extend(positive_answers)

    return ". ".join(
        part for part in parts
        if part.strip()
    )


def get_explanation_red_flags(
    explanation: dict,
) -> list[str]:
    """
    Safely obtain red flags returned by the explanation layer.
    """
    if not isinstance(explanation, dict):
        return []

    red_flags = explanation.get(
        "red_flags",
        [],
    )

    if not isinstance(red_flags, list):
        return []

    return [
        str(item).strip()
        for item in red_flags
        if str(item).strip()
    ]


def safe_explain(
    symptoms: str,
    predictions: list[dict],
) -> dict:
    """
    Run Gemini explanation without allowing a temporary LLM failure to
    break the core classifier response.

    The user still receives predictions if Gemini is unavailable.
    """
    fallback_guidance = fallback_safety_guidance()
    fallback_self_care = fallback_guidance["self_care"]
    fallback_red_flags = fallback_guidance["red_flags"]
    fallback_questions = fallback_guidance["follow_up_questions"]

    if os.getenv("ENABLE_GEMINI_EXPLANATION", "true").lower() != "true":
        return {
            "summary": (
                "The classifier produced possible symptom-pattern matches. "
                "Detailed AI explanation is disabled in fast mode."
            ),
            "possible_conditions": [
                {
                    "name": str(item.get("disease", "")),
                    "confidence": float(item.get("confidence", 0.0)),
                    "reason": "Returned by the trained symptom classifier.",
                }
                for item in predictions
            ],
            "self_care": fallback_self_care,
            "red_flags": fallback_red_flags,
            "follow_up_questions": fallback_questions,
            "recommended_action": (
                "Use these results as general information and seek "
                "professional assessment when appropriate."
            ),
            "disclaimer": "AidFidelis does not provide a medical diagnosis.",
        }

    try:
        result = explain(
            symptoms=symptoms,
            predictions=predictions,
        )

        if isinstance(result, dict):
            return result

    except Exception as exc:
        return {
            "summary": (
                "The disease classifier produced possible matches, but the "
                "AI explanation service was temporarily unavailable."
            ),
            "possible_conditions": [
                {
                    "name": str(item.get("disease", "")),
                    "confidence": float(item.get("confidence", 0.0)),
                    "reason": (
                        "Returned by the trained symptom classifier based on "
                        "the supplied symptom pattern."
                    ),
                }
                for item in predictions
            ],
            "self_care": fallback_self_care,
            "red_flags": fallback_red_flags,
            "follow_up_questions": fallback_questions,
            "recommended_action": (
                "Use the predictions only as general guidance and seek "
                "professional medical assessment if symptoms are severe, "
                "worsening, persistent, or concerning."
            ),
            "disclaimer": (
                "AidFidelis does not provide a medical diagnosis."
            ),
            "explanation_error": str(exc),
        }

    return {
        "summary": (
            "The disease classifier produced possible matches, but no "
            "structured explanation was returned."
        ),
        "possible_conditions": [],
        "self_care": fallback_self_care,
        "red_flags": fallback_red_flags,
        "follow_up_questions": fallback_questions,
        "recommended_action": (
            "Consider professional medical assessment if symptoms persist "
            "or worsen."
        ),
        "disclaimer": (
            "AidFidelis does not provide a medical diagnosis."
        ),
    }


def run_symptom_checker(
    symptoms: str,
    age: int | None = None,
    sex: str | None = None,
    duration: str | None = None,
    previous_answers: list[str] | None = None,
    prediction_function: Callable | None = None,
    contraindication_screen_complete: bool = False,
) -> dict:
    """
    Main AidFidelis symptom-checker workflow.

    Flow:
      1. Basic intent handling
      2. Dynamic triage / emergency screening
      3. Ask follow-up questions if needed
      4. Build classifier input from positive findings
      5. Run classifier
      6. Assess model confidence
      7. Generate explanation
      8. Generate controlled medication guidance

    All additional questioning is owned by triage_questions.py. This file
    never invents a separate follow-up loop.
    """
    symptoms = (symptoms or "").strip()
    previous_answers = previous_answers or []

    prediction_function = (
        prediction_function
        or real_predictor
    )

    if not symptoms:
        return {
            "status": "conversation",
            "message": (
                "Hello! I’m the AidFidelis health assistant. Tell me the "
                "main symptom or change you are experiencing."
            ),
        }

    intent = detect_message_intent(symptoms)

    if intent == "greeting":
        return {
            "status": "conversation",
            "message": (
                "Hello! I’m the AidFidelis health assistant. How are you "
                "feeling today?"
            ),
        }

    if intent == "general_message":
        return {
            "status": "conversation",
            "message": (
                "Got it. If there’s a health issue you want me to check, "
                "tell me the specific symptom or change you’ve noticed."
            ),
        }

    if intent == "vague_health_report":
        return {
            "status": "conversation",
            "message": (
                "I’m sorry you’re not feeling well. Tell me the specific "
                "symptom or symptoms you’re having, for example headache, "
                "fever, cough, abdominal pain, dizziness, rash, vomiting, "
                "weakness, or anything else you’ve noticed."
            ),
        }

    # --------------------------------------------------------
    # TRIAGE
    # --------------------------------------------------------
    triage_result = assess_symptom_information(
        symptoms=symptoms,
        age=age,
        sex=sex,
        duration=duration,
        previous_answers=previous_answers,
    )

    emergency_warning = triage_result.get(
        "emergency_warning"
    )

    if emergency_warning:
        return {
            "status": "urgent_attention",
            "message": (
                "A possible emergency warning sign was reported: "
                f"{emergency_warning}. Please seek urgent medical assessment "
                "rather than relying on the symptom checker."
            ),
            "warning": emergency_warning,
            "questions": [],
            "medication_guidance": build_medication_guidance(
                predictions=[],
                red_flags=[
                    str(emergency_warning)
                ],
                contraindication_screen_complete=False,
            ),
        }

    if not triage_result.get(
        "enough_information",
        False,
    ):
        return {
            "status": "needs_more_information",
            "message": triage_result.get(
                "reason",
                "A little more information may improve the symptom check.",
            ),
            "questions": triage_result.get(
                "questions",
                [],
            ),
        }

    # --------------------------------------------------------
    # BUILD CONTEXT
    # --------------------------------------------------------
    combined_symptoms = build_combined_context(
        symptoms=symptoms,
        duration=duration,
        previous_answers=previous_answers,
    )

    classifier_input = build_classifier_input(
        symptoms=symptoms,
        duration=duration,
        previous_answers=previous_answers,
    )

    # --------------------------------------------------------
    # CLASSIFICATION
    # --------------------------------------------------------
    predictions = prediction_function(
        classifier_input
    )

    # Normalize custom/test predictor output defensively.
    normalized_predictions: list[dict] = []

    for prediction in predictions or []:
        if isinstance(prediction, dict):
            disease = str(
                prediction.get("disease", "")
            ).strip()

            try:
                confidence = float(
                    prediction.get("confidence", 0.0)
                )
            except (TypeError, ValueError):
                confidence = 0.0

            if disease:
                normalized_predictions.append(
                    {
                        "disease": disease,
                        "confidence": confidence,
                    }
                )

    predictions = normalized_predictions[:3]

    if not predictions:
        return {
            "status": "unable_to_predict",
            "message": (
                "AidFidelis could not identify a useful symptom pattern from "
                "the available information. Consider professional medical "
                "assessment, especially if symptoms are persistent, severe, "
                "or worsening."
            ),
            "symptoms": combined_symptoms,
            "classifier_input": classifier_input,
            "predictions": [],
            "confidence_assessment": {
                "level": "insufficient",
                "message": (
                    "No usable disease prediction was produced."
                ),
            },
            "medication_guidance": build_medication_guidance(
                predictions=[],
                red_flags=[],
                contraindication_screen_complete=False,
            ),
        }

    confidence_assessment = assess_prediction_confidence(
        predictions
    )

    # --------------------------------------------------------
    # EXPLANATION
    # --------------------------------------------------------
    explanation = safe_explain(
        symptoms=combined_symptoms,
        predictions=predictions,
    )

    explanation_red_flags = get_explanation_red_flags(
        explanation
    )

    # --------------------------------------------------------
    # MEDICATION POLICY
    # --------------------------------------------------------
    # Emergency/red-flag symptoms actually reported by the user are already
    # handled by triage before reaching this point. Gemini's red_flags are
    # educational "watch for" warnings, so they must not block medication
    # discovery as though the user currently has them.
    medication_guidance = build_medication_guidance(
        predictions=predictions,
        red_flags=[],
        contraindication_screen_complete=(
            contraindication_screen_complete
        ),
    )

    return {
        "status": "completed",
        "symptoms": combined_symptoms,
        "classifier_input": classifier_input,
        "predictions": predictions,
        "confidence_assessment": confidence_assessment,
        "explanation": explanation,
        "medication_guidance": medication_guidance,
    }