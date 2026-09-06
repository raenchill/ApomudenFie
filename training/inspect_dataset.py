from pathlib import Path

import pandas as pd
from datasets import ClassLabel, load_dataset


DATASET_NAME = "duxprajapati/symptom-disease-dataset"
OUTPUT_FOLDER = Path("../data")


def main() -> None:
    OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)

    print("Downloading dataset...")
    dataset = load_dataset(DATASET_NAME)

    print("\nDataset structure:")
    print(dataset)

    first_split_name = next(iter(dataset.keys()))
    split_data = dataset[first_split_name]
    dataframe = split_data.to_pandas()

    print(f"\nInspecting split: {first_split_name}")
    print(f"Number of records: {len(dataframe)}")

    print("\nColumn names:")
    print(dataframe.columns.tolist())

    print("\nFirst five records:")
    print(dataframe.head().to_string())

    print("\nDataset features:")
    print(split_data.features)

    # Detect the numeric label column
    possible_label_columns = [
        "label",
        "disease",
        "diagnosis",
        "condition",
        "prognosis",
    ]

    label_column = next(
        (
            column
            for column in dataframe.columns
            if column.lower() in possible_label_columns
        ),
        None,
    )

    if label_column is None:
        print("\nNo label column was detected.")
        return

    print(f"\nDetected label column: {label_column}")

    label_feature = split_data.features[label_column]

    # Convert numeric labels into disease names when ClassLabel is available
    if isinstance(label_feature, ClassLabel):
        dataframe["disease_name"] = dataframe[label_column].apply(
            lambda label_id: label_feature.int2str(int(label_id))
        )

        disease_column = "disease_name"

        print("\nLabel mapping detected successfully.")
        print(f"Number of disease names: {label_feature.num_classes}")
    else:
        disease_column = label_column
        dataframe[disease_column] = (
            dataframe[disease_column]
            .astype(str)
            .str.strip()
        )

        print("\nThe label column does not use Hugging Face ClassLabel.")
        print("Using the original label values.")

    disease_counts = dataframe[disease_column].value_counts()

    print(f"\nUnique diseases: {dataframe[disease_column].nunique()}")

    print("\nTwenty most common diseases:")
    print(disease_counts.head(20).to_string())

    # Check for spaces and capitalization differences
    duplicate_groups = {}

    for disease in dataframe[disease_column].dropna().astype(str).unique():
        normalized = disease.strip().lower()
        duplicate_groups.setdefault(normalized, []).append(disease)

    suspicious_duplicates = {
        normalized: versions
        for normalized, versions in duplicate_groups.items()
        if len(set(versions)) > 1
    }

    print("\nPotential duplicate disease labels:")

    if suspicious_duplicates:
        for normalized, versions in suspicious_duplicates.items():
            print(f"{normalized}: {versions}")
    else:
        print("No case or spacing duplicates detected.")

    output_path = OUTPUT_FOLDER / "original_dataset.csv"
    dataframe.to_csv(output_path, index=False)

    print(f"\nDataset saved to:")
    print(output_path.resolve())


if __name__ == "__main__":
    main()