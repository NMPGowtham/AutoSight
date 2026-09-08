import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import dashboardData from "../mock/dashboardData";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/inspection/StatusBadge";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const overview = dashboardData.overview;
  const myActivity = dashboardData.myActivity;

  const userName = user?.name || "Inspector";
  const firstName = userName.split(" ")[0];

  const getScoreClass = (score) => {
    if (score >= 90) {
      return "text-emerald-600";
    }

    if (score >= 75) {
      return "text-amber-600";
    }

    return "text-red-600";
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {/* =========================================================
          WELCOME SECTION
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <ShieldCheck size={18} className="text-slate-700" />
              </span>

              <span className="text-sm font-medium text-slate-500">
                Legal Metrology Inspection System
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome, {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Monitor packaged commodity inspections, review compliance results,
              and start a new inspection from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/inspection/new")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus size={18} />
            New Inspection
          </button>
        </div>
      </section>

      {/* =========================================================
          SYSTEM OVERVIEW
      ========================================================== */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">System Overview</h2>

          <p className="mt-1 text-sm text-slate-500">
            Overall inspection activity across the system
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Inspections"
            value={overview.totalInspections.toLocaleString()}
            icon={ClipboardCheck}
            description="Inspections completed"
          />

          <StatCard
            title="Passed"
            value={overview.passed.toLocaleString()}
            icon={CheckCircle2}
            description="Compliant packages"
          />

          <StatCard
            title="Under Review"
            value={overview.underReview.toLocaleString()}
            icon={Search}
            description="Require attention"
          />

          <StatCard
            title="Violations"
            value={overview.violations.toLocaleString()}
            icon={FileWarning}
            description="Non-compliant cases"
          />
        </div>
      </section>

      {/* =========================================================
          MY ACTIVITY
      ========================================================== */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">My Activity</h2>

          <p className="mt-1 text-sm text-slate-500">
            Your inspection activity and compliance performance
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <ClipboardCheck size={20} className="text-slate-700" />
              </div>

              <TrendingUp size={18} className="text-emerald-500" />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              My Inspections
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {myActivity.totalInspections}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">My Passed</p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {myActivity.passed}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Successfully compliant
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Search size={20} className="text-amber-600" />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              My Reviews
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {myActivity.underReview}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Require further attention
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle size={20} className="text-red-600" />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              My Violations
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {myActivity.violations}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Cases requiring action
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CHART + COMPLIANCE SUMMARY
      ========================================================== */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Violation Trend
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Number of violations identified over recent months
              </p>
            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              Last 6 months
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.violationTrend}
                margin={{
                  top: 5,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                />

                <Bar
                  dataKey="violations"
                  name="Violations"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Compliance Rate
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Overall system performance
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div
              className="relative flex h-40 w-40 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
        #10b981 ${overview.complianceRate}%,
        #e2e8f0 ${overview.complianceRate}% 100%
      )`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {overview.complianceRate}%
                </span>

                <span className="mt-1 text-xs font-medium text-slate-500">
                  compliant
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Passed
              </span>

              <span className="font-semibold text-slate-900">
                {overview.passed}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Review
              </span>

              <span className="font-semibold text-slate-900">
                {overview.underReview}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Violations
              </span>

              <span className="font-semibold text-slate-900">
                {overview.violations}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          RECENT INSPECTIONS
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Inspections
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest inspections recorded in the system
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/inspections")}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Desktop/tablet */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Inspection
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Inspector
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Score
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {dashboardData.recentInspections.map((inspection) => (
                <tr
                  key={inspection.id}
                  onClick={() => navigate(`/inspections/${inspection.id}`)}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900">
                      {inspection.id}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {inspection.product}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {inspection.category}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {inspection.inspector}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {inspection.date}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-bold ${getScoreClass(
                        inspection.score,
                      )}`}
                    >
                      {inspection.score}%
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={inspection.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {dashboardData.recentInspections.map((inspection) => (
            <button
              key={inspection.id}
              type="button"
              onClick={() => navigate(`/inspections/${inspection.id}`)}
              className="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {inspection.id}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {inspection.product}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {inspection.category}
                  </p>
                </div>

                <StatusBadge status={inspection.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-slate-400">Inspector</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {inspection.inspector}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Date</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {inspection.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Compliance Score</p>

                  <p
                    className={`mt-1 text-sm font-bold ${getScoreClass(
                      inspection.score,
                    )}`}
                  >
                    {inspection.score}%
                  </p>
                </div>

                <div className="flex items-end justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    Open
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate("/inspection/new")}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Plus size={20} />
            </div>

            <ArrowRight
              size={18}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
            />
          </div>

          <h3 className="mt-5 font-semibold text-slate-900">
            Start New Inspection
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Upload a packaged commodity image and begin AI-powered compliance
            analysis.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/inspections")}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ClipboardCheck size={20} />
            </div>

            <ArrowRight
              size={18}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
            />
          </div>

          <h3 className="mt-5 font-semibold text-slate-900">
            Inspection History
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Search and review inspections that have already been processed.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/reports")}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileWarning size={20} />
            </div>

            <ArrowRight
              size={18}
              className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
            />
          </div>

          <h3 className="mt-5 font-semibold text-slate-900">
            Compliance Reports
          </h3>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Access inspection reports and compliance documentation.
          </p>
        </button>
      </section>
    </div>
  );
}

export default Dashboard;
