from symptom_disease_model.medication_policy import (
    build_medication_guidance,
)


def print_test(title: str, predictions: list[dict]) -> None:
    result = build_medication_guidance(
        predictions=predictions,
        red_flags=[],
        contraindication_screen_complete=True,
    )

    print(f"\n{title}")
    print(result)


print_test(
    "Above threshold OTC condition",
    [
        {
            "disease": "Common Cold",
            "confidence": 0.86,
        }
    ],
)

print_test(
    "Below threshold",
    [
        {
            "disease": "Common Cold",
            "confidence": 0.64,
        }
    ],
)

print_test(
    "Prescription or clinical-review condition",
    [
        {
            "disease": "Malaria",
            "confidence": 0.93,
        }
    ],
)