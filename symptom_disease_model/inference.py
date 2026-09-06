from __future__ import annotations

import os
from pathlib import Path
from typing import List, Tuple

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer


class DiseaseClassifier:
    def __init__(self, model_path: str | Path | None = None) -> None:
        configured_path = os.getenv("MODEL_PATH")
        base_path = model_path or configured_path or Path(__file__).resolve().parents[1] / "original-model"
        self.model_path = str(base_path)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
        self.model.eval()

    def predict(self, text: str, top_k: int = 5) -> List[Tuple[str, float]]:
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
        )

        with torch.no_grad():
            outputs = self.model(**inputs)

        probs = torch.softmax(outputs.logits, dim=1)[0]
        top_predictions = torch.topk(probs, k=min(top_k, len(probs)))

        results: List[Tuple[str, float]] = []
        for score, idx in zip(top_predictions.values, top_predictions.indices):
            label = self.model.config.id2label[idx.item()]
            results.append((label, float(score.item())))

        return results
