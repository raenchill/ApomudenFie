from symptom_disease_model.triage_questions import generate_followup_questions

response = generate_followup_questions(
    "fever, headache"
)

print(response)