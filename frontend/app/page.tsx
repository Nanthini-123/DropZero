"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  name: string;
  department: string;
  year: number;
};

type Prediction = {
  student_id: string;
  risk_level: "Low" | "Medium" | "High";
  risk_score: number;
  confidence: number;
};

export default function Home() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const [
      { data: studentData },
      { data: predictionData },
    ] = await Promise.all([
      supabase
        .from("students")
        .select("id, name, department, year"),

      supabase
        .from("predictions")
        .select(
          "student_id, risk_level, risk_score, confidence"
        )
        .order("created_at", {
          ascending: false,
        }),
    ]);

    setStudents(studentData ?? []);
    setPredictions(predictionData ?? []);
    setLoading(false);
  }

  const latestPredictions = new Map<string, Prediction>();

  predictions.forEach((prediction) => {
    if (!latestPredictions.has(prediction.student_id)) {
      latestPredictions.set(
        prediction.student_id,
        prediction
      );
    }
  });

  const latest = Array.from(
    latestPredictions.values()
  );

  const high = latest.filter(
    (p) => p.risk_level === "High"
  ).length;

  const medium = latest.filter(
    (p) => p.risk_level === "Medium"
  ).length;

  const low = latest.filter(
    (p) => p.risk_level === "Low"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold">
            DropZero
          </div>

          <p className="mt-2 text-slate-400">
            Loading student intelligence...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-950 p-6 md:block">

          <div className="mb-10">
            <div className="text-2xl font-bold">
              Drop<span className="text-cyan-400">
                Zero
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Student Success Intelligence
            </p>
          </div>

          <nav className="space-y-2">

            <div className="rounded-xl bg-cyan-400/10 px-4 py-3 text-cyan-300">
              Dashboard
            </div>

            <div className="rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900">
              Students
            </div>

            <div className="rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900">
              Priority Queue
            </div>

            <div className="rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900">
              Manual Prediction
            </div>

            <div className="rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900">
              Model Transparency
            </div>

          </nav>

          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-500">
              MODEL
            </p>

            <p className="mt-1 font-semibold">
              Random Forest
            </p>

            <p className="mt-1 text-xs text-emerald-400">
              UCI validated
            </p>
          </div>

        </aside>

        {/* Main */}
        <section className="flex-1 p-6 md:p-10">

          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>
                <p className="text-sm font-medium text-cyan-400">
                  COHORT INTELLIGENCE
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight">
                  Student Success Dashboard
                </h1>

                <p className="mt-2 text-slate-400">
                  Identify risk early. Coordinate support.
                  Track recovery.
                </p>
              </div>

              <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400">
                ● Live from Supabase
              </div>

            </div>

            {/* KPI cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Kpi
                label="Students Monitored"
                value={students.length}
                description="Active cohort"
              />

              <Kpi
                label="High Risk"
                value={high}
                description="Immediate attention"
                danger
              />

              <Kpi
                label="Medium Risk"
                value={medium}
                description="Needs monitoring"
                warning
              />

              <Kpi
                label="Low Risk"
                value={low}
                description="Currently stable"
                success
              />

            </div>

            {/* Priority section */}
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70">

              <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-6 md:flex-row md:items-center">

                <div>
                  <h2 className="text-xl font-semibold">
                    Intervention Priority
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Rule-based priority — not dropout
                    probability
                  </p>
                </div>

                <button
                  onClick={loadDashboard}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                >
                  Refresh
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">

                    <tr>
                      <th className="px-6 py-4">
                        Student
                      </th>

                      <th className="px-6 py-4">
                        Department
                      </th>

                      <th className="px-6 py-4">
                        Risk
                      </th>

                      <th className="px-6 py-4">
                        Score
                      </th>

                      <th className="px-6 py-4">
                        Confidence
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {students.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-sm text-slate-500"
                        >
                          No student records found.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => {
                        const prediction =
                          latestPredictions.get(
                            student.id
                          );

                        return (
                          <tr
                            key={student.id}
                            onClick={() =>
                              router.push(`/student/${student.id}`)
                            }
                            className="cursor-pointer border-b border-slate-800/70 transition hover:bg-slate-800/40"
                          >

                            <td className="px-6 py-4">

                              <div className="font-medium">
                                {student.name}
                              </div>

                              <div className="text-xs text-slate-500">
                                Year {student.year}
                              </div>

                            </td>

                            <td className="px-6 py-4 text-sm text-slate-400">
                              {student.department}
                            </td>

                            <td className="px-6 py-4">
                              {prediction ? (
                                <RiskBadge
                                  risk={
                                    prediction.risk_level
                                  }
                                />
                              ) : (
                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                                  Pending
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 font-mono text-sm">
                              {prediction
                                ? prediction.risk_score.toFixed(1)
                                : "—"}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-400">
                              {prediction
                                ? `${(prediction.confidence * 100).toFixed(1)}%`
                                : "—"}
                            </td>

                          </tr>
                        );
                      })
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* Technical credibility */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <InfoCard
                title="Real ML"
                text="Every displayed risk comes from the trained UCI Random Forest model."
              />

              <InfoCard
                title="Explainable"
                text="Feature importance is extracted from the trained model for each prediction."
              />

              <InfoCard
                title="Persistent"
                text="Students, weekly metrics and predictions are stored in Supabase."
              />

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}


function Kpi({
  label,
  value,
  description,
  danger,
  warning,
  success,
}: {
  label: string;
  value: number;
  description: string;
  danger?: boolean;
  warning?: boolean;
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 text-4xl font-bold ${
          danger
            ? "text-red-400"
            : warning
            ? "text-amber-400"
            : success
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


function RiskBadge({
  risk,
}: {
  risk: "Low" | "Medium" | "High";
}) {
  const styles = {
    Low: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    Medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    High: "bg-red-400/10 text-red-400 border-red-400/20",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[risk]}`}
    >
      {risk}
    </span>
  );
}


function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}