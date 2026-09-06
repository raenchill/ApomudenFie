from __future__ import annotations

"""
AidFidelis Firestore Medicine Enrichment Tool
==============================================

Purpose
-------
This script helps you enrich many existing Firestore medicine documents in bulk.

It DOES NOT invent diagnoses, indications, prescriptions, or treatment advice.

Workflow
--------
1. Export existing Firestore medicines to CSV.
2. Fill/review classification columns in the CSV:
   - genericName
   - drugClass
   - prescriptionRequired
   - otcEligible
   - activeIngredient
   - route
   - form
   - notes
3. Preview changes.
4. Apply approved changes back to Firestore in batches.

Why this approach?
------------------
Your Firestore already contains many medicines. Instead of editing every
document manually, this script gives you one spreadsheet-like CSV that can
be reviewed and then written back automatically.

IMPORTANT
---------
Use only classifications that have been reviewed by a pharmacist,
clinician, or trusted formulary/source for your deployment.
"""

import argparse
import csv
import os
from pathlib import Path
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore


DEFAULT_COLLECTION = "medicines"
DEFAULT_EXPORT_FILE = "aidfidelis_medicines_enrichment.csv"


# ------------------------------------------------------------
# FIREBASE INITIALIZATION
# ------------------------------------------------------------

def initialize_firebase(service_account_path: str):
    """
    Initialize Firebase Admin SDK using a service-account JSON file.

    Download from:
    Firebase Console -> Project Settings -> Service Accounts
    -> Generate new private key

    Keep that JSON file PRIVATE.
    Do not commit it to GitHub.
    """
    if firebase_admin._apps:
        return firestore.client()

    credential_path = Path(service_account_path)

    if not credential_path.exists():
        raise FileNotFoundError(
            f"Service account file not found: {credential_path}"
        )

    cred = credentials.Certificate(str(credential_path))

    firebase_admin.initialize_app(cred)

    return firestore.client()


# ------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------

def as_string(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip()


def as_bool_csv(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"

    text = as_string(value).lower()

    if text in {"true", "1", "yes", "y"}:
        return "true"

    if text in {"false", "0", "no", "n"}:
        return "false"

    return ""


def parse_optional_bool(value: str) -> bool | None:
    text = as_string(value).lower()

    if text in {"true", "1", "yes", "y"}:
        return True

    if text in {"false", "0", "no", "n"}:
        return False

    return None


def normalized_name(value: str) -> str:
    return " ".join(
        as_string(value)
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .split()
    )


# ------------------------------------------------------------
# EXPORT
# ------------------------------------------------------------

EXPORT_COLUMNS = [
    "documentId",
    "name",
    "existingCategory",
    "existingForm",
    "existingDosage",
    "existingManufacturer",
    "existingPharmacyName",
    "existingStock",
    "existingPrice",
    "existingIsApproved",
    "existingIsRejected",

    # Fields to review / enrich:
    "genericName",
    "activeIngredient",
    "drugClass",
    "prescriptionRequired",
    "otcEligible",
    "route",
    "form",
    "notes",

    # Control column:
    "approvedForImport",
]


def export_medicines(
    db,
    collection_name: str,
    output_file: str,
):
    docs = list(
        db.collection(collection_name).stream()
    )

    rows: list[dict[str, str]] = []

    for doc in docs:
        data = doc.to_dict() or {}

        rows.append(
            {
                "documentId": doc.id,
                "name": as_string(data.get("name")),
                "existingCategory": as_string(data.get("category")),
                "existingForm": as_string(data.get("form")),
                "existingDosage": as_string(data.get("dosage")),
                "existingManufacturer": as_string(data.get("manufacturer")),
                "existingPharmacyName": as_string(data.get("pharmacyName")),
                "existingStock": as_string(data.get("stock")),
                "existingPrice": as_string(data.get("price")),
                "existingIsApproved": as_bool_csv(data.get("isApproved")),
                "existingIsRejected": as_bool_csv(data.get("isRejected")),

                "genericName": as_string(data.get("genericName")),
                "activeIngredient": as_string(data.get("activeIngredient")),
                "drugClass": as_string(data.get("drugClass")),
                "prescriptionRequired": as_bool_csv(
                    data.get("prescriptionRequired")
                ),
                "otcEligible": as_bool_csv(
                    data.get("otcEligible")
                ),
                "route": as_string(data.get("route")),
                "form": as_string(
                    data.get("form")
                ),
                "notes": as_string(
                    data.get("classificationNotes")
                ),

                # Do NOT auto-approve records.
                "approvedForImport": "false",
            }
        )

    rows.sort(
        key=lambda row: normalized_name(
            row["name"]
        )
    )

    with open(
        output_file,
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=EXPORT_COLUMNS,
        )

        writer.writeheader()
        writer.writerows(rows)

    print(
        f"Exported {len(rows)} medicine documents "
        f"to: {output_file}"
    )

    print()
    print("Next:")
    print(
        "Open the CSV and review/fill the enrichment fields."
    )
    print(
        "Set approvedForImport=true ONLY for rows you want written back."
    )


# ------------------------------------------------------------
# PREVIEW
# ------------------------------------------------------------

WRITE_FIELDS = {
    "genericName": "genericName",
    "activeIngredient": "activeIngredient",
    "drugClass": "drugClass",
    "prescriptionRequired": "prescriptionRequired",
    "otcEligible": "otcEligible",
    "route": "route",
    "form": "form",
    "notes": "classificationNotes",
}


def build_firestore_update(
    row: dict[str, str],
) -> dict[str, Any]:
    update: dict[str, Any] = {}

    for csv_field, firestore_field in WRITE_FIELDS.items():
        value = as_string(
            row.get(csv_field, "")
        )

        if csv_field in {
            "prescriptionRequired",
            "otcEligible",
        }:
            parsed = parse_optional_bool(
                value
            )

            if parsed is not None:
                update[firestore_field] = parsed

            continue

        if value:
            update[firestore_field] = value

    return update


def load_approved_rows(
    csv_file: str,
) -> list[dict[str, str]]:
    approved: list[dict[str, str]] = []

    with open(
        csv_file,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        for row in reader:
            approved_flag = parse_optional_bool(
                row.get(
                    "approvedForImport",
                    "",
                )
            )

            if approved_flag is True:
                approved.append(row)

    return approved


def preview_import(
    csv_file: str,
):
    rows = load_approved_rows(
        csv_file
    )

    if not rows:
        print(
            "No rows have approvedForImport=true."
        )
        return

    print(
        f"{len(rows)} approved medicine records "
        "are ready for import."
    )
    print()

    for index, row in enumerate(
        rows[:25],
        start=1,
    ):
        update = build_firestore_update(
            row
        )

        print(
            f"{index}. {row.get('name', '')}"
        )
        print(
            f"   documentId: {row.get('documentId', '')}"
        )

        for key, value in update.items():
            print(
                f"   {key}: {value}"
            )

        print()

    if len(rows) > 25:
        print(
            f"... and {len(rows) - 25} more."
        )


# ------------------------------------------------------------
# APPLY TO FIRESTORE
# ------------------------------------------------------------

def apply_import(
    db,
    collection_name: str,
    csv_file: str,
    batch_size: int = 400,
):
    rows = load_approved_rows(
        csv_file
    )

    if not rows:
        print(
            "No rows have approvedForImport=true. Nothing to write."
        )
        return

    print(
        f"Preparing to update {len(rows)} Firestore medicine documents."
    )
    print()

    updated_count = 0
    skipped_count = 0

    batch = db.batch()
    operations_in_batch = 0

    for row in rows:
        document_id = as_string(
            row.get("documentId")
        )

        if not document_id:
            skipped_count += 1
            continue

        update = build_firestore_update(
            row
        )

        if not update:
            skipped_count += 1
            continue

        ref = db.collection(
            collection_name
        ).document(
            document_id
        )

        batch.update(
            ref,
            update,
        )

        operations_in_batch += 1
        updated_count += 1

        if operations_in_batch >= batch_size:
            batch.commit()

            print(
                f"Committed {updated_count} updates..."
            )

            batch = db.batch()
            operations_in_batch = 0

    if operations_in_batch > 0:
        batch.commit()

    print()
    print(
        f"Done. Updated: {updated_count}"
    )
    print(
        f"Skipped: {skipped_count}"
    )


# ------------------------------------------------------------
# OPTIONAL: BUILD UNIQUE MEDICINE MASTER LIST
# ------------------------------------------------------------

def export_unique_medicines(
    db,
    collection_name: str,
    output_file: str,
):
    """
    Useful when the same medicine exists once per pharmacy.

    This creates one row per unique normalized medicine name so you only
    classify the medicine once, not once per pharmacy.
    """
    docs = list(
        db.collection(collection_name).stream()
    )

    grouped: dict[str, dict[str, Any]] = {}

    for doc in docs:
        data = doc.to_dict() or {}

        name = as_string(
            data.get("name")
        )

        if not name:
            continue

        key = normalized_name(name)

        if key not in grouped:
            grouped[key] = {
                "medicineName": name,
                "documentCount": 0,
                "pharmacies": set(),
                "genericName": as_string(
                    data.get("genericName")
                ),
                "drugClass": as_string(
                    data.get("drugClass")
                ),
                "prescriptionRequired": as_bool_csv(
                    data.get(
                        "prescriptionRequired"
                    )
                ),
                "otcEligible": as_bool_csv(
                    data.get("otcEligible")
                ),
                "approvedForMapping": "false",
            }

        grouped[key][
            "documentCount"
        ] += 1

        pharmacy_name = as_string(
            data.get("pharmacyName")
        )

        if pharmacy_name:
            grouped[key][
                "pharmacies"
            ].add(
                pharmacy_name
            )

    fieldnames = [
        "medicineName",
        "documentCount",
        "pharmacyCount",
        "pharmacies",
        "genericName",
        "drugClass",
        "prescriptionRequired",
        "otcEligible",
        "approvedForMapping",
    ]

    with open(
        output_file,
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        for key in sorted(grouped):
            item = grouped[key]

            writer.writerow(
                {
                    "medicineName": item[
                        "medicineName"
                    ],
                    "documentCount": item[
                        "documentCount"
                    ],
                    "pharmacyCount": len(
                        item["pharmacies"]
                    ),
                    "pharmacies": " | ".join(
                        sorted(
                            item["pharmacies"]
                        )
                    ),
                    "genericName": item[
                        "genericName"
                    ],
                    "drugClass": item[
                        "drugClass"
                    ],
                    "prescriptionRequired": item[
                        "prescriptionRequired"
                    ],
                    "otcEligible": item[
                        "otcEligible"
                    ],
                    "approvedForMapping": item[
                        "approvedForMapping"
                    ],
                }
            )

    print(
        f"Exported {len(grouped)} unique medicine names "
        f"to: {output_file}"
    )


# ------------------------------------------------------------
# CLI
# ------------------------------------------------------------

def build_parser():
    parser = argparse.ArgumentParser(
        description=(
            "Bulk export/review/update AidFidelis Firestore medicines."
        )
    )

    parser.add_argument(
        "--service-account",
        required=True,
        help=(
            "Path to Firebase service-account JSON file."
        ),
    )

    parser.add_argument(
        "--collection",
        default=DEFAULT_COLLECTION,
        help=(
            f"Firestore collection name. Default: {DEFAULT_COLLECTION}"
        ),
    )

    subparsers = parser.add_subparsers(
        dest="command",
        required=True,
    )

    export_parser = subparsers.add_parser(
        "export",
        help="Export every medicine document for enrichment.",
    )

    export_parser.add_argument(
        "--output",
        default=DEFAULT_EXPORT_FILE,
    )

    unique_parser = subparsers.add_parser(
        "export-unique",
        help=(
            "Export one row per unique medicine name."
        ),
    )

    unique_parser.add_argument(
        "--output",
        default="aidfidelis_unique_medicines.csv",
    )

    preview_parser = subparsers.add_parser(
        "preview",
        help=(
            "Preview rows with approvedForImport=true."
        ),
    )

    preview_parser.add_argument(
        "--csv",
        required=True,
    )

    apply_parser = subparsers.add_parser(
        "apply",
        help=(
            "Write approved enrichment fields back to Firestore."
        ),
    )

    apply_parser.add_argument(
        "--csv",
        required=True,
    )

    apply_parser.add_argument(
        "--batch-size",
        type=int,
        default=400,
    )

    return parser


def main():
    parser = build_parser()

    args = parser.parse_args()

    db = initialize_firebase(
        args.service_account
    )

    if args.command == "export":
        export_medicines(
            db=db,
            collection_name=args.collection,
            output_file=args.output,
        )

        return

    if args.command == "export-unique":
        export_unique_medicines(
            db=db,
            collection_name=args.collection,
            output_file=args.output,
        )

        return

    if args.command == "preview":
        preview_import(
            csv_file=args.csv,
        )

        return

    if args.command == "apply":
        apply_import(
            db=db,
            collection_name=args.collection,
            csv_file=args.csv,
            batch_size=args.batch_size,
        )

        return


if __name__ == "__main__":
    main()