"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";

type SimulationResult = {
  risk_level: "Low" | "Medium" | "High";
  predicted_class: string;
  confidence: number;
  risk_score: number;
  top_factors?: Factor[];
  protective_factors?: Factor[];
};

type Student = {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
};

type Factor = {
  feature: string;
  importance: number;
  contribution: number;
};

type Prediction = {
  id: string;
  risk_level: "Low" | "Medium" | "High";
  predicted_class: string;
  confidence: number;
  risk_score: number;
  top_factors: Factor[];
  protective_factors: Factor[];
  created_at: string;
};

type WeeklyMetric = {
  week: number;
  attendance: number;
  marks: number;
  assignment_completion: number;
  participation: number;
};

export default function StudentProfile() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [simAttendance, setSimAttendance] = useState(80);
  const [simAssignments, setSimAssignments] = useState(80);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function loadStudent() {
      const [
        { data: studentData, error: studentError },
        { data: predictionData, error: predictionError },
        { data: metricsData, error: metricsError },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("id, name, email, department, year")
          .eq("id", studentId)
          .single(),

        supabase
          .from("predictions")
          .select(
            "id, risk_level, predicted_class, confidence, risk_score, top_factors, protective_factors, created_at"
          )
          .eq("student_id", studentId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),

        supabase
          .from("weekly_metrics")
          .select(
            "week, attendance, marks, assignment_completion, participation"
          )
          .eq("student_id", studentId)
          .order("week", { ascending: true }),
      ]);

      if (studentError) {
        console.error("Student loading error:", studentError);
      }

      if (predictionError) {
        console.error("Prediction loading error:", predictionError);
      }

      if (metricsError) {
        console.error("Weekly metrics loading error:", metricsError);
      }

      setStudent(studentData);
      setPrediction(predictionData);
      setWeeklyMetrics(metricsData || []);
      setLoading(false);
    }

    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

  async function simulateIntervention() {
    setSimulating(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendance: simAttendance,
          marks: 75,
          assignment_completion: simAssignments,
          previous_gpa: 7.5,
          participation: 80,
          backlogs: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const result = await response.json();

      setSimulation(result);
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Could not connect to the DropZero ML backend.");
    } finally {
      setSimulating(false);
    }
  }
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-400">
            Loading student intelligence...
          </p>
        </div>
      </main>
    );
  }

  if (!student || !prediction) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold">
            Student not found
          </h1>

          <p className="mt-2 text-slate-400">
            No student or prediction data could be loaded for this ID.
          </p>
        </div>
      </main>
    );
  }

  const riskStyles = {
    Low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    Medium: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    High: "border-red-400/30 bg-red-400/10 text-red-400",
  };

  const trendData = weeklyMetrics.map((metric) => ({
    week: `Week ${metric.week}`,
    Attendance: metric.attendance,
    Marks: metric.marks,
    Assignments: metric.assignment_completion,
    Participation: metric.participation,
  }));

  const firstWeek = weeklyMetrics[0];
  const latestWeek = weeklyMetrics[weeklyMetrics.length - 1];

  const getChange = (latest: number, previous: number) => {
    const change = latest - previous;

    if (change > 0) {
      return {
        value: `+${change.toFixed(1)}`,
        className: "text-emerald-400",
        symbol: "↑",
      };
    }

    if (change < 0) {
      return {
        value: change.toFixed(1),
        className: "text-red-400",
        symbol: "↓",
      };
    }

    return {
      value: "0.0",
      className: "text-slate-400",
      symbol: "→",
    };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl p-6 md:p-10">

        {/* BACK */}
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium tracking-wider text-cyan-400">
            STUDENT PROFILE
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {student.name}
          </h1>

          <p className="mt-2 text-slate-400">
            {student.department} · Year {student.year}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {student.email}
          </p>
        </div>

        {/* RISK SUMMARY */}
        <div className="grid gap-5 md:grid-cols-4">

          {/* RISK */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Current Risk
            </p>

            <div
              className={`mt-4 inline-block rounded-full border px-4 py-2 text-lg font-bold ${riskStyles[prediction.risk_level]}`}
            >
              {prediction.risk_level}
            </div>
          </div>

          {/* SCORE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Risk Score
            </p>

            <p className="mt-4 text-3xl font-bold">
              {prediction.risk_score.toFixed(1)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Model-derived score
            </p>
          </div>

          {/* CONFIDENCE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Confidence
            </p>

            <p className="mt-4 text-3xl font-bold">
              {(prediction.confidence * 100).toFixed(1)}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Random Forest probability
            </p>
          </div>

          {/* OUTCOME */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Predicted Outcome
            </p>

            <p className="mt-4 text-xl font-bold">
              {prediction.predicted_class}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              UCI-trained model
            </p>
          </div>

        </div>

        {/* TREND */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col justify-between gap-2 md:flex-row">
            <div>
              <h2 className="text-xl font-semibold">
                3-Week Student Trend
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Real weekly metrics stored in Supabase
              </p>
            </div>

            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs text-cyan-300">
              Live student history
            </div>
          </div>

          {trendData.length > 0 ? (
            <div className="mt-8 h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="week"
                    stroke="#64748b"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Attendance"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Marks"
                    stroke="#a78bfa"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Assignments"
                    stroke="#34d399"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Participation"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
              <p className="text-slate-400">
                No weekly metrics available.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-400">
            <span>● Attendance</span>
            <span>● Marks</span>
            <span>● Assignments</span>
            <span>● Participation</span>
          </div>

        </section>

        {/* WHAT CHANGED */}
        {firstWeek && latestWeek && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div>
              <h2 className="text-xl font-semibold">
                What Changed?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Week-over-week movement in key student signals
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">

                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-4">
                      Signal
                    </th>

                    <th className="pb-4">
                      Week 1
                    </th>

                    <th className="pb-4">
                      Latest
                    </th>

                    <th className="pb-4">
                      Change
                    </th>

                    <th className="pb-4">
                      Direction
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {[
                    {
                      name: "Attendance",
                      first: firstWeek.attendance,
                      latest: latestWeek.attendance,
                    },
                    {
                      name: "Marks",
                      first: firstWeek.marks,
                      latest: latestWeek.marks,
                    },
                    {
                      name: "Assignment Completion",
                      first: firstWeek.assignment_completion,
                      latest: latestWeek.assignment_completion,
                    },
                    {
                      name: "Participation",
                      first: firstWeek.participation,
                      latest: latestWeek.participation,
                    },
                  ].map((item) => {
                    const change = getChange(
                      item.latest,
                      item.first
                    );

                    return (
                      <tr
                        key={item.name}
                        className="border-b border-slate-800/70"
                      >
                        <td className="py-4 font-medium">
                          {item.name}
                        </td>

                        <td className="py-4 text-slate-400">
                          {item.first.toFixed(1)}%
                        </td>

                        <td className="py-4 font-medium">
                          {item.latest.toFixed(1)}%
                        </td>

                        <td
                          className={`py-4 font-semibold ${change.className}`}
                        >
                          {change.value}
                        </td>

                        <td
                          className={`py-4 text-lg ${change.className}`}
                        >
                          {change.symbol}
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>

          </section>
        )}

        {/* MODEL FACTORS */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* CONTRIBUTING FACTORS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Top Contributing Factors
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Derived from the trained Random Forest model
            </p>

            <div className="mt-6 space-y-4">

              {prediction.top_factors
                .slice(0, 3)
                .map((factor) => (
                  <div
                    key={factor.feature}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex justify-between gap-4">

                      <span className="text-sm">
                        {factor.feature}
                      </span>

                      <span className="text-sm font-medium text-cyan-400">
                        {factor.importance.toFixed(3)}
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{
                          width: `${Math.min(
                            factor.importance * 500,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Contribution:{" "}
                      {factor.contribution.toFixed(2)}
                    </p>

                  </div>
                ))}

            </div>

          </section>

          {/* PROTECTIVE FACTORS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Protective Factors
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Model-derived factors present in the student&apos;s input
            </p>

            <div className="mt-6 space-y-4">

              {prediction.protective_factors
                .slice(0, 3)
                .map((factor) => (
                  <div
                    key={factor.feature}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >

                    <div className="flex justify-between">

                      <span className="text-sm">
                        {factor.feature}
                      </span>

                      <span className="text-sm font-medium text-emerald-400">
                        {factor.importance.toFixed(3)}
                      </span>

                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Contribution:{" "}
                      {factor.contribution.toFixed(2)}
                    </p>

                  </div>
                ))}

            </div>

          </section>

        </div>

        {/* RECOMMENDED ACTION */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            Recommended Action
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Suggested based on the student&apos;s current risk signals
          </p>

          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5">

            <p className="font-medium text-cyan-300">
              Supportive academic outreach
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Review the student&apos;s recent academic signals
              and coordinate an appropriate support action.
            </p>

          </div>

        </section>

        <section className="mt-6 rounded-2xl border border-cyan-400/20 bg-slate-900 p-6">

  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-xs font-semibold tracking-wider text-cyan-400">
        INTERVENTION SIMULATOR
      </p>

      <h2 className="mt-2 text-xl font-semibold">
        What if support improves the student&apos;s engagement?
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Adjust the hypothetical values and run the real trained model.
      </p>
    </div>

    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
      Projected · not guaranteed
    </span>
  </div>

  <div className="mt-8 grid gap-8 md:grid-cols-2">

    <div className="space-y-6">

      <div>
        <div className="mb-2 flex justify-between">
          <label className="text-sm text-slate-300">
            Attendance
          </label>

          <span className="font-semibold text-cyan-400">
            {simAttendance}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={simAttendance}
          onChange={(e) =>
            setSimAttendance(Number(e.target.value))
          }
          className="w-full accent-cyan-400"
        />
      </div>

      <div>
        <div className="mb-2 flex justify-between">
          <label className="text-sm text-slate-300">
            Assignment Completion
          </label>

          <span className="font-semibold text-cyan-400">
            {simAssignments}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={simAssignments}
          onChange={(e) =>
            setSimAssignments(Number(e.target.value))
          }
          className="w-full accent-cyan-400"
        />
      </div>

      <button
        onClick={simulateIntervention}
        disabled={simulating}
        className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {simulating
          ? "Running real ML prediction..."
          : "Simulate Intervention"}
      </button>

    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

      {!simulation ? (
        <div className="flex h-full min-h-[180px] items-center justify-center text-center">
          <div>
            <p className="text-slate-400">
              No projection yet
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Adjust the sliders and run the model.
            </p>
          </div>
        </div>
      ) : (
        <div>

          <p className="text-xs font-medium text-slate-500">
            PROJECTED MODEL RESULT
          </p>

          <div className="mt-4 flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Projected Risk
              </p>

              <p className="mt-1 text-4xl font-bold">
                {simulation.risk_level}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">
                Confidence
              </p>

              <p className="mt-1 text-2xl font-bold text-cyan-400">
                {(simulation.confidence * 100).toFixed(1)}%
              </p>
            </div>

          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-500">
                Risk Score
              </p>

              <p className="mt-1 text-xl font-semibold">
                {simulation.risk_score.toFixed(1)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 p-4">
              <p className="text-xs text-slate-500">
                Outcome
              </p>

              <p className="mt-1 text-xl font-semibold">
                {simulation.predicted_class}
              </p>
            </div>

          </div>

          <p className="mt-5 text-xs leading-5 text-amber-300">
            This is a projected scenario generated by the real
            DropZero ML model using hypothetical input values.
            It is not a guaranteed outcome.
          </p>

        </div>
      )}

    </div>

  </div>

</section>

        {/* MODEL DISCLOSURE */}
        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-6 text-amber-300">

          <strong>Model limitation:</strong>{" "}
          Risk assessment is generated by the trained UCI
          benchmark model. Production deployment would require
          retraining and validation using institution-specific
          historical outcome data.

        </div>

      </div>
    </main>
  );
}