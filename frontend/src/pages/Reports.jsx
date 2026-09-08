import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Eye,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ClipboardList,
} from "lucide-react";

import StatusBadge from "../components/inspection/StatusBadge";
import inspectionData from "../mock/inspectionData";

const reportsData = [
  {
    inspection_id: "LM-00124",
    product: "Basmati Rice",
    category: "Food",
    date: "08 Sep 2026",
    score: 82,
    status: "REVIEW",
    inspector: "Inspector 1",
  },
  {
    inspection_id: "LM-00123",
    product: "Refined Sunflower Oil",
    category: "Edible Oil",
    date: "07 Sep 2026",
    score: 96,
    status: "PASS",
    inspector: "Inspector 1",
  },
  {
    inspection_id: "LM-00122",
    product: "Bathing Soap",
    category: "Personal Care",
    date: "06 Sep 2026",
    score: 91,
    status: "PASS",
    inspector: "Inspector 2",
  },
  {
    inspection_id: "LM-00121",
    product: "Packaged Sugar",
    category: "Food",
    date: "05 Sep 2026",
    score: 64,
    status: "FAIL",
    inspector: "Inspector 1",
  },
  {
    inspection_id: "LM-00120",
    product: "Wheat Flour",
    category: "Food",
    date: "04 Sep 2026",
    score: 88,
    status: "REVIEW",
    inspector: "Inspector 3",
  },
  {
    inspection_id: "LM-00119",
    product: "Detergent Powder",
    category: "Household",
    date: "03 Sep 2026",
    score: 97,
    status: "PASS",
    inspector: "Inspector 2",
  },
];

function Reports() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredReports = useMemo(() => {
    return reportsData.filter((report) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        report.inspection_id.toLowerCase().includes(searchTerm) ||
        report.product.toLowerCase().includes(searchTerm) ||
        report.inspector.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const passCount = reportsData.filter(
    (report) => report.status === "PASS",
  ).length;

  const reviewCount = reportsData.filter(
    (report) => report.status === "REVIEW",
  ).length;

  const failCount = reportsData.filter(
    (report) => report.status === "FAIL",
  ).length;

  const averageScore = Math.round(
    reportsData.reduce((total, report) => total + report.score, 0) /
      reportsData.length,
  );

  const getScoreClass = (score) => {
    if (score >= 90) {
      return "text-emerald-600";
    }

    if (score >= 75) {
      return "text-amber-600";
    }

    return "text-red-600";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <FileText size={16} />
            <span>Reports</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Inspection Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage generated inspection reports.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Printer size={16} />
          Print
        </button>
      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total reports */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ClipboardList size={20} />
            </div>

            <span className="text-xs font-medium text-slate-400">REPORTS</span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {reportsData.length}
          </p>

          <p className="mt-1 text-sm text-slate-500">Total generated</p>
        </div>

        {/* Passed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <span className="text-xs font-medium text-emerald-600">PASS</span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">{passCount}</p>

          <p className="mt-1 text-sm text-slate-500">Compliant inspections</p>
        </div>

        {/* Review */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle size={20} />
            </div>

            <span className="text-xs font-medium text-amber-600">REVIEW</span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {reviewCount}
          </p>

          <p className="mt-1 text-sm text-slate-500">Need verification</p>
        </div>

        {/* Average score */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <XCircle size={20} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              AVG SCORE
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {averageScore}%
          </p>

          <p className="mt-1 text-sm text-slate-500">Overall compliance</p>
        </div>
      </div>

      {/* =========================================
          REPORTS SECTION
      ========================================= */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Toolbar */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Generated Reports
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select an inspection to view its complete report.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search reports..."
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 sm:w-64"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="ALL">All Status</option>

                <option value="PASS">Pass</option>

                <option value="REVIEW">Review</option>

                <option value="FAIL">Fail</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================
            DESKTOP TABLE
        ========================================= */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Inspection
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Score
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.inspection_id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  {/* Inspection */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {report.inspection_id}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {report.inspector}
                    </p>
                  </td>

                  {/* Product */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {report.product}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {report.category}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {report.date}
                  </td>

                  {/* Score */}
                  <td className="px-5 py-4">
                    <span
                      className={`text-sm font-bold ${getScoreClass(
                        report.score,
                      )}`}
                    >
                      {report.score}%
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={report.status} />
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/inspections/${report.inspection_id}/report`}
                      state={
                        report.inspection_id === inspectionData.inspection_id
                          ? {
                              inspection: inspectionData,
                            }
                          : undefined
                      }
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center">
                    <FileText size={28} className="mx-auto text-slate-300" />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No reports found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =========================================
            MOBILE CARDS
        ========================================= */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filteredReports.map((report) => (
            <div key={report.inspection_id} className="p-4">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {report.inspection_id}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-700">
                    {report.product}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {report.category}
                  </p>
                </div>

                <StatusBadge status={report.status} />
              </div>

              {/* Card details */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Score
                  </p>

                  <p
                    className={`mt-1 text-sm font-bold ${getScoreClass(
                      report.score,
                    )}`}
                  >
                    {report.score}%
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {report.date}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Inspector
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-slate-700">
                    {report.inspector}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-slate-700">
                    {report.category}
                  </p>
                </div>
              </div>

              {/* View button */}
              <Link
                to={`/inspections/${report.inspection_id}/report`}
                className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                <Eye size={15} />
                View Report
              </Link>
            </div>
          ))}

          {/* Mobile empty state */}
          {filteredReports.length === 0 && (
            <div className="px-5 py-14 text-center">
              <FileText size={28} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No reports found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          REPORT INFORMATION
      ========================================= */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Report contents
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Each inspection report contains package evidence, extracted
              declarations, compliance rules, potential violations, confidence
              scores, compliance results, and inspector information.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================
          PRINT STYLES
      ========================================= */}
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            button,
            aside,
            header {
              display: none !important;
            }

            main {
              padding: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Reports;
