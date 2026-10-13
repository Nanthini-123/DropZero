import os
import sys
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure backend directory is in sys.path so services can be imported regardless of execution working directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
from services.feature_mapping import build_feature_vector
from services.prediction import predict



app = FastAPI(
    title="DropZero API",
    description="Student dropout early-warning ML backend",
    version="1.0.0",
)


# Allow the Next.js frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    attendance: float = Field(
        ...,
        ge=0,
        le=100,
    )

    marks: float = Field(
        ...,
        ge=0,
        le=100,
    )

    assignment_completion: float = Field(
        ...,
        ge=0,
        le=100,
    )

    previous_gpa: float = Field(
        ...,
        ge=0,
        le=10,
    )

    participation: float = Field(
        ...,
        ge=0,
        le=100,
    )

    backlogs: int = Field(
        ...,
        ge=0,
    )


class SimulationRequest(PredictionRequest):
    student_id: Optional[str] = None


@app.get("/")
def root():
    return {
        "name": "DropZero API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "Random Forest",
    }


@app.post("/predict")
def prediction(request: PredictionRequest):

    features = build_feature_vector(
        attendance=request.attendance,
        marks=request.marks,
        assignment_completion=request.assignment_completion,
        previous_gpa=request.previous_gpa,
        participation=request.participation,
        backlogs=request.backlogs,
    )

    result = predict(features)

    return result


@app.post("/students/{student_id}/simulate")
def simulate(
    student_id: str,
    request: SimulationRequest,
):

    features = build_feature_vector(
        attendance=request.attendance,
        marks=request.marks,
        assignment_completion=request.assignment_completion,
        previous_gpa=request.previous_gpa,
        participation=request.participation,
        backlogs=request.backlogs,
    )

    result = predict(features)

    return {
        "student_id": student_id,
        "projected": True,
        "message": (
            "Projected scenario — not a guaranteed outcome."
        ),
        "prediction": result,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)