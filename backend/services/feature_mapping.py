import json
import os


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "model",
    "model_metadata.json",
)

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)

FEATURE_NAMES = metadata["feature_names"]


def build_feature_vector(
    attendance: float,
    marks: float,
    assignment_completion: float,
    previous_gpa: float,
    participation: float,
    backlogs: int,
):
    """
    Convert DropZero's simplified advisor inputs
    into the 36-feature representation expected by
    the UCI-trained model.

    The UCI dataset does not contain these exact six
    fields. This is a deterministic demo mapping layer.
    Production deployment would require institution-specific
    feature collection and retraining.
    """

    features = {
        feature: 0.0
        for feature in FEATURE_NAMES
    }

    # -------------------------------------------------------
    # Academic performance
    # -------------------------------------------------------

    if "Admission grade" in features:
        features["Admission grade"] = marks

    if "Previous qualification (grade)" in features:
        features["Previous qualification (grade)"] = (
            previous_gpa * 10
        )

    # -------------------------------------------------------
    # First semester academic activity
    # -------------------------------------------------------

    first_sem_grade = min(
        20,
        max(
            0,
            marks / 5,
        ),
    )

    first_sem_approved = max(
        0,
        min(
            6,
            round(
                (marks / 100) * 6
            ),
        ),
    )

    first_sem_evaluations = max(
        0,
        min(
            12,
            round(
                (assignment_completion / 100) * 12
            ),
        ),
    )

    if "Curricular units 1st sem (grade)" in features:
        features[
            "Curricular units 1st sem (grade)"
        ] = first_sem_grade

    if "Curricular units 1st sem (approved)" in features:
        features[
            "Curricular units 1st sem (approved)"
        ] = first_sem_approved

    if "Curricular units 1st sem (evaluations)" in features:
        features[
            "Curricular units 1st sem (evaluations)"
        ] = first_sem_evaluations

    # -------------------------------------------------------
    # Second semester
    # -------------------------------------------------------

    second_sem_grade = min(
        20,
        max(
            0,
            marks / 5,
        ),
    )

    second_sem_approved = max(
        0,
        min(
            6,
            round(
                (marks / 100) * 6
            ),
        ),
    )

    second_sem_evaluations = max(
        0,
        min(
            12,
            round(
                (assignment_completion / 100) * 12
            ),
        ),
    )

    if "Curricular units 2nd sem (grade)" in features:
        features[
            "Curricular units 2nd sem (grade)"
        ] = second_sem_grade

    if "Curricular units 2nd sem (approved)" in features:
        features[
            "Curricular units 2nd sem (approved)"
        ] = second_sem_approved

    if "Curricular units 2nd sem (evaluations)" in features:
        features[
            "Curricular units 2nd sem (evaluations)"
        ] = second_sem_evaluations

    # -------------------------------------------------------
    # Attendance / engagement related feature
    # -------------------------------------------------------

    attendance_value = (
        attendance / 100
    )

    participation_value = (
        participation / 100
    )

    assignment_value = (
        assignment_completion / 100
    )

    # Map attendance-related UCI features
    for feature in FEATURE_NAMES:

        feature_lower = feature.lower()

        if "attendance" in feature_lower:
            features[feature] = attendance_value

        elif "tuition fees up to date" in feature_lower:
            features[feature] = (
                1.0
                if attendance >= 60
                else 0.0
            )

        elif "debtor" in feature_lower:
            features[feature] = (
                1.0
                if attendance < 60
                else 0.0
            )

        elif "scholarship" in feature_lower:
            features[feature] = (
                1.0
                if previous_gpa >= 7
                else 0.0
            )

        elif "age at enrollment" in feature_lower:
            features[feature] = 20.0

        elif "displaced" in feature_lower:
            features[feature] = 0.0

        elif "special needs" in feature_lower:
            features[feature] = 0.0

        elif "international" in feature_lower:
            features[feature] = 0.0

        elif "educational special needs" in feature_lower:
            features[feature] = 0.0

    # -------------------------------------------------------
    # Backlogs
    # -------------------------------------------------------

    for feature in FEATURE_NAMES:

        feature_lower = feature.lower()

        if "failed" in feature_lower:
            features[feature] = float(
                min(backlogs, 6)
            )

        elif "approved" in feature_lower:
            # Don't overwrite semester-specific values
            # already assigned above.
            continue

    # -------------------------------------------------------
    # Participation
    # -------------------------------------------------------

    # Use participation to influence engagement-related
    # categorical/binary fields when present.
    for feature in FEATURE_NAMES:

        feature_lower = feature.lower()

        if (
            "attendance" in feature_lower
            or "approved" in feature_lower
            or "grade" in feature_lower
            or "evaluations" in feature_lower
            or "failed" in feature_lower
        ):
            continue

        if "application mode" in feature_lower:
            features[feature] = 1.0

        elif "course" in feature_lower:
            features[feature] = 1.0

        elif "participation" in feature_lower:
            features[feature] = participation_value

        elif "assignment" in feature_lower:
            features[feature] = assignment_value

    return features