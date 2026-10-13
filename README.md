# DropZero 🎓 — Student Success Intelligence Platform

**Predict early. Intervene smarter. Help students succeed.**

DropZero is an AI-powered student success intelligence platform designed to identify students at risk of academic dropout using machine learning. It transforms student data into actionable insights through predictive analytics, risk prioritization, academic progress monitoring, and intervention planning.

The goal is to help educational institutions identify students who may need additional support before academic difficulties become more serious.

## 🚀 Key Features

### 📊 Intelligent Dashboard
- Monitor student records and academic risk classifications.
- View an overview of student success indicators.
- Identify students who may require additional attention.

### 🎯 Student Risk Prediction
- Predict academic outcomes using a trained Random Forest classifier.
- Classify predicted outcomes into Dropout, Enrolled, and Graduate categories.
- Generate predictions through a FastAPI backend.

### 🚨 Priority Queue
- Organize students according to identified risk levels.
- Help prioritize follow-ups for students who may need support.
- Support proactive academic intervention planning.

### 👥 Student Profiles
- View individual student information.
- Explore weekly academic performance trends.
- Monitor changes in student progress.

### 🧠 Machine Learning
- Train and evaluate classification models.
- Compare Random Forest and Logistic Regression.
- Display model evaluation metrics.
- Use a trained model to generate predictions.

### 🔍 Model Transparency
- Present model evaluation information.
- Compare model performance.
- Support more informed interpretation of predictions.

### 💡 Intervention Simulator
- Explore potential intervention scenarios.
- Support student-specific follow-up planning.
- Connect prediction results with actionable support strategies.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Python, FastAPI, Uvicorn |
| Machine Learning | Scikit-learn, Pandas |
| Model | Random Forest, Logistic Regression |
| Model Serialization | Joblib |
| Database | Supabase, SQL |
| API Communication | REST APIs |
| Dataset | UCI Machine Learning Repository |

## 🧪 Machine Learning Approach

DropZero uses the **UCI Predict Students' Dropout and Academic Success** dataset.

### Dataset Overview
- **4,424** student records
- **36** input features
- **3** outcome classes:
  - Dropout
  - Enrolled
  - Graduate

### Model Evaluation

Two classification models were evaluated during development.

| Model | Accuracy |
|---|---:|
| Logistic Regression | 72.88% |
| Random Forest | 75.48% |

The Random Forest model achieved the higher accuracy in the reported evaluation and was selected for prediction.

### Random Forest Classification Results

| Class | Precision | Recall | F1-Score |
|---|---:|---:|---:|
| Dropout | 0.83 | 0.71 | 0.76 |
| Enrolled | 0.48 | 0.57 | 0.52 |
| Graduate | 0.83 | 0.85 | 0.84 |

The model achieved an overall accuracy of approximately **75.48%**.

Performance differs across outcome classes, so predictions should be treated as decision-support estimates rather than definitive judgments about individual students.

## 🏗️ System Architecture

```text
          Student / Educator
                  |
                  v
          Next.js Frontend
                  |
                  v
           FastAPI Backend
                  |
                  v
         Feature Processing
                  |
                  v
       Trained Random Forest
                  |
                  v
        Outcome Prediction
                  |
          +-------+-------+
          |               |
          v               v
    Risk Insights    Student Profiles
          |               |
          +-------+-------+
                  |
                  v
       Academic Support Planning

       Supabase: Data Storage
```

## 📁 Project Structure

```text
DropZero/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── data/
│   │   ├── README.md
│   │   └── student_dropout.csv
│   ├── model/
│   │   ├── train.py
│   │   ├── model.joblib
│   │   ├── model_metadata.json
│   │   └── metrics.json
│   └── services/
│       ├── feature_mapping.py
│       ├── prediction.py
│       └── recovery.py
├── frontend/
│   ├── app/
│   ├── lib/
│   ├── public/
│   └── package.json
├── scripts/
│   └── seed_students.py
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Install:
- Python 3.10 or a compatible version
- Node.js and npm
- Git
- A Supabase project for database-backed features

### 1. Clone the Repository

```bash
git clone https://github.com/Nanthini-123/DropZero.git
cd DropZero
```

### 2. Configure the Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Configure the required backend environment variables in your local environment file. Keep `.env` private and never commit credentials to GitHub.

### 3. Start the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload
```

The API should be available at:

- Backend: http://127.0.0.1:8000
- API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

### 4. Configure Supabase

1. Create a Supabase project.
2. Configure the environment variables required by the application.
3. Review `supabase/schema.sql`.
4. Review `supabase/seed.sql`.
5. Apply the required schema and seed data to your development database.

Never expose a Supabase service-role key in frontend code or a public repository.

### 5. Start the Frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the application at:

http://localhost:3000

### 6. Train the Model

The training script is located at `backend/model/train.py`.

From the backend directory:

```bash
python model/train.py
```

Check the script's dataset path and configuration before running it. Training may regenerate the model artifact and evaluation metrics.

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Check backend health |
| `/predict` | POST | Generate a student outcome prediction |

For request formats and response details, refer to the interactive FastAPI documentation at `/docs`.

## 🔐 Data Privacy and Responsible AI

DropZero is designed as a student success decision-support prototype.

- Predictions are estimates, not guarantees.
- Model performance may vary across institutions and student populations.
- Historical data may contain bias or limitations.
- Educators should consider additional context before making decisions.
- Student information must be handled with appropriate privacy and access controls.

The platform is intended to support early identification and intervention, not to make consequential decisions about students automatically.

## 🔮 Future Improvements

Potential enhancements include:

- Explainable AI for individual predictions.
- Model monitoring and periodic evaluation.
- Improved probability calibration.
- Institution-specific model validation.
- Automated alerts for students requiring follow-up.
- Role-based access control.
- Secure deployment and application monitoring.

## 👩‍💻 Author

**Nanthini K**

B.Tech — Artificial Intelligence and Data Science

GitHub: [@Nanthini-123](https://github.com/Nanthini-123)

## 🙏 Acknowledgements

- [UCI Machine Learning Repository](https://archive.ics.uci.edu/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Scikit-learn](https://scikit-learn.org/)

---

**DropZero — Turning student data into actionable success insights.**
