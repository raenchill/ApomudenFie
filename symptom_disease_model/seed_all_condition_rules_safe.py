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
        help="Actually write to Firestore. Omit for preview.",
    )
    args = parser.parse_args()

    with open(
        args.csv,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as f:
        rows = list(csv.DictReader(f))

    db = initialize_firebase(args.service_account)

    prepared = []

    for row in rows:
        condition = (row.get("condition") or "").strip()

        if not condition:
            continue

        payload = {
            "condition": condition,
            "normalizedCondition": " ".join(
                condition.lower().replace("_", " ").replace("-", " ").split()
            ),
            "aliases": split_pipe(row.get("aliases", "")),
            "genericNames": split_pipe(row.get("genericNames", "")),
            "drugClasses": split_pipe(row.get("drugClasses", "")),
            "requiresClinicalReview": parse_bool(
                row.get("requiresClinicalReview", "")
            ),
            "requiresPrescription": parse_bool(
                row.get("requiresPrescription", "")
            ),
            "allowPharmacySearch": parse_bool(
                row.get("allowPharmacySearch", "")
            ),
            "isApproved": parse_bool(
                row.get("isApproved", "")
            ),
            "reviewPathway": (row.get("reviewPathway") or "").strip(),
            "reviewStatus": (row.get("reviewStatus") or "").strip(),
            "notes": (row.get("notes") or "").strip(),
            "source": "AidFidelis classifier rule registry",
        }

        prepared.append(
            (
                document_id(condition),
                payload,
            )
        )

    approved = sum(
        payload["isApproved"]
        for _, payload in prepared
    )

    print(f"Prepared {len(prepared)} Firestore rules.")
    print(f"Approved/active: {approved}")
    print(f"Disabled/unapproved: {len(prepared) - approved}")
    print()

    if not args.apply:
        print("PREVIEW ONLY. Firestore was not changed.")
        print("Run again with --apply after checking the counts.")
        return

    batch = db.batch()
    pending = 0
    total = 0

    for doc_id, payload in prepared:
        ref = db.collection(args.collection).document(doc_id)
        batch.set(ref, payload, merge=True)
        pending += 1
        total += 1

        if pending >= 400:
            batch.commit()
            batch = db.batch()
            pending = 0
            print(f"Committed {total} rules...")

    if pending:
        batch.commit()

    print()
    print(f"Saved {total} rules to {args.collection}.")
    print(f"Only {approved} rules are active because only they have isApproved=true.")


if __name__ == "__main__":
    main()
