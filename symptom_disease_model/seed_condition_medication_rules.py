from __future__ import annotations

import argparse
import csv
import re

import firebase_admin
from firebase_admin import credentials, firestore


def parse_bool(value: str) -> bool:
    return (value or "").strip().lower() in {
        "true", "1", "yes", "y"
    }


def split_pipe(value: str) -> list[str]:
    return [
        item.strip()
        for item in (value or "").split("|")
        if item.strip()
    ]


def document_id(condition: str) -> str:
    value = condition.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    return value.strip("_")


def initialize_firebase(service_account: str):
    if not firebase_admin._apps:
        firebase_admin.initialize_app(
            credentials.Certificate(service_account)
        )
    return firestore.client()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--service-account", required=True)
    parser.add_argument("--csv", required=True)
    parser.add_argument(
        "--collection",
        default="conditionMedicationRules",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually write to Firestore. Omit for preview only.",
    )
    args = parser.parse_args()

    with open(
        args.csv,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as f:
        rows = list(csv.DictReader(f))

    db = initialize_firebase(
        args.service_account
    )

    prepared = []

    for row in rows:
        condition = (row.get("condition") or "").strip()

        if not condition:
            continue

        payload = {
            "condition": condition,
            "normalizedCondition": " ".join(
                condition.lower().split()
            ),
            "aliases": split_pipe(
                row.get("aliases", "")
            ),
            "genericNames": split_pipe(
                row.get("genericNames", "")
            ),
            "drugClasses": split_pipe(
                row.get("drugClasses", "")
            ),
            "requiresClinicalReview": parse_bool(
                row.get(
                    "requiresClinicalReview",
                    ""
                )
            ),
            "requiresPrescription": parse_bool(
                row.get(
                    "requiresPrescription",
                    ""
                )
            ),
            "allowPharmacySearch": parse_bool(
                row.get(
                    "allowPharmacySearch",
                    ""
                )
            ),
            "isApproved": parse_bool(
                row.get(
                    "isApproved",
                    ""
                )
            ),
            "notes": (
                row.get("notes") or ""
            ).strip(),
            "source": "AidFidelis reviewed rule",
        }

        prepared.append(
            (
                document_id(condition),
                payload,
            )
        )

    print(
        f"Prepared {len(prepared)} condition rules."
    )
    print()

    for doc_id, payload in prepared:
        print(doc_id)
        print(payload)
        print()

    if not args.apply:
        print(
            "PREVIEW ONLY. Firestore was not changed."
        )
        print(
            "Run again with --apply when the rules look correct."
        )
        return

    batch = db.batch()

    for doc_id, payload in prepared:
        ref = db.collection(
            args.collection
        ).document(
            doc_id
        )

        batch.set(
            ref,
            payload,
            merge=True,
        )

    batch.commit()

    print(
        f"Saved {len(prepared)} rules to "
        f"{args.collection}."
    )


if __name__ == "__main__":
    main()