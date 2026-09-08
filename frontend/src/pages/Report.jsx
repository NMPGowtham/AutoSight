const validMockInspectionIds = [
  "LM-00117",
  "LM-00118",
  "LM-00119",
  "LM-00120",
  "LM-00121",
  "LM-00122",
  "LM-00123",
  "LM-00124",
];

import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  Package,
  User,
  CalendarDays,
  Tag,
  Globe2,
  ScanSearch,
} from "lucide-react";

import inspectionData from "../mock/inspectionData";
import StatusBadge from "../components/inspection/StatusBadge";

function Report() {
  const { inspectionId } = useParams();

  /*
   * For now we use mock data.
   *
   * Later this will come from:
   * GET /inspections/{inspection_id}/report
   */
  const inspection = useMemo(() => {
    if (!validMockInspectionIds.includes(inspectionId)) {
      return null;
    }

    return {
      ...inspectionData,
      inspection_id: inspectionId,
    };
  }, [inspectionId]);

  if (!inspection) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileText size={28} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Inspection Report
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Report Not Found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            No inspection report exists for inspection ID{" "}
            <span className="font-semibold text-slate-700">
              {inspectionId || "unknown"}
            </span>
            .
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/inspections"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Back to History
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    if (status === "PASS") {
      return <CheckCircle2 size={17} className="text-emerald-600" />;
    }

    if (status === "FAIL") {
      return <XCircle size={17} className="text-red-600" />;
    }

    return <AlertTriangle size={17} className="text-amber-600" />;
  };

  const getStatusText = (status) => {
    if (status === "PASS") {
      return "PASS";
    }

    if (status === "FAIL") {
      return "POTENTIAL VIOLATION";
    }

    return "REVIEW";
  };

  const getStatusContainer = (status) => {
    if (status === "PASS") {
      return "border-emerald-200 bg-emerald-50";
    }

    if (status === "FAIL") {
      return "border-red-200 bg-red-50";
    }

    return "border-amber-200 bg-amber-50";
  };

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

  const handleDownload = () => {
    /*
     * Backend PDF endpoint will be connected here later:
     *
     * GET /inspections/{inspection_id}/report
     *
     * For now, browser print allows:
     * Print → Save as PDF
     */
    window.print();
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* =========================================
          TOP ACTION BAR
      ========================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Link
          to="/reports"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Reports
        </Link>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Download size={16} />
            Save as PDF
          </button>
        </div>
      </div>

      {/* =========================================
          REPORT DOCUMENT
      ========================================= */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
        {/* =========================================
            REPORT HEADER
        ========================================= */}
        <div className="border-b border-slate-200 p-5 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShieldCheck size={23} />
              </div>

              <div>
                <p className="text-base font-bold text-slate-900 sm:text-lg">
                  Legal Metrology
                </p>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Inspection Management System
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <FileText size={15} className="text-slate-400" />

                  <span className="text-xs font-medium text-slate-500">
                    Official Inspection Report
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Inspection ID
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {inspection.inspection_id}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Generated on 08 Sep 2026
              </p>
            </div>
          </div>
        </div>

        {/* =========================================
            OVERALL RESULT
        ========================================= */}
        <div className="border-b border-slate-200 bg-slate-50 p-5 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Overall Assessment
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StatusBadge status={inspection.status} />

                <span className="text-sm text-slate-500">
                  Compliance assessment completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Compliance Score
                </p>

                <p
                  className={`mt-1 text-4xl font-bold ${getScoreClass(
                    inspection.score,
                  )}`}
                >
                  {inspection.score}%
                </p>
              </div>

              <div className="h-14 w-px bg-slate-200" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Passed</p>

                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {inspection.summary.passed}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Review</p>

                  <p className="mt-1 text-lg font-bold text-amber-600">
                    {inspection.summary.review}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Failed</p>

                  <p className="mt-1 text-lg font-bold text-red-600">
                    {inspection.summary.failed}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            PRODUCT INFORMATION
        ========================================= */}
        <section className="border-b border-slate-200 p-5 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <Package size={18} className="text-slate-600" />

            <h2 className="text-base font-bold text-slate-900">
              Product Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Package size={14} />
                Product
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {inspection.product.name}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Tag size={14} />
                Category
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {inspection.product.category}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Globe2 size={14} />
                Imported
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {inspection.product.is_imported ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays size={14} />
                Inspection Date
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                08 Sep 2026
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            PACKAGE EVIDENCE
        ========================================= */}
        <section className="border-b border-slate-200 p-5 sm:p-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ScanSearch size={18} className="text-slate-600" />

              <h2 className="text-base font-bold text-slate-900">
                Package Evidence
              </h2>
            </div>

            <p className="text-xs text-slate-500">
              Image captured during inspection
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex min-h-[420px] items-center justify-center p-4 sm:min-h-[520px]">
              <img
                src={inspection.image_url}
                alt={`${inspection.product.name} package`}
                className="max-h-[500px] w-auto max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">Source image</p>

                <p className="text-xs font-medium text-slate-600">
                  {inspection.image_width} × {inspection.image_height}px
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            EXTRACTED DECLARATIONS
        ========================================= */}
        <section className="border-b border-slate-200 p-5 sm:p-8">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Extracted Declarations
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Information detected from the package image.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Field
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Extracted Value
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Confidence
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Evidence
                  </th>
                </tr>
              </thead>

              <tbody>
                {inspection.fields.map((field, index) => (
                  <tr
                    key={`${field.field}-${index}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold capitalize text-slate-800">
                        {field.field.replace(/_/g, " ")}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700">
                        {field.value || "Not detected"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {Math.round(field.confidence * 100)}%
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {field.bbox ? (
                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          Bounding box detected
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================
            COMPLIANCE RULE RESULTS
        ========================================= */}
        <section className="border-b border-slate-200 p-5 sm:p-8">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Compliance Rule Results
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Rules evaluated against the extracted package declarations.
            </p>
          </div>

          <div className="space-y-3">
            {inspection.rules.map((rule, index) => (
              <div
                key={`${rule.rule_id}-${index}`}
                className={`rounded-lg border p-4 ${getStatusContainer(
                  rule.status,
                )}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="mt-0.5 shrink-0">
                      {getStatusIcon(rule.status)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {rule.rule_id}
                        </p>

                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                          {rule.severity}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                        {rule.field.replace(/_/g, " ")}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {rule.message}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 lg:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      {getStatusText(rule.status)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Confidence: {Math.round(rule.confidence * 100)}%
                    </p>
                  </div>
                </div>

                {(rule.actual_value || rule.expected_value) && (
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200/70 pt-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Actual Value
                      </p>

                      <p className="mt-1 text-xs text-slate-700">
                        {rule.actual_value || "Not detected"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Expected
                      </p>

                      <p className="mt-1 text-xs text-slate-700">
                        {rule.expected_value || "Not specified"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================
            VIOLATIONS / REVIEW ITEMS
        ========================================= */}
        <section className="border-b border-slate-200 p-5 sm:p-8">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Potential Violations & Review Items
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Items requiring inspector attention or further verification.
            </p>
          </div>

          <div className="space-y-3">
            {inspection.rules
              .filter(
                (rule) => rule.status === "FAIL" || rule.status === "REVIEW",
              )
              .map((rule, index) => (
                <div
                  key={`${rule.rule_id}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        rule.status === "FAIL"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {rule.status === "FAIL" ? (
                        <XCircle size={17} />
                      ) : (
                        <AlertTriangle size={17} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {rule.rule_id}
                        </p>

                        <StatusBadge status={rule.status} />
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {rule.message}
                      </p>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Field
                          </p>

                          <p className="mt-1 text-xs font-medium capitalize text-slate-700">
                            {rule.field.replace(/_/g, " ")}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Confidence
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {Math.round(rule.confidence * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* =========================================
            FINAL ASSESSMENT
        ========================================= */}
        <section className="border-b border-slate-200 p-5 sm:p-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Final Assessment
                  </p>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                    This report summarizes the automated inspection analysis.
                    Potential violations and review items should be verified by
                    the authorized inspector before taking enforcement action.
                  </p>
                </div>
              </div>

              <div className="shrink-0 sm:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Result
                </p>

                <div className="mt-1">
                  <StatusBadge status={inspection.status} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            INSPECTOR INFORMATION
        ========================================= */}
        <section className="p-5 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <User size={18} className="text-slate-600" />

            <h2 className="text-base font-bold text-slate-900">
              Inspector Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Inspector</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                Inspector 1
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Inspection ID</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {inspection.inspection_id}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Report Status</p>

              <div className="mt-1">
                <StatusBadge status={inspection.status} />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-xs leading-5 text-slate-400">
              This report is generated from the Legal Metrology Inspection
              Management System. The automated analysis assists inspection
              workflows and does not replace final verification by an authorized
              officer.
            </p>
          </div>
        </section>
      </div>

      {/* =========================================
          BOTTOM ACTIONS
      ========================================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between print:hidden">
        <Link
          to="/reports"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </Link>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 sm:flex-none"
          >
            <Download size={16} />
            Save PDF
          </button>
        </div>
      </div>

      {/* =========================================
          PRINT CSS
      ========================================= */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              background: white !important;
            }

            main {
              padding: 0 !important;
              overflow: visible !important;
            }

            .print\\\\:hidden {
              display: none !important;
            }

            * {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Report;
