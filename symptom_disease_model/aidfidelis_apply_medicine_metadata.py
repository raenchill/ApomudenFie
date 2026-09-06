from __future__ import annotations

import argparse
import csv
import firebase_admin
from firebase_admin import credentials, firestore


def normalize_name(value: str) -> str:
    return " ".join(
        (value or "")
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .replace("/", " ")
        .split()
    )


def parse_bool(value: str):
    text = (value or "").strip().lower()
    if text in {"true", "1", "yes", "y"}:
        return True
    if text in {"false", "0", "no", "n"}:
        return False
    return None


def initialize_firebase(service_account: str):
    if not firebase_admin._apps:
        firebase_admin.initialize_app(
            credentials.Certificate(service_account)
        )
    return firestore.client()


def load_rows(path: str):
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def build_update(row: dict) -> dict:
    update = {}

    for csv_field, firestore_field in {
        "normalizedName": "normalizedName",
        "genericName": "genericName",
        "activeIngredient": "activeIngredient",
        "drugClass": "drugClass",
        "productType": "productType",
    }.items():
        value = (row.get(csv_field) or "").strip()
        if value:
            update[firestore_field] = value

    prescription = parse_bool(row.get("prescriptionRequired", ""))
    otc = parse_bool(row.get("otcEligible", ""))

    if prescription is not None:
        update["prescriptionRequired"] = prescription
    if otc is not None:
        update["otcEligible"] = otc

    update["classificationReviewStatus"] = (
        row.get("reviewStatus") or ""
    ).strip()

    return update


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--service-account", required=True)
    parser.add_argument("--csv", required=True)
    parser.add_argument("--collection", default="medicines")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    db = initialize_firebase(args.service_account)
    rows = [
        row for row in load_rows(args.csv)
        if parse_bool(row.get("approvedForImport", "")) is True
    ]

    docs = list(db.collection(args.collection).stream())
    planned = []

    for row in rows:
        key = normalize_name(row.get("medicineName", ""))
        update = build_update(row)

        for doc in docs:
            data = doc.to_dict() or {}
            if normalize_name(str(data.get("name", ""))) == key:
                planned.append((doc.reference, doc.id, data.get("name", ""), update))

    print(f"Approved unique products: {len(rows)}")
    print(f"Matching Firestore documents: {len(planned)}")
    print()

    for _, doc_id, name, update in planned:
        print(f"{name} [{doc_id}]")
        print(f"  -> {update}")

    if not args.apply:
        print()
        print("PREVIEW ONLY. No Firestore data was changed.")
        print("Run again with --apply after checking the preview.")
        return

    batch = db.batch()
    pending = 0
    total = 0

    for ref, _, _, update in planned:
        batch.update(ref, update)
        pending += 1
        total += 1

        if pending >= 400:
            batch.commit()
            batch = db.batch()
            pending = 0

    if pending:
        batch.commit()

    print()
    print(f"Updated {total} Firestore medicine documents successfully.")


if __name__ == "__main__":
    main()