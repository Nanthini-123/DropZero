import os
import random
import requests

from dotenv import load_dotenv
from supabase import create_client


load_dotenv("backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
)

API_URL = "http://127.0.0.1:8000"


random.seed(42)


def clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


students = []


# Synthetic demo data only.
# The ML model itself is trained on the real UCI dataset.
for i in range(40):

    if i < 24:
        profile = "low"
    elif i < 34:
        profile = "medium"
    else:
        profile = "high"

    base = {
        "low": {
            "attendance": random.randint(80, 95),
            "marks": random.randint(70, 90),
            "assignment": random.randint(80, 100),
            "participation": random.randint(75, 95),
            "gpa": round(random.uniform(7.0, 9.5), 1),
            "backlogs": random.randint(0, 1),
        },
        "medium": {
            "attendance": random.randint(65, 82),
            "marks": random.randint(55, 72),
            "assignment": random.randint(60, 80),
            "participation": random.randint(55, 75),
            "gpa": round(random.uniform(5.5, 7.2), 1),
            "backlogs": random.randint(1, 3),
        },
        "high": {
            "attendance": random.randint(45, 68),
            "marks": random.randint(35, 58),
            "assignment": random.randint(35, 62),
            "participation": random.randint(30, 60),
            "gpa": round(random.uniform(4.0, 6.0), 1),
            "backlogs": random.randint(2, 5),
        },
    }[profile]

    students.append({
        "name": f"Student {i + 1:02d}",
        "email": f"student{i + 1:02d}@dropzero.demo",
        "department": random.choice([
            "Computer Science",
            "AI & Data Science",
            "Information Technology",
        ]),
        "year": random.choice([2, 3, 4]),
        "role": "student",
        "profile": profile,
        "base": base,
    })


# Clear previous demo data.
# The database is intentionally empty for the first seed run.
print("Starting fresh seed...")


for index, student in enumerate(students):

    student_row = {
        key: value
        for key, value in student.items()
        if key not in ["profile", "base"]
    }

    response = supabase.table(
        "students"
    ).insert(student_row).execute()

    student_id = response.data[0]["id"]

    previous_prediction = None

    for week in range(1, 4):

        b = student["base"]

        # Create realistic 3-week movement.
        decline = 0

        if student["profile"] == "high":
            decline = week * 3

        elif student["profile"] == "medium":
            decline = week * 1.5

        # A handful of students have a sharp decline.
        if index % 10 == 0 and week >= 2:
            decline += week * 7

        attendance = clamp(
            b["attendance"] - decline + random.uniform(-2, 2),
            20,
            100,
        )

        marks = clamp(
            b["marks"] - decline + random.uniform(-3, 3),
            20,
            100,
        )

        assignment = clamp(
            b["assignment"] - decline + random.uniform(-3, 3),
            20,
            100,
        )

        participation = clamp(
            b["participation"] - decline + random.uniform(-3, 3),
            20,
            100,
        )

        gpa = clamp(
            b["gpa"] - (decline / 20),
            0,
            10,
        )

        backlogs = max(
            0,
            b["backlogs"] + (
                1 if decline >= 15 else 0
            ),
        )

        metric = {
            "student_id": student_id,
            "week": week,
            "attendance": round(attendance, 2),
            "marks": round(marks, 2),
            "assignment_completion": round(
                assignment,
                2,
            ),
            "participation": round(
                participation,
                2,
            ),
            "gpa": round(gpa, 2),
            "backlogs": backlogs,
        }

        metric_response = supabase.table(
            "weekly_metrics"
        ).insert(metric).execute()

        metric_id = metric_response.data[0]["id"]

        # Every stored prediction comes from the real FastAPI model.
        prediction_response = requests.post(
            f"{API_URL}/predict",
            json={
                "attendance": attendance,
                "marks": marks,
                "assignment_completion": assignment,
                "previous_gpa": gpa,
                "participation": participation,
                "backlogs": backlogs,
            },
            timeout=30,
        )

        prediction_response.raise_for_status()

        prediction = prediction_response.json()

        prediction_row = {
            "student_id": student_id,
            "weekly_metric_id": metric_id,
            "risk_level": prediction["risk_level"],
            "predicted_class": prediction["predicted_class"],
            "confidence": prediction["confidence"],
            "risk_score": prediction["risk_score"],
            "top_factors": prediction["top_factors"],
            "protective_factors": prediction[
                "protective_factors"
            ],
        }

        supabase.table(
            "predictions"
        ).insert(prediction_row).execute()

        previous_prediction = prediction


    # Initial intervention state.
    supabase.table(
        "interventions"
    ).insert({
        "student_id": student_id,
        "state": "Not contacted",
        "owner": "Advisor",
        "next_review_date": None,
    }).execute()


print("DropZero seed complete.")
print("40 students created.")
print("120 weekly metrics created.")
print("120 real model predictions created.")