"use client";

import { useState } from "react";

type PredictionResponse = {
  risk_level: "Low" | "Medium" | "High";
  confidence: number;
  predicted_class: string;
  risk_score: number;
  top_factors: {
    feature: string;
    importance: number;
    contribution: number;
  }[];
};

type Props = {
  initialAttendance: number;
  initialAssignments: number;
  initialMarks: number;
  initialGpa: number;
  initialParticipation: number;
  initialBacklogs: number;
};

export default function InterventionSimulator({
  initialAttendance,
  initialAssignments,
  initialMarks,
  initialGpa,
  initialParticipation,
  initialBacklogs,
}: Props) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [assignments, setAssignments] = useState(initialAssignments);

  const [result, setResult] =
    useState<PredictionResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function simulate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendance,
            marks: initialMarks,
            assignment_completion: assignments,
            previous_gpa: initialGpa,
            participation: initialParticipation,
            backlogs: initialBacklogs,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data: PredictionResponse =
        await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to reach the ML service. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  const riskStyles = {
    Low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    Medium:
      "border-amber-400/30 bg-amber-400/10 text-amber-400",
    High:
      "border-red-400/30 bg-red-400/10 text-red-400",
  };

  return (
    <section className="mt-6 rounded-2xl border border-cyan-400/20 bg-slate-900 p-6">

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <h2 className="text-xl font-semibold">
              Intervention Simulator
            </h2>

            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              Projected
            </span>

          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Adjust hypothetical attendance and assignment
            completion values to see how the trained model
            would respond.
          </p>
        </div>

      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">

        {/* CONTROLS */}

        <div className="space-y-7">

          {/* ATTENDANCE */}

          <div>

            <div className="mb-3 flex justify-between">

              <label className="text-sm font-medium">
                Attendance
              </label>

              <span className="font-semibold text-cyan-400">
                {attendance.toFixed(0)}%
              </span>

            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={attendance}
              onChange={(e) =>
                setAttendance(Number(e.target.value))
              }
              className="w-full accent-cyan-400"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-600">
              <span>0%</span>
              <span>100%</span>
            </div>

          </div>

          {/* ASSIGNMENTS */}

          <div>

            <div className="mb-3 flex justify-between">

              <label className="text-sm font-medium">
                Assignment Completion
              </label>

              <span className="font-semibold text-cyan-400">
                {assignments.toFixed(0)}%
              </span>

            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={assignments}
              onChange={(e) =>
                setAssignments(Number(e.target.value))
              }
              className="w-full accent-cyan-400"
            />

            <div className="mt-2 flex justify-between text-xs text-slate-600">
              <span>0%</span>
              <span>100%</span>
            </div>

          </div>

          {/* CURRENT VALUES */}

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Other values remain unchanged
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

              <div>
                <span className="text-slate-500">
                  Marks
                </span>

                <p className="font-medium">
                  {initialMarks.toFixed(1)}%
                </p>
              </div>

              <div>
                <span className="text-slate-500">
                  Previous GPA
                </span>

                <p className="font-medium">
                  {initialGpa.toFixed(1)}
                </p>
              </div>

              <div>
                <span className="text-slate-500">
                  Participation
                </span>

                <p className="font-medium">
                  {initialParticipation.toFixed(1)}%
                </p>
              </div>

              <div>
                <span className="text-slate-500">
                  Backlogs
                </span>

                <p className="font-medium">
                  {initialBacklogs}
                </p>
              </div>

            </div>

          </div>

          {/* SIMULATE */}

          <button
            onClick={simulate}
            disabled={loading}
            className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Running real ML prediction..."
              : "Simulate Intervention"}
          </button>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

        </div>

        {/* RESULT */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

          {!result ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-center">

              <div>

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/5 text-2xl">
                  ↗
                </div>

                <h3 className="mt-5 font-semibold">
                  No projection yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Adjust the intervention values and run
                  the model to see the projected scenario.
                </p>

              </div>

            </div>
          ) : (
            <div>

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Model Projection
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Hypothetical Outcome
                  </h3>
                </div>

                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
                  Projected
                </span>

              </div>

              <div
                className={`mt-6 rounded-2xl border p-6 ${riskStyles[result.risk_level]}`}
              >

                <p className="text-sm opacity-70">
                  Projected Risk
                </p>

                <p className="mt-2 text-4xl font-bold">
                  {result.risk_level}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs opacity-60">
                      Risk Score
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                      {result.risk_score.toFixed(1)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs opacity-60">
                      Confidence
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                      {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-5 rounded-xl border border-slate-800 p-4">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Predicted Outcome
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {result.predicted_class}
                </p>

              </div>

              <div className="mt-5">

                <p className="text-sm font-medium">
                  Model factors
                </p>

                <div className="mt-3 space-y-2">

                  {result.top_factors
                    .slice(0, 3)
                    .map((factor) => (
                      <div
                        key={factor.feature}
                        className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2"
                      >
                        <span className="text-xs text-slate-400">
                          {factor.feature}
                        </span>

                        <span className="text-xs text-cyan-400">
                          {factor.importance.toFixed(3)}
                        </span>
                      </div>
                    ))}

                </div>

              </div>

              <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">

                <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Projected scenario — not a guaranteed outcome
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  This result is a real model inference using
                  hypothetical input values. It does not
                  represent a guaranteed future outcome.
                </p>

              </div>

            </div>
          )}

        </div>

      </div>

    </section>
  );
}