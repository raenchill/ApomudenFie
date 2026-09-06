from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from datasets import Dataset, DatasetDict, load_dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)


DATASET_NAME = "duxprajapati/symptom-disease-dataset"
MODEL_NAME = "distilbert-base-uncased"
OUTPUT_DIR = Path("improved-model")


def normalize_text(text: str) -> str:
    text = text or ""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text.lower()


def prepare_dataset(raw_dataset: Dataset, test_size: float = 0.1, seed: int = 42) -> tuple[DatasetDict, int]:
    df = raw_dataset.to_pandas()

    if "text" not in df.columns or "label" not in df.columns:
        raise ValueError("Expected 'text' and 'label' columns in the dataset")

    df["text"] = df["text"].fillna("").astype(str).apply(normalize_text)
    df["label"] = df["label"].astype(str).str.strip()

    label_mapping = {value: idx for idx, value in enumerate(sorted(df["label"].unique().tolist()))}
    df["label"] = df["label"].map(label_mapping)

    prepared = Dataset.from_pandas(df[["text", "label"]].copy())
    split_dataset = prepared.train_test_split(test_size=test_size, seed=seed)
    return split_dataset, len(label_mapping)


def compute_metrics(eval_pred: tuple[Any, Any]) -> dict[str, float]:
    predictions, labels = eval_pred
    preds = predictions.argmax(axis=1)
    accuracy = (preds == labels).mean()
    return {"accuracy": float(accuracy)}


def main() -> None:
    dataset = load_dataset(DATASET_NAME)
    raw_train = dataset["train"]
    prepared, num_labels = prepare_dataset(raw_train)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def tokenize(batch: dict[str, Any]) -> dict[str, Any]:
        tokenized = tokenizer(
            batch["text"],
            truncation=True,
            padding="max_length",
            max_length=512,
        )
        tokenized["labels"] = batch["label"]
        return tokenized

    tokenized_train = prepared["train"].map(tokenize, batched=True, remove_columns=["text", "label"])
    tokenized_eval = prepared["test"].map(tokenize, batched=True, remove_columns=["text", "label"])

    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=num_labels)

    training_args = TrainingArguments(
        output_dir=str(OUTPUT_DIR),
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        learning_rate=2e-5,
        weight_decay=0.01,
        logging_steps=10,
        save_strategy="epoch",
        eval_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        save_total_limit=1,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        compute_metrics=compute_metrics,
    )
    trainer.train()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(OUTPUT_DIR))
    tokenizer.save_pretrained(OUTPUT_DIR)


if __name__ == "__main__":
    main()
