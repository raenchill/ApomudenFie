from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable


# ============================================================
# AidFidelis dynamic triage engine
# ------------------------------------------------------------
# Goals:
# - Ask useful follow-up questions for ANY symptom description.
# - Use symptom-specific questions when a body-system pattern matches.
# - Fall back to universal clinical-history questions when it does not.
# - Never repeat a question that has already been asked/answered.
# - Detect obvious emergency warning signs before ordinary questioning.
# - Avoid endless questioning: maximum two rounds, four questions per round.
#
# IMPORTANT:
# This module supports triage/history collection. It does not diagnose.
# ============================================================


MAX_QUESTIONS_PER_ROUND = 4
MAX_FOLLOWUP_ROUNDS = 2


@dataclass(frozen=True)
class TriageRule:
    keywords: tuple[str, ...]
    questions: tuple[str, ...]


UNIVERSAL_QUESTIONS = (
    "How long have you had these symptoms?",
    "How severe are your symptoms on a scale of 1 to 10?",
    "Did the symptoms start suddenly or gradually, and are they getting better, worse, or staying the same?",
    "Are you experiencing any other symptoms that started around the same time?",
)


SAFETY_QUESTIONS = (
    "Are you having severe difficulty breathing, severe chest pain, fainting, confusion, or a seizure?",
    "Are you bleeding heavily, vomiting blood, passing black or bloody stool, or unable to keep fluids down?",
)


# Body-system rules. These improve relevance, while UNIVERSAL_QUESTIONS
# ensure the engine still works for symptoms not listed here.
SYMPTOM_RULES = (
    TriageRule(
        keywords=("fever", "temperature", "chills", "hot body"),
        questions=(
            "What is your highest measured temperature, if you have checked it?",
            "Do you have chills, sweating, severe weakness, body aches, vomiting, or a new rash?",
            "Have you recently travelled, had mosquito exposure, or been around someone who was ill?",
        ),
    ),
    TriageRule(
        keywords=("headache", "head pain", "migraine"),
        questions=(
            "Where is the headache located, and what does the pain feel like?",
            "Do you have a stiff neck, sensitivity to light, vomiting, vision changes, weakness, or numbness?",
            "Was the headache sudden and extremely severe, or is it different from headaches you have had before?",
        ),
    ),
    TriageRule(
        keywords=("cough", "sore throat", "runny nose", "congestion", "cold", "flu"),
        questions=(
            "Is the cough dry or producing mucus, and if so what color is the mucus?",
            "Do you have fever, sore throat, runny nose, wheezing, or shortness of breath?",
            "Are you coughing up blood or having pain when you breathe?",
        ),
    ),
    TriageRule(
        keywords=("shortness of breath", "difficulty breathing", "breathless", "breathing problem"),
        questions=(
            "Did the breathing difficulty start suddenly or gradually?",
            "Is it present at rest, and can you speak in full sentences without stopping for breath?",
            "Do you also have chest pain, wheezing, fever, cough, leg swelling, or bluish lips?",
        ),
    ),
    TriageRule(
        keywords=("chest pain", "chest pressure", "chest tightness", "chest discomfort"),
        questions=(
            "Where exactly is the chest pain, and does it spread to your arm, back, neck, or jaw?",
            "What does the pain feel like: pressure, squeezing, burning, sharp, or something else?",
            "Does it happen with activity, breathing, eating, or movement, and do you have sweating, nausea, or shortness of breath?",
        ),
    ),
    TriageRule(
        keywords=("abdominal pain", "stomach pain", "belly pain", "tummy pain", "abdomen"),
        questions=(
            "Where exactly is the abdominal pain: upper, lower, right, left, or around the middle?",
            "Is the pain constant or does it come and go, and does eating make it better or worse?",
            "Do you have vomiting, diarrhea, constipation, fever, abdominal swelling, jaundice, or blood in your stool?",
        ),
    ),
    TriageRule(
        keywords=("vomit", "vomiting", "nausea", "diarrhea", "diarrhoea"),
        questions=(
            "How many times have you vomited or had diarrhea in the past 24 hours?",
            "Are you able to drink and keep fluids down?",
            "Do you have severe abdominal pain, fever, blood in vomit or stool, dizziness, or very little urine?",
        ),
    ),
    TriageRule(
        keywords=("rash", "spots", "itch", "itching", "blister", "blisters", "skin"),
        questions=(
            "Where on your body is the skin problem, and when did it start?",
            "Is it itchy, painful, spreading, blistering, swollen, or bleeding?",
            "Did you recently start a medicine, use a new product, eat a new food, or have an insect bite?",
        ),
    ),
    TriageRule(
        keywords=("yellow eyes", "yellow skin", "jaundice", "dark urine", "pale stool", "pale stools"),
        questions=(
            "When did you first notice the yellowing, dark urine, or pale stools?",
            "Do you have right upper abdominal pain, fever, nausea, vomiting, itching, or loss of appetite?",
            "Have you recently taken new medicines or herbal products, consumed heavy alcohol, travelled, or had possible exposure to hepatitis?",
        ),
    ),
    TriageRule(
        keywords=("urine", "urinating", "urination", "pee", "burning urine", "dysuria", "frequency"),
        questions=(
            "Do you have burning or pain when urinating, and are you urinating more often than usual?",
            "Have you noticed blood, unusual color, strong smell, or discharge?",
            "Do you have fever, back or side pain, lower abdominal pain, or difficulty passing urine?",
        ),
    ),
    TriageRule(
        keywords=("discharge", "genital", "penis", "vagina", "vaginal"),
        questions=(
            "What color and consistency is the discharge, and does it have an unusual smell?",
            "Do you have pain or burning when urinating, itching, sores, blisters, or pelvic or testicular pain?",
            "When did it start, and have you had any recent sexual exposure that may be relevant?",
        ),
    ),
    TriageRule(
        keywords=("ear pain", "earache", "ear discharge", "hearing"),
        questions=(
            "Which ear is affected, and when did the problem start?",
            "Do you have ear discharge, reduced hearing, ringing, dizziness, fever, or swelling around the ear?",
            "Does touching or pulling the outer ear make the pain worse?",
        ),
    ),
    TriageRule(
        keywords=("eye pain", "red eye", "eye redness", "vision", "blurred vision", "eye discharge"),
        questions=(
            "Is one eye or both eyes affected, and when did the problem start?",
            "Do you have blurred or reduced vision, severe eye pain, light sensitivity, discharge, or swelling?",
            "Did you recently injure the eye, get something in it, or start using new eye products or contact lenses?",
        ),
    ),
    TriageRule(
        keywords=("joint pain", "knee pain", "ankle pain", "wrist pain", "elbow pain", "arthritis"),
        questions=(
            "Which joint is affected, and did the pain start after an injury or gradually?",
            "Is the joint swollen, red, warm, stiff, or difficult to move?",
            "Do you also have fever, rash, weakness, or pain in other joints?",
        ),
    ),
    TriageRule(
        keywords=("leg pain", "arm pain", "muscle pain", "body pain", "body aches"),
        questions=(
            "Where exactly is the pain, and did it begin after an injury or unusual activity?",
            "Is there swelling, redness, warmth, weakness, numbness, or tingling?",
            "Does movement make the pain worse, and can you use the affected limb normally?",
        ),
    ),
    TriageRule(
        keywords=("back pain", "lower back", "upper back"),
        questions=(
            "Where exactly is the back pain, and did it start after an injury, lifting, or gradually?",
            "Does the pain travel into your leg, and do you have weakness, numbness, or tingling?",
            "Do you have fever, loss of bladder or bowel control, or numbness around the groin area?",
        ),
    ),
    TriageRule(
        keywords=("dizzy", "dizziness", "lightheaded", "vertigo"),
        questions=(
            "Does it feel like the room is spinning, or more like you might faint?",
            "When does the dizziness happen, and is it triggered by standing up or moving your head?",
            "Do you have fainting, severe headache, weakness, numbness, chest pain, hearing changes, or vomiting?",
        ),
    ),
    TriageRule(
        keywords=("fatigue", "tired", "weakness", "weak", "low energy"),
        questions=(
            "How long have you felt unusually tired or weak, and is it getting worse?",
            "Do you have fever, weight loss, shortness of breath, dizziness, palpitations, pain, or changes in appetite?",
            "Has your sleep, diet, medication use, or usual activity changed recently?",
        ),
    ),
    TriageRule(
        keywords=("swelling", "swollen", "edema", "oedema"),
        questions=(
            "Where is the swelling, and is it on one side or both sides?",
            "Is the area painful, red, warm, or tender?",
            "Do you also have shortness of breath, chest pain, fever, reduced urine, or recent injury?",
        ),
    ),
    TriageRule(
        keywords=("weight loss", "losing weight", "weight gain"),
        questions=(
            "How much weight have you gained or lost, and over what period?",
            "Has your appetite changed, and are you eating normally?",
            "Do you have fever, night sweats, diarrhea, excessive thirst, frequent urination, or unusual fatigue?",
        ),
    ),
)


# Extra generic questions used when the complaint does not match
# any predefined body-system rule.
GENERIC_FALLBACK_QUESTIONS = (
    "Where in your body do you feel the main symptom, if it has a specific location?",
    "What does the symptom feel like, and what makes it better or worse?",
    "Have you noticed fever, swelling, bleeding, weakness, numbness, vomiting, breathing difficulty, or any other new change?",
    "Did anything happen before it started, such as an injury, new medicine, new food, travel, illness exposure, or unusual activity?",
)


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def contains_any(text: str, phrases: Iterable[str]) -> bool:
    return any(normalize_text(phrase) in text for phrase in phrases)


def extract_answer_text(previous_answers: list[str]) -> list[str]:
    """
    Extract user answers while supporting either:
      "Question: ... Answer: ..."
    or plain answer strings.
    """
    extracted: list[str] = []

    for entry in previous_answers or []:
        stripped = (entry or "").strip()
        if not stripped:
            continue

        lower = stripped.lower()

        if "answer:" in lower:
            idx = lower.find("answer:")
            answer = stripped[idx + len("answer:"):].strip()
            if answer:
                extracted.append(answer)
        else:
            extracted.append(stripped)

    return extracted


def extract_asked_questions(previous_answers: list[str]) -> list[str]:
    """
    Extract question text from entries formatted as:
       Question: ...
       Answer: ...
    """
    questions: list[str] = []

    for entry in previous_answers or []:
        text = (entry or "").strip()
        lower = text.lower()

        if "question:" not in lower:
            continue

        q_start = lower.find("question:") + len("question:")
        a_start = lower.find("answer:")

        if a_start > q_start:
            question = text[q_start:a_start].strip()
        else:
            question = text[q_start:].strip()

        if question:
            questions.append(question)

    return questions


def build_user_context(
    symptoms: str,
    previous_answers: list[str],
) -> str:
    answers = extract_answer_text(previous_answers)

    return normalize_text(
        " ".join(
            part for part in [symptoms, *answers]
            if part and part.strip()
        )
    )


def has_duration_information(text: str) -> bool:
    patterns = (
        r"\b(?:for|since)\s+(?:about\s+)?(?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+"
        r"(?:minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\b",
        r"\b(?:today|yesterday|last night|this morning|this afternoon|this evening)\b",
        r"\bstarted\s+(?:today|yesterday|last night|this morning|this afternoon|this evening)\b",
        r"\bstarted\s+(?:about\s+)?(?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+"
        r"(?:minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\s+ago\b",
    )

    return any(re.search(pattern, text) for pattern in patterns)


def has_severity_information(text: str) -> bool:
    if re.search(r"\b(?:[0-9]|10)\s*(?:/|out of)\s*10\b", text):
        return True

    return contains_any(
        text,
        (
            "mild",
            "slight",
            "moderate",
            "severe",
            "very severe",
            "extreme",
            "unbearable",
            "intense",
            "getting worse",
            "worsening",
        ),
    )


def has_onset_or_progression_information(text: str) -> bool:
    return contains_any(
        text,
        (
            "sudden",
            "suddenly",
            "gradual",
            "gradually",
            "getting worse",
            "worsening",
            "getting better",
            "improving",
            "staying the same",
            "unchanged",
        ),
    )


def question_was_previously_asked(
    question: str,
    previous_answers: list[str],
) -> bool:
    normalized = normalize_text(question)

    for previous_question in extract_asked_questions(previous_answers):
        if normalize_text(previous_question) == normalized:
            return True

    # Backward compatibility for previous_answers containing the whole
    # question/answer text in a less structured form.
    history = normalize_text(" ".join(previous_answers or []))

    if normalized and normalized in history:
        return True

    important_words = [
        word
        for word in re.findall(r"[a-z]+", normalized)
        if len(word) >= 6
        and word not in {
            "symptoms",
            "experiencing",
            "started",
            "having",
            "around",
        }
    ]

    if not important_words:
        return False

    matches = sum(word in history for word in important_words)
    return matches >= min(4, len(important_words))


def estimated_round(previous_answers: list[str]) -> int:
    """
    Estimate how many completed follow-up rounds exist.

    Structured frontend entries are preferred. If only plain answers are
    supplied, four answers are treated as approximately one round.
    """
    if not previous_answers:
        return 0

    asked = extract_asked_questions(previous_answers)

    if asked:
        return min(
            MAX_FOLLOWUP_ROUNDS,
            (len(asked) + MAX_QUESTIONS_PER_ROUND - 1)
            // MAX_QUESTIONS_PER_ROUND,
        )

    answer_count = len(extract_answer_text(previous_answers))

    if answer_count == 0:
        return 0

    if answer_count <= MAX_QUESTIONS_PER_ROUND:
        return 1

    return 2


def remove_common_negative_emergency_phrases(text: str) -> str:
    """
    Prevent simple statements such as 'no chest pain' from triggering
    emergency keyword matching.

    This is deliberately conservative and is not a full clinical negation
    parser.
    """
    phrases = (
        "no difficulty breathing",
        "not having difficulty breathing",
        "not experiencing difficulty breathing",
        "do not have difficulty breathing",
        "don't have difficulty breathing",
        "no trouble breathing",
        "no shortness of breath",
        "not short of breath",
        "no severe chest pain",
        "no chest pain",
        "do not have chest pain",
        "don't have chest pain",
        "not confused",
        "no confusion",
        "no seizure",
        "no seizures",
        "not having seizures",
        "did not faint",
        "have not fainted",
        "no fainting",
        "not vomiting repeatedly",
        "no repeated vomiting",
        "able to keep fluids down",
        "can keep fluids down",
        "no heavy bleeding",
        "not bleeding heavily",
    )

    cleaned = text

    for phrase in sorted(phrases, key=len, reverse=True):
        cleaned = cleaned.replace(phrase, " ")

    return normalize_text(cleaned)


def detect_emergency_warning(
    symptoms: str,
    previous_answers: list[str],
) -> str | None:
    """
    Detect explicit emergency warning signs from the user's own text.

    The classifier should not wait for more routine follow-up questions when
    one of these is present.
    """
    context = build_user_context(symptoms, previous_answers)
    cleaned = remove_common_negative_emergency_phrases(context)

    emergency_patterns = {
        "severe breathing difficulty": (
            "severe difficulty breathing",
            "cannot breathe",
            "can't breathe",
            "struggling to breathe",
            "gasping for air",
            "unable to speak because of breathing",
            "cannot speak because of breathing",
        ),
        "concerning chest pain": (
            "crushing chest pain",
            "severe chest pain",
            "heavy chest pressure",
            "chest pain spreading to my arm",
            "chest pain spreading to arm",
            "chest pain spreading to jaw",
            "chest pain spreading to neck",
            "chest pain radiating",
        ),
        "loss of consciousness or seizure": (
            "unconscious",
            "passed out",
            "fainted",
            "having a seizure",
            "having seizures",
            "severe confusion",
            "suddenly confused",
        ),
        "major bleeding": (
            "vomiting blood",
            "coughing up blood",
            "coughing blood",
            "heavy bleeding",
            "bleeding heavily",
            "black tarry stool",
            "black tarry stools",
            "large amount of blood in stool",
        ),
        "severe dehydration or persistent vomiting": (
            "cannot keep fluids down",
            "can't keep fluids down",
            "unable to keep fluids down",
            "persistent vomiting",
            "vomiting repeatedly",
            "very little urine",
            "not urinating",
        ),
        "neurologic emergency": (
            "face drooping",
            "one side weakness",
            "one-sided weakness",
            "cannot move one side",
            "can't move one side",
            "sudden slurred speech",
            "cannot speak properly",
        ),
    }

    for warning_name, patterns in emergency_patterns.items():
        if contains_any(cleaned, patterns):
            return warning_name

    return None


def matched_rules(symptoms: str) -> list[TriageRule]:
    text = normalize_text(symptoms)

    return [
        rule for rule in SYMPTOM_RULES
        if contains_any(text, rule.keywords)
    ]


def add_unique_question(
    questions: list[str],
    question: str,
    previous_answers: list[str],
) -> None:
    if question in questions:
        return

    if question_was_previously_asked(question, previous_answers):
        return

    questions.append(question)


def collect_first_round_questions(
    symptoms: str,
    duration: str | None,
    previous_answers: list[str],
) -> list[str]:
    """
    First round:
    - establish duration/severity/onset,
    - then add the most relevant symptom-specific question(s).
    """
    questions: list[str] = []
    context = build_user_context(symptoms, previous_answers)

    if not (
        duration and duration.strip()
    ) and not has_duration_information(context):
        add_unique_question(
            questions,
            UNIVERSAL_QUESTIONS[0],
            previous_answers,
        )

    if not has_severity_information(context):
        add_unique_question(
            questions,
            UNIVERSAL_QUESTIONS[1],
            previous_answers,
        )

    if not has_onset_or_progression_information(context):
        add_unique_question(
            questions,
            UNIVERSAL_QUESTIONS[2],
            previous_answers,
        )

    rules = matched_rules(symptoms)

    if rules:
        # Interleave rules so multi-system complaints do not get four
        # questions from only the first body system.
        max_rule_questions = max(len(rule.questions) for rule in rules)

        for index in range(max_rule_questions):
            for rule in rules:
                if index < len(rule.questions):
                    add_unique_question(
                        questions,
                        rule.questions[index],
                        previous_answers,
                    )

                if len(questions) >= MAX_QUESTIONS_PER_ROUND:
                    return questions[:MAX_QUESTIONS_PER_ROUND]
    else:
        # No known keyword? Still ask meaningful questions.
        for question in GENERIC_FALLBACK_QUESTIONS:
            add_unique_question(
                questions,
                question,
                previous_answers,
            )

            if len(questions) >= MAX_QUESTIONS_PER_ROUND:
                break

    if len(questions) < MAX_QUESTIONS_PER_ROUND:
        add_unique_question(
            questions,
            UNIVERSAL_QUESTIONS[3],
            previous_answers,
        )

    return questions[:MAX_QUESTIONS_PER_ROUND]


def collect_second_round_questions(
    symptoms: str,
    previous_answers: list[str],
) -> list[str]:
    """
    Second and final round:
    focus on unanswered symptom-specific discriminators.

    If no rule matches, use generic context questions.
    """
    questions: list[str] = []
    rules = matched_rules(
        " ".join([symptoms, *extract_answer_text(previous_answers)])
    )

    if rules:
        for rule in rules:
            for question in rule.questions:
                add_unique_question(
                    questions,
                    question,
                    previous_answers,
                )

                if len(questions) >= MAX_QUESTIONS_PER_ROUND:
                    return questions[:MAX_QUESTIONS_PER_ROUND]

    for question in GENERIC_FALLBACK_QUESTIONS:
        add_unique_question(
            questions,
            question,
            previous_answers,
        )

        if len(questions) >= MAX_QUESTIONS_PER_ROUND:
            break

    return questions[:MAX_QUESTIONS_PER_ROUND]


def collect_questions(
    symptoms: str,
    duration: str | None,
    previous_answers: list[str],
) -> list[str]:
    round_number = estimated_round(previous_answers)

    if round_number >= MAX_FOLLOWUP_ROUNDS:
        return []

    if round_number == 0:
        return collect_first_round_questions(
            symptoms=symptoms,
            duration=duration,
            previous_answers=previous_answers,
        )

    return collect_second_round_questions(
        symptoms=symptoms,
        previous_answers=previous_answers,
    )


def enough_information_to_classify(
    symptoms: str,
    duration: str | None,
    previous_answers: list[str],
) -> bool:
    """
    Stop logic.

    We deliberately do NOT require a rigid number of recognized symptom
    categories. That was a major cause of repeated questioning in the older
    implementation.

    Classification proceeds when:
    - two rounds have already been completed, OR
    - enough user answers have accumulated and basic timing information is
      available.
    """
    round_number = estimated_round(previous_answers)
    answers = extract_answer_text(previous_answers)
    context = build_user_context(symptoms, previous_answers)

    if round_number >= MAX_FOLLOWUP_ROUNDS:
        return True

    timing_known = bool(
        duration and duration.strip()
    ) or has_duration_information(context)

    # After the first round, four substantive answers plus timing are enough
    # to proceed. This keeps the interaction short in well-described cases.
    substantive_answers = [
        answer for answer in answers
        if len(answer.strip()) >= 2
    ]

    if (
        round_number >= 1
        and timing_known
        and len(substantive_answers) >= 4
    ):
        return True

    return False


def assess_symptom_information(
    symptoms: str,
    age: int | None = None,
    sex: str | None = None,
    duration: str | None = None,
    previous_answers: list[str] | None = None,
) -> dict:
    """
    Main entry point used by the symptom checker.

    Return format remains compatible with the previous AidFidelis triage
    module:
        {
            "enough_information": bool,
            "reason": str,
            "questions": list[str],
            "emergency_warning": str | None
        }

    age and sex are accepted for API compatibility. They should be passed to
    the classifier separately. This local rule engine does not infer a
    diagnosis from them.
    """
    del age, sex

    symptoms = (symptoms or "").strip()
    previous_answers = previous_answers or []

    if not symptoms:
        return {
            "enough_information": False,
            "reason": "No symptoms were provided.",
            "questions": [
                "What symptoms are you currently experiencing?"
            ],
            "emergency_warning": None,
        }

    # 1. Safety always comes first.
    emergency_warning = detect_emergency_warning(
        symptoms=symptoms,
        previous_answers=previous_answers,
    )

    if emergency_warning:
        return {
            "enough_information": True,
            "reason": (
                "A possible emergency warning sign was reported. "
                "Urgent medical assessment should take priority over "
                "additional routine follow-up questions."
            ),
            "questions": [],
            "emergency_warning": emergency_warning,
        }

    # 2. Stop once enough history has accumulated or two rounds are complete.
    if enough_information_to_classify(
        symptoms=symptoms,
        duration=duration,
        previous_answers=previous_answers,
    ):
        return {
            "enough_information": True,
            "reason": (
                "Enough symptom history has been collected for the "
                "classifier to continue."
            ),
            "questions": [],
            "emergency_warning": None,
        }

    # 3. Ask the next relevant question set.
    questions = collect_questions(
        symptoms=symptoms,
        duration=duration,
        previous_answers=previous_answers,
    )

    # Fail-safe: never create a questioning loop.
    if not questions:
        return {
            "enough_information": True,
            "reason": (
                "No additional useful local follow-up questions remain. "
                "Continue to classification."
            ),
            "questions": [],
            "emergency_warning": None,
        }

    return {
        "enough_information": False,
        "reason": (
            "Additional information may improve the symptom classification."
        ),
        "questions": questions,
        "emergency_warning": None,
    }