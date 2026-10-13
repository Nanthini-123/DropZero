import json
import os
import urllib.request
import zipfile
import io

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


# ============================================================
# DropZero — Real UCI ML Training
# Dataset:
# Predict Students' Dropout and Academic Success
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

DATA_PATH = os.path.join(
    DATA_DIR,
    "student_dropout.csv"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model.joblib"
)

METRICS_PATH = os.path.join(
    BASE_DIR,
    "metrics.json"
)

METADATA_PATH = os.path.join(
    BASE_DIR,
    "model_metadata.json"
)


# UCI dataset
DATA_URL = (
    "https://archive.ics.uci.edu/static/public/697/"
    "predict+students+dropout+and+academic+success.zip"
)


# ============================================================
# 1. DOWNLOAD DATASET
# ============================================================

if not os.path.exists(DATA_PATH):

    print("Downloading UCI dataset...")

    try:

        with urllib.request.urlopen(DATA_URL) as response:

            zip_data = response.read()

        with zipfile.ZipFile(io.BytesIO(zip_data)) as z:

            csv_files = [

                name for name in z.namelist()

                if name.endswith("data.csv")

            ]

            if not csv_files:

                raise RuntimeError(

                    "data.csv not found inside UCI ZIP file."

                )

            with z.open(csv_files[0]) as source:

                with open(DATA_PATH, "wb") as target:

                    target.write(source.read())

    except Exception as e:

        raise RuntimeError(

            f"Could not download UCI dataset: {e}"

        )

else:

    print("Dataset already exists.")


# ============================================================
# 2. LOAD DATA
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATA_PATH, sep=";")

print(f"Dataset shape: {df.shape}")


# ============================================================
# 3. TARGET
# ============================================================

TARGET_COLUMN = "Target"

X = df.drop(columns=[TARGET_COLUMN])
y = df[TARGET_COLUMN]


# Preserve original feature names
feature_names = X.columns.tolist()


# ============================================================
# 4. ENCODE TARGET
# ============================================================

target_mapping = {
    "Dropout": 0,
    "Enrolled": 1,
    "Graduate": 2,
}

y = y.map(target_mapping)

if y.isna().any():
    raise ValueError("Unknown target class found in dataset.")


# ============================================================
# 5. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


# ============================================================
# 6. RANDOM FOREST
# ============================================================

print("\nTraining Random Forest...")

rf = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1,
)

rf.fit(X_train, y_train)

rf_predictions = rf.predict(X_test)

rf_accuracy = accuracy_score(
    y_test,
    rf_predictions,
)

rf_report = classification_report(
    y_test,
    rf_predictions,
    target_names=[
        "Dropout",
        "Enrolled",
        "Graduate",
    ],
    output_dict=True,
)

rf_matrix = confusion_matrix(
    y_test,
    rf_predictions,
)


# ============================================================
# 7. LOGISTIC REGRESSION
# ============================================================

print("\nTraining Logistic Regression...")

lr = Pipeline(
    [
        (
            "scaler",
            StandardScaler(),
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=3000,
                random_state=42,
                class_weight="balanced",
            ),
        ),
    ]
)

lr.fit(X_train, y_train)

lr_predictions = lr.predict(X_test)

lr_accuracy = accuracy_score(
    y_test,
    lr_predictions,
)

lr_report = classification_report(
    y_test,
    lr_predictions,
    target_names=[
        "Dropout",
        "Enrolled",
        "Graduate",
    ],
    output_dict=True,
)

lr_matrix = confusion_matrix(
    y_test,
    lr_predictions,
)


# ============================================================
# 8. SELECT BETTER MODEL
# ============================================================

if rf_accuracy >= lr_accuracy:

    selected_model = rf
    selected_model_name = "Random Forest"

    selected_predictions = rf_predictions
    selected_accuracy = rf_accuracy
    selected_report = rf_report
    selected_matrix = rf_matrix

    feature_importances = rf.feature_importances_

else:

    selected_model = lr
    selected_model_name = "Logistic Regression"

    selected_predictions = lr_predictions
    selected_accuracy = lr_accuracy
    selected_report = lr_report
    selected_matrix = lr_matrix

    coefficients = lr.named_steps[
        "classifier"
    ].coef_

    feature_importances = np.mean(
        np.abs(coefficients),
        axis=0,
    )


# ============================================================
# 9. FEATURE IMPORTANCE
# ============================================================

importance_pairs = sorted(
    zip(
        feature_names,
        feature_importances,
    ),
    key=lambda x: x[1],
    reverse=True,
)

feature_importance_data = [
    {
        "feature": feature,
        "importance": float(importance),
    }
    for feature, importance in importance_pairs
]


# ============================================================
# 10. SAVE MODEL
# ============================================================

joblib.dump(
    selected_model,
    MODEL_PATH,
)


# ============================================================
# 11. SAVE METRICS
# ============================================================

metrics = {
    "dataset": {
        "name": "Predict Students' Dropout and Academic Success",
        "source": "UCI Machine Learning Repository",
        "samples": int(len(df)),
        "features": int(len(feature_names)),
        "classes": [
            "Dropout",
            "Enrolled",
            "Graduate",
        ],
    },

    "random_forest": {
        "accuracy": float(rf_accuracy),
        "classification_report": rf_report,
        "confusion_matrix": rf_matrix.tolist(),
    },

    "logistic_regression": {
        "accuracy": float(lr_accuracy),
        "classification_report": lr_report,
        "confusion_matrix": lr_matrix.tolist(),
    },

    "selected_model": selected_model_name,

    "selected_model_accuracy": float(
        selected_accuracy
    ),

    "selected_model_confusion_matrix": (
        selected_matrix.tolist()
    ),

    "feature_importance": feature_importance_data,

    "target_mapping": {
        "Dropout": "High",
        "Enrolled": "Medium",
        "Graduate": "Low",
    },
}


with open(
    METRICS_PATH,
    "w",
    encoding="utf-8",
) as f:

    json.dump(
        metrics,
        f,
        indent=2,
    )


# ============================================================
# 12. SAVE MODEL METADATA
# ============================================================

metadata = {
    "model_name": selected_model_name,
    "feature_names": feature_names,
    "target_classes": [
        "Dropout",
        "Enrolled",
        "Graduate",
    ],
    "risk_mapping": {
        "Graduate": "Low",
        "Enrolled": "Medium",
        "Dropout": "High",
    },
    "dataset_name": (
        "Predict Students' Dropout and Academic Success"
    ),
    "dataset_samples": int(len(df)),
    "dataset_features": int(len(feature_names)),
}


with open(
    METADATA_PATH,
    "w",
    encoding="utf-8",
) as f:

    json.dump(
        metadata,
        f,
        indent=2,
    )


# ============================================================
# 13. PRINT REAL RESULTS
# ============================================================

print("\n" + "=" * 60)
print("DROPZERO — ML TRAINING COMPLETE")
print("=" * 60)

print(
    f"\nDataset samples: {len(df)}"
)

print(
    f"Dataset features: {len(feature_names)}"
)

print(
    f"\nRandom Forest accuracy: "
    f"{rf_accuracy:.4f}"
)

print(
    f"Logistic Regression accuracy: "
    f"{lr_accuracy:.4f}"
)

print(
    f"\nSelected model: "
    f"{selected_model_name}"
)

print(
    f"Selected model accuracy: "
    f"{selected_accuracy:.4f}"
)

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        selected_predictions,
        target_names=[
            "Dropout",
            "Enrolled",
            "Graduate",
        ],
    )
)

print("Confusion Matrix:")

print(selected_matrix)

print("\nTop 10 Feature Importances:")

for feature, importance in importance_pairs[:10]:

    print(
        f"{feature}: "
        f"{importance:.6f}"
    )

print("\nSaved files:")

print(MODEL_PATH)
print(METRICS_PATH)
print(METADATA_PATH)

print("\nTraining finished successfully.")