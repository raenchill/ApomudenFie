import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = "../original-model"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

model.eval()

text = "I have a severe cough and cold, along with a high fever and body aches. I also feel very fatigued and have a sore throat."

inputs = tokenizer(
    text,
    return_tensors="pt",
    truncation=True,
    padding=True
)

with torch.no_grad():
    outputs = model(**inputs)

probs = torch.softmax(outputs.logits, dim=1)[0]

top_k = torch.topk(probs, k=5)

print("\nTop Predictions\n")

for score, idx in zip(top_k.values, top_k.indices):
    disease = model.config.id2label[idx.item()]
    print(f"{disease:<25} {score.item()*100:.2f}%")