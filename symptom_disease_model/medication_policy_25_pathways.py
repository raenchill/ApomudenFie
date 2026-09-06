from __future__ import annotations

import re
from typing import Literal, TypedDict

from symptom_disease_model.firestore_medication_rules import (
    get_condition_medication_rule,
)


# ============================================================
# AidFidelis Dynamic Medication Policy
# ------------------------------------------------------------
# IMPORTANT:
# - The AI classifier supplies the TOP predicted condition.
# - Firestore conditionMedicationRules decides whether that condition
#   has an APPROVED medication pathway.
# - This module does not hard-code disease names.
# - It does not diagnose or generate prescriptions.
# - It does not invent medicine names.
# - Pharmacy inventory is still searched by the frontend in Firestore.
# ============================================================


CONFIDENCE_THRESHOLD = 0.75
MINIMUM_TOP_TWO_MARGIN = 0.15


class MedicineOption(TypedDict):
    medicine_id: str
    generic_name: str
    purpose: str


class MedicationGuidance(TypedDict):
    eligible: bool

    guidance_type: Literal[
        "otc_options",
        "prescription_required",
        "professional_care",
        "urgent_attention",
        "pharmacist_review",
        "unsupported_condition",
        "uncertain_prediction",
    ]

    message: str
    medicines: list[MedicineOption]

    medicine_ids: list[str]
    medicine_names: list[str]

    search_pharmacies: bool
    allow_pharmacy_search: bool
    requires_prescription: bool
    requires_pharmacist_review: bool

    top_condition: str | None
    top_confidence: float
    confidence_margin: float


def safe_confidence(value: object) -> float:
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.0

    return max(
        0.0,
        min(1.0, confidence),
    )


def prediction_margin(
    predictions: list[dict],
) -> float:
    if not predictions:
        return 0.0

    first = safe_confidence(
        predictions[0].get(
            "confidence",
            0.0,
        )
    )

    second = (
        safe_confidence(
            predictions[1].get(
                "confidence",
                0.0,
            )
        )
        if len(predictions) > 1
        else 0.0
    )

    return max(
        0.0,
        first - second,
    )


def slugify(value: str) -> str:
    """
    Create a stable frontend policy key.

    This is NOT a Firestore medicine document ID.
    """
    normalized = (
        (value or "")
        .strip()
        .lower()
    )

    normalized = re.sub(
        r"[^a-z0-9]+",
        "_",
        normalized,
    )

    return normalized.strip("_")


def build_medicine_options(
    rule: dict,
) -> list[MedicineOption]:
    """
    Convert approved Firestore genericNames into the response shape
    already expected by AIBackendService.ts and SymptomChecker.tsx.

    The actual medicine documents, price, stock and pharmacy are resolved
    later from the Firestore `medicines` collection by the frontend.
    """
    generic_names = rule.get(
        "genericNames",
        [],
    )

    if not isinstance(
        generic_names,
        list,
    ):
        return []

    purpose_by_name = rule.get(
        "medicinePurposes",
        {},
    )

    if not isinstance(
        purpose_by_name,
        dict,
    ):
        purpose_by_name = {}

    options: list[MedicineOption] = []

    seen: set[str] = set()

    for item in generic_names:
        generic_name = str(
            item or ""
        ).strip()

        if not generic_name:
            continue

        key = generic_name.lower()

        if key in seen:
            continue

        seen.add(key)

        configured_purpose = str(
            purpose_by_name.get(
                generic_name,
                "",
            )
            or ""
        ).strip()

        purpose = (
            configured_purpose
            or (
                "Medicine option listed in the reviewed "
                "AidFidelis condition rule."
            )
        )

        options.append(
            {
                "medicine_id": slugify(
                    generic_name
                ),
                "generic_name": generic_name,
                "purpose": purpose,
            }
        )

    return options


def medicine_metadata(
    medicines: list[MedicineOption],
) -> tuple[list[str], list[str]]:
    medicine_ids = [
        item["medicine_id"]
        for item in medicines
        if item.get("medicine_id")
    ]

    medicine_names = [
        item["generic_name"]
        for item in medicines
        if item.get("generic_name")
    ]

    return (
        medicine_ids,
        medicine_names,
    )


def make_guidance(
    *,
    eligible: bool,
    guidance_type: Literal[
        "otc_options",
        "prescription_required",
        "professional_care",
        "urgent_attention",
        "pharmacist_review",
        "unsupported_condition",
        "uncertain_prediction",
    ],
    message: str,
    medicines: list[MedicineOption] | None,
    search_pharmacies: bool,
    requires_prescription: bool,
    requires_pharmacist_review: bool,
    top_condition: str | None,
    top_confidence: float,
    confidence_margin: float,
) -> MedicationGuidance:
    medicines = medicines or []

    medicine_ids, medicine_names = (
        medicine_metadata(
            medicines
        )
    )

    return {
        "eligible": eligible,
        "guidance_type": guidance_type,
        "message": message,
        "medicines": medicines,
        "medicine_ids": medicine_ids,
        "medicine_names": medicine_names,
        "search_pharmacies": (
            search_pharmacies
        ),
        "allow_pharmacy_search": (
            search_pharmacies
        ),
        "requires_prescription": (
            requires_prescription
        ),
        "requires_pharmacist_review": (
            requires_pharmacist_review
        ),
        "top_condition": top_condition,
        "top_confidence": top_confidence,
        "confidence_margin": (
            confidence_margin
        ),
    }


def build_medication_guidance(
    predictions: list[dict],
    red_flags: list[str] | None = None,
    contraindication_screen_complete: bool = False,
) -> MedicationGuidance:
    """
    Build medication/pharmacy guidance from the model's TOP prediction.

    Flow:
      1. Validate prediction
      2. Block actual reported red flags
      3. Require >= confidence threshold
      4. Require sufficient top-two margin
      5. Dynamically query Firestore conditionMedicationRules
      6. Use ONLY an approved Firestore rule
      7. Return its reviewed generic medicine names
      8. Frontend finds actual in-stock medicine documents/pharmacies

    No disease names or medicine mappings are hard-coded here.
    """
    red_flags = [
        str(item).strip()
        for item in (
            red_flags or []
        )
        if str(item).strip()
    ]

    if not predictions:
        return make_guidance(
            eligible=False,
            guidance_type=(
                "professional_care"
            ),
            message=(
                "No sufficiently reliable "
                "condition match was produced. "
                "Medication options cannot "
                "be displayed."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=None,
            top_confidence=0.0,
            confidence_margin=0.0,
        )

    top_prediction = predictions[0]

    top_condition = str(
        top_prediction.get(
            "disease",
            "",
        )
    ).strip()

    top_confidence = safe_confidence(
        top_prediction.get(
            "confidence",
            0.0,
        )
    )

    margin = prediction_margin(
        predictions
    )

    # --------------------------------------------------------
    # 1. ACTUAL REPORTED RED FLAGS OVERRIDE EVERYTHING
    # --------------------------------------------------------
    if red_flags:
        return make_guidance(
            eligible=False,
            guidance_type=(
                "urgent_attention"
            ),
            message=(
                "Possible warning signs are "
                "currently present. Medication "
                "shopping is unavailable; urgent "
                "medical assessment should take "
                "priority."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=(
                top_condition or None
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    # --------------------------------------------------------
    # 2. CONFIDENCE GATE
    # --------------------------------------------------------
    if (
        top_confidence
        < CONFIDENCE_THRESHOLD
    ):
        return make_guidance(
            eligible=False,
            guidance_type=(
                "professional_care"
            ),
            message=(
                f"The model score is below "
                f"{int(CONFIDENCE_THRESHOLD * 100)}%. "
                "AidFidelis will not open the "
                "medicine pathway from this result."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=(
                top_condition or None
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    # --------------------------------------------------------
    # 3. DIFFERENTIAL / MARGIN GATE
    # --------------------------------------------------------
    if (
        len(predictions) > 1
        and margin
        < MINIMUM_TOP_TWO_MARGIN
    ):
        return make_guidance(
            eligible=False,
            guidance_type=(
                "uncertain_prediction"
            ),
            message=(
                "The leading conditions have "
                "similar model scores. Medicine "
                "options are withheld until the "
                "result is clearer or reviewed "
                "professionally."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=(
                top_condition or None
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    # --------------------------------------------------------
    # 4. DYNAMIC FIRESTORE RULE LOOKUP
    # --------------------------------------------------------
    try:
        rule = (
            get_condition_medication_rule(
                top_condition
            )
        )
    except Exception as error:
        print(
            "Medication rule lookup failed:",
            repr(error),
        )

        return make_guidance(
            eligible=False,
            guidance_type=(
                "professional_care"
            ),
            message=(
                "The medication-rule service "
                "could not be reached. The "
                "prediction is still available, "
                "but medicine recommendations "
                "are temporarily unavailable."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=(
                top_condition or None
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    if not rule:
        return make_guidance(
            eligible=False,
            guidance_type=(
                "professional_care"
            ),
            message=(
                "AidFidelis does not currently "
                "have an approved reviewed "
                "medication rule for this possible "
                "condition. Please consult a "
                "pharmacist or healthcare "
                "professional."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=(
                top_condition or None
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    resolved_condition = str(
        rule.get(
            "condition",
            top_condition,
        )
        or top_condition
    ).strip()

    review_pathway = str(
        rule.get(
            "reviewPathway",
            "",
        )
        or ""
    ).strip().lower()

    medicines = (
        build_medicine_options(
            rule
        )
    )

    # Firestore can explicitly mark a reviewed emergency/no-shopping pathway.
    if review_pathway == "urgent_no_shopping":
        return make_guidance(
            eligible=False,
            guidance_type="urgent_attention",
            message=(
                "This reviewed condition pathway requires urgent medical "
                "assessment. Medicine shopping is not available from the "
                "symptom-checker result."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=resolved_condition,
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    # Reviewed conditions can intentionally have no medicine-shopping pathway.
    if review_pathway == "no_medicine_mapping":
        return make_guidance(
            eligible=False,
            guidance_type="professional_care",
            message=(
                "This condition has a reviewed AidFidelis pathway, but "
                "automatic medicine shopping is not appropriate for it. "
                "Professional assessment is recommended."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=resolved_condition,
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    requires_clinical_review = bool(
        rule.get(
            "requiresClinicalReview",
            False,
        )
    )

    requires_prescription = bool(
        rule.get(
            "requiresPrescription",
            False,
        )
    )

    allow_pharmacy_search = bool(
        rule.get(
            "allowPharmacySearch",
            False,
        )
    )

    # --------------------------------------------------------
    # 5. CLINICAL / PRESCRIPTION PATHWAY
    # --------------------------------------------------------
    if (
        requires_clinical_review
        or requires_prescription
    ):
        # A reviewed rule may explicitly allow pharmacy discovery,
        # but the frontend must still display that clinical/prescription
        # review is required.
        can_search = (
            allow_pharmacy_search
            and bool(medicines)
        )

        return make_guidance(
            eligible=False,
            guidance_type=(
                "prescription_required"
                if requires_prescription
                else "pharmacist_review"
            ),
            message=(
                "This reviewed condition pathway "
                "requires clinical or pharmacist "
                "review before treatment. "
                + (
                    "Participating pharmacies may "
                    "be searched for the reviewed "
                    "medicine options."
                    if can_search
                    else
                    "If treatment is prescribed, "
                    "use the prescription-upload "
                    "flow to continue."
                )
            ),
            medicines=(
                medicines
                if can_search
                else []
            ),
            search_pharmacies=can_search,
            requires_prescription=(
                requires_prescription
            ),
            requires_pharmacist_review=True,
            top_condition=(
                resolved_condition
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    # --------------------------------------------------------
    # 6. NO MEDICINES IN THE APPROVED RULE
    # --------------------------------------------------------
    if not medicines:
        return make_guidance(
            eligible=False,
            guidance_type=(
                "professional_care"
            ),
            message=(
                "The condition rule is approved, "
                "but no reviewed medicine options "
                "are currently configured."
            ),
            medicines=[],
            search_pharmacies=False,
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=(
                resolved_condition
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    # --------------------------------------------------------
    # 7. OPTIONAL CONTRAINDICATION / PHARMACIST SCREEN
    # --------------------------------------------------------
    if not contraindication_screen_complete:
        return make_guidance(
            eligible=False,
            guidance_type=(
                "pharmacist_review"
            ),
            message=(
                "Reviewed supportive medicine "
                "options are available. You may "
                "check participating pharmacies, "
                "but allergies, current medicines "
                "and relevant health conditions "
                "should be reviewed before use."
            ),
            medicines=medicines,
            search_pharmacies=(
                allow_pharmacy_search
            ),
            requires_prescription=False,
            requires_pharmacist_review=True,
            top_condition=(
                resolved_condition
            ),
            top_confidence=top_confidence,
            confidence_margin=margin,
        )

    # --------------------------------------------------------
    # 8. APPROVED NON-PRESCRIPTION PATHWAY
    # --------------------------------------------------------
    return make_guidance(
        eligible=True,
        guidance_type="otc_options",
        message=(
            "Reviewed supportive medicine "
            "options may be displayed. Follow "
            "the product label and obtain "
            "professional advice if symptoms "
            "persist, worsen, or new warning "
            "signs develop."
        ),
        medicines=medicines,
        search_pharmacies=(
            allow_pharmacy_search
        ),
        requires_prescription=False,
        requires_pharmacist_review=True,
        top_condition=(
            resolved_condition
        ),
        top_confidence=top_confidence,
        confidence_margin=margin,
    )
