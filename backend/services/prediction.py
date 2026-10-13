import json
import os

import joblib
import numpy as np
import pandas as pd


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "model.joblib",
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "model",
    "model_metadata.json",
)

METRICS_PATH = os.path.join(
    BASE_DIR,
    "model",
    "metrics.json",
)


model = joblib.load(MODEL_PATH)

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)

with open(METRICS_PATH, "r", encoding="utf-8") as f:
    metrics = json.load(f)


FEATURE_NAMES = metadata["feature_names"]

TARGET_CLASSES = metadata["target_classes"]

RISK_MAPPING = metadata["risk_mapping"]


def predict(features):
    """
    Run prediction using the trained UCI model.

    `features` must contain the complete 36-feature
    representation expected by the trained model.
    """

    values = [
        features[name]
        for name in FEATURE_NAMES
    ]

    X = pd.DataFrame(
        [values],
        columns=FEATURE_NAMES,
    )

    prediction = int(
        model.predict(X)[0]
    )

    probabilities = model.predict_proba(X)[0]

    predicted_class = TARGET_CLASSES[prediction]

    risk_level = RISK_MAPPING[predicted_class]

    confidence = float(
        probabilities[prediction]
    )

    dropout_index = TARGET_CLASSES.index(
        "Dropout"
    )

    risk_score = float(
        probabilities[dropout_index] * 100
    )

    # Random Forest feature importance
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_

    else:
        # Fallback for models such as Logistic Regression
        importances = np.mean(
            np.abs(
                model.coef_
            ),
            axis=0,
        )

    contributions = []

    for i, feature_name in enumerate(
        FEATURE_NAMES
    ):
        contribution = (
            float(importances[i])
            * abs(float(values[i]))
        )

        contributions.append(
            {
                "feature": feature_name,
                "importance": float(
                    importances[i]
                ),
                "contribution": contribution,
            }
        )

    contributions.sort(
        key=lambda x: x["contribution"],
        reverse=True,
    )

    top_factors = contributions[:3]

    protective_factors = sorted(
        contributions,
        key=lambda x: x["contribution"],
    )[:3]

    return {
        "risk_level": risk_level,
        "confidence": confidence,
        "predicted_class": predicted_class,
        "risk_score": risk_score,
        "top_factors": top_factors,
        "protective_factors": protective_factors,
    }