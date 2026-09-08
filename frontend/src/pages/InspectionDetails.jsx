import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import inspectionData from "../mock/inspectionData";
import StatusBadge from "../components/inspection/StatusBadge";
import ImageViewer from "../components/inspection/ImageViewer";
import ComplianceScore from "../components/inspection/ComplianceScore";

/*
  Mock inspection IDs currently available in the frontend.

  Later, when the Python backend is connected, this local
  validation will be replaced by the API response.
*/
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

function InspectionDetails() {
  const { inspectionId } = useParams();

  const isValidMockInspection = validMockInspectionIds.includes(inspectionId);

  /*
    Only use the mock inspection data when the ID is valid.

    This prevents:
      /inspections/xyz123

    from incorrectly displaying the Basmati Rice demo record.
  */
  const data = useMemo(() => {
    if (!isValidMockInspection) {
      return null;
    }

    return {
      ...inspectionData,
      inspection_id: inspectionId,
    };
  }, [inspectionId, isValidMockInspection]);

  const [expandedRule, setExpandedRule] = useState(null);

  /*
    ==========================================================
    INSPECTION NOT FOUND
    ==========================================================
  */
  if (!data) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Package size={28} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Inspection Record
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Inspection Not Found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            No inspection record exists for inspection ID{" "}
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

  const passedRules = data.rules.filter((rule) => rule.status === "PASS");

  const reviewRules = data.rules.filter((rule) => rule.status === "REVIEW");

  const failedRules = data.rules.filter((rule) => rule.status === "FAIL");

  const getConfidenceClass = (confidence) => {
    const value = confidence * 100;

    if (value >= 90) {
      return "text-emerald-600";
    }

    if (value >= 75) {
      return "text-amber-600";
    }

    return "text-red-600";
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-6 sm:mb-8">
        <Link
          to="/inspections"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={15} />
          Back to Inspection History
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Inspection Details
              </h1>

              <StatusBadge status={data.status} />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Complete inspection record for{" "}
              <span className="font-semibold text-slate-700">
                {data.inspection_id}
              </span>
            </p>
          </div>

          <Link
            to={`/inspections/${data.inspection_id}/report`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FileText size={16} />
            View Report
          </Link>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}
      <div className="mb-6">
        <ComplianceScore
          score={data.score}
          summary={data.summary}
          status={data.status}
        />
      </div>

      {/* =====================================================
          BASIC INFORMATION
      ====================================================== */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Package size={18} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Inspection Information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Product and inspection metadata
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          <InfoItem label="Inspection ID" value={data.inspection_id} />

          <InfoItem label="Product" value={data.product.name} />

          <InfoItem label="Category" value={data.product.category} />

          <InfoItem
            label="Imported"
            value={data.product.is_imported ? "Yes" : "No"}
          />

          <InfoItem
            label="Date"
            value="08 Sep 2026"
            icon={<CalendarDays size={13} />}
          />

          <InfoItem
            label="Inspector"
            value="Inspector 1"
            icon={<UserRound size={13} />}
          />
        </div>
      </div>

      {/* =====================================================
          PACKAGE EVIDENCE
      ====================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Package Evidence
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Original package image with detected declaration locations.
            </p>
          </div>

          <ImageViewer
            imageUrl={data.image_url}
            fields={data.fields}
            imageWidth={data.image_width}
            imageHeight={data.image_height}
          />
        </div>

        {/* Extracted Fields */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Extracted Fields
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              OCR values and detection confidence.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {data.fields.map((field) => (
                <div key={field.field} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {field.field.replaceAll("_", " ")}
                    </p>

                    <span
                      className={`shrink-0 text-xs font-bold ${getConfidenceClass(
                        field.confidence,
                      )}`}
                    >
                      {Math.round(field.confidence * 100)}%
                    </span>
                  </div>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {field.value || "Not detected"}
                  </p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-700"
                      style={{
                        width: `${field.confidence * 100}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Bounding box: [{field.bbox?.join(", ") || "Not available"}]
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          RULE RESULTS
      ====================================================== */}
      <div className="mb-6">
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">
            Rule Evaluation
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Detailed results returned by the compliance rule engine.
          </p>
        </div>

        {/* Rule Counts */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <RuleCount
            label="Passed"
            count={passedRules.length}
            className="bg-emerald-50 text-emerald-700"
          />

          <RuleCount
            label="Review"
            count={reviewRules.length}
            className="bg-amber-50 text-amber-700"
          />

          <RuleCount
            label="Failed"
            count={failedRules.length}
            className="bg-red-50 text-red-700"
          />
        </div>

        {/* Rules */}
        <div className="space-y-3">
          {data.rules.map((rule) => {
            const isExpanded = expandedRule === rule.rule_id;

            return (
              <div
                key={rule.rule_id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedRule(isExpanded ? null : rule.rule_id)
                  }
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={rule.status} size="small" />

                      <span className="text-[11px] font-medium text-slate-400">
                        {rule.rule_id}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold capitalize text-slate-900">
                      {rule.field.replaceAll("_", " ")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {rule.message}
                    </p>
                  </div>

                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <DetailItem label="Status" value={rule.status} />

                      <DetailItem label="Severity" value={rule.severity} />

                      <DetailItem
                        label="Confidence"
                        value={`${Math.round(rule.confidence * 100)}%`}
                      />

                      <DetailItem label="Rule ID" value={rule.rule_id} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Actual Value
                        </p>

                        <p className="mt-2 break-words text-sm font-medium text-slate-800">
                          {rule.actual_value || "Not detected"}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Expected Value
                        </p>

                        <p className="mt-2 break-words text-sm font-medium text-slate-800">
                          {rule.expected_value || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Rule Assessment
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {rule.message}
                      </p>
                    </div>

                    {rule.bbox && (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Evidence Bounding Box
                        </p>

                        <p className="mt-2 font-mono text-xs text-slate-700">
                          [{rule.bbox.join(", ")}]
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ShieldCheck size={17} />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Assessment status
              </p>

              <p className="text-sm font-semibold text-slate-900">
                {data.status === "PASS"
                  ? "Package appears compliant"
                  : data.status === "REVIEW"
                    ? "Manual review recommended"
                    : "Potential violations detected"}
              </p>
            </div>
          </div>

          <Link
            to={`/inspections/${data.inspection_id}/report`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FileText size={16} />
            Generate Report
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INFORMATION ITEM
============================================================ */

function InfoItem({ label, value, icon }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 flex items-center gap-1.5 break-words text-sm font-semibold text-slate-900">
        {icon}
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   RULE COUNT
============================================================ */

function RuleCount({ label, count, className }) {
  return (
    <div className={`rounded-lg p-3 text-center ${className}`}>
      <p className="text-xl font-bold">{count}</p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

/* ============================================================
   RULE DETAIL ITEM
============================================================ */

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default InspectionDetails;
