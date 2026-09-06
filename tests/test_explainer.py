import json

from symptom_disease_model.gemini_explainer import explain


predictions = [
    {
        "disease": "Malaria",
        "confidence": 0.82,
    },
    {
        "disease": "Influenza",
        "confidence": 0.11,
    },
    {
        "disease": "Typhoid Fever",
        "confidence": 0.07,
    },
]

result = explain(
    symptoms="fever, headache and chills",
    predictions=predictions,
)

print(json.dumps(result, indent=2))