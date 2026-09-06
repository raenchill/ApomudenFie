from __future__ import annotations

import argparse
import csv
from typing import Any

from symptom_disease_model.inference import DiseaseClassifier


OUTPUT_COLUMNS = [
    "condition",
    "aliases",
    "genericNames",
    "drugClasses",
    "requiresClinicalReview",
    "requiresPrescription",
    "allowPharmacySearch",
    "isApproved",
    "notes",
]


# Preserve the rules you have already configured.
EXISTING_APPROVED_RULES: dict[str, dict[str, str]] = {
    "common cold": {
        "aliases": "Cold | Common cold",
        "genericNames": "Paracetamol",
        "drugClasses": "Analgesic / Antipyretic",
        "requiresClinicalReview": "false",
        "requiresPrescription": "false",
        "allowPharmacySearch": "true",
        "isApproved": "true",
        "notes": (
            "Reviewed supportive OTC pathway. "
            "Pharmacist review and contraindication screening still apply."
        ),
    },
    "tension headache": {
        "aliases": "Tension-type headache",
        "genericNames": "Paracetamol",
        "drugClasses": "Analgesic / Antipyretic",
        "requiresClinicalReview": "false",
        "requiresPrescription": "false",
        "allowPharmacySearch": "true",
        "isApproved": "true",
        "notes": (
            "Reviewed supportive OTC pathway. "
            "Pharmacist review and contraindication screening still apply."
        ),
    },
    "malaria": {
        "aliases": "",
        "genericNames": "Artemether/Lumefantrine",
        "drugClasses": "Antimalarial",
        "requiresClinicalReview": "true",
        "requiresPrescription": "true",
        "allowPharmacySearch": "true",
        "isApproved": "true",
        "notes": (
            "Clinical confirmation is required before treatment. "
            "Pharmacy discovery does not authorize treatment."
        ),
    },
    "bronchial asthma": {
        "aliases": "Asthma",
        "genericNames": "",
        "drugClasses": "",
        "requiresClinicalReview": "true",
        "requiresPrescription": "true",
        "allowPharmacySearch": "false",
        "isApproved": "false",
        "notes": (
            "No reviewed medicine mapping configured yet. "
            "Clinical assessment is required."
        ),
    },
}


def normalize(value: str) -> str:
    return " ".join(
        (value or "")
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .split()
    )


def _labels_from_mapping(mapping: Any) -> list[str]:
    if not isinstance(mapping, dict):
        return []

    values: list[str] = []

    # Hugging Face id2label usually looks like {0: "Malaria", 1: "..."}.
    for key, value in mapping.items():
        if isinstance(value, str) and value.strip():
            values.append(value.strip())
        elif isinstance(key, str) and key.strip():
            # label2id is the reverse mapping.
            values.append(key.strip())

    return values


def extract_classifier_labels(
    classifier: DiseaseClassifier,
) -> list[str]:
    """
    Try several common model/classifier layouts so this script works even
    if DiseaseClassifier changes internally.
    """
    candidates: list[str] = []

    # Common direct attributes.
    for attribute_name in (
        "labels",
        "class_names",
        "classes",
        "disease_names",
    ):
        value = getattr(
            classifier,
            attribute_name,
            None,
        )

        if isinstance(value, (list, tuple)):
            candidates.extend(
                str(item).strip()
                for item in value
                if str(item).strip()
            )

    # Direct mapping attributes.
    for attribute_name in (
        "id2label",
        "label2id",
    ):
        candidates.extend(
            _labels_from_mapping(
                getattr(
                    classifier,
                    attribute_name,
                    None,
                )
            )
        )

    # sklearn-style encoder.
    label_encoder = getattr(
        classifier,
        "label_encoder",
        None,
    )

    if label_encoder is not None:
        classes = getattr(
            label_encoder,
            "classes_",
            None,
        )

        if classes is not None:
            candidates.extend(
                str(item).strip()
                for item in classes
                if str(item).strip()
            )

    # Hugging Face model.config.id2label / label2id.
    model = getattr(
        classifier,
        "model",
        None,
    )

    config = getattr(
        model,
        "config",
        None,
    )

    if config is not None:
        candidates.extend(
            _labels_from_mapping(
                getattr(
                    config,
                    "id2label",
                    None,
                )
            )
        )

        if not candidates:
            candidates.extend(
                _labels_from_mapping(
                    getattr(
                        config,
                        "label2id",
                        None,
                    )
                )
            )

    # Remove generic labels such as LABEL_0 when meaningful labels also exist.
    cleaned: list[str] = []
    seen: set[str] = set()

    for label in candidates:
        label = str(label).strip()

        if not label:
            continue

        key = normalize(label)

        if key in seen:
            continue

        seen.add(key)
        cleaned.append(label)

    meaningful = [
        label
        for label in cleaned
        if not normalize(label).startswith(
            "label "
        )
        and not normalize(label).startswith(
            "label_"
        )
    ]

    return (
        meaningful
        if meaningful
        else cleaned
    )


def make_row(condition: str) -> dict[str, str]:
    existing = EXISTING_APPROVED_RULES.get(
        normalize(condition)
    )

    if existing:
        return {
            "condition": condition,
            **existing,
        }

    # New conditions start DISABLED.
    # Medicine mappings should only be added after review.
    return {
        "condition": condition,
        "aliases": "",
        "genericNames": "",
        "drugClasses": "",
        "requiresClinicalReview": "true",
        "requiresPrescription": "false",
        "allowPharmacySearch": "false",
        "isApproved": "false",
        "notes": (
            "Auto-created from the classifier label list. "
            "Review the clinical pathway and medicine mapping before approval."
        ),
    }


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Export every disease label supported by the AidFidelis "
            "classifier into a Firestore condition-rule CSV."
        )
    )

    parser.add_argument(
        "--output",
        default="all_condition_medication_rules.csv",
    )

    args = parser.parse_args()

    print(
        "Loading AidFidelis classifier..."
    )

    classifier = DiseaseClassifier()

    labels = extract_classifier_labels(
        classifier
    )

    if not labels:
        raise RuntimeError(
            "No disease labels could be extracted automatically. "
            "Send your inference.py file so the exporter can be adapted "
            "to your DiseaseClassifier structure."
        )

    labels = sorted(
        labels,
        key=lambda value: normalize(value),
    )

    rows = [
        make_row(label)
        for label in labels
    ]

    with open(
        args.output,
        "w",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=OUTPUT_COLUMNS,
        )

        writer.writeheader()
        writer.writerows(rows)

    enabled = sum(
        row["isApproved"] == "true"
        for row in rows
    )

    print()
    print(
        f"Found {len(labels)} classifier conditions."
    )
    print(
        f"Existing approved rules preserved: {enabled}"
    )
    print(
        f"Created: {args.output}"
    )
    print()
    print(
        "All newly discovered conditions are intentionally "
        "isApproved=false until reviewed."
    )


if __name__ == "__main__":
    main()