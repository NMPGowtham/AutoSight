import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileText,
  Info,
  ScanSearch,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import inspectionData from "../mock/inspectionData";
import ImageViewer from "../components/inspection/ImageViewer";
import StatusBadge from "../components/inspection/StatusBadge";

function InspectionResult() {
  const { inspectionId } = useParams();
  const { user } = useAuth();

  /*
   * --------------------------------------------------------
   * SAFE INSPECTION DATA LOADING
   * --------------------------------------------------------
   *
   * During frontend development we combine:
   *   1. mock analysis data
   *   2. the actual uploaded image/details
   *
   * IMPORTANT:
   * Mock analysis must never look like real AI output.
   */
  const storedInspection = sessionStorage.getItem("current_inspection");

  let uploadedInspection = null;

  try {
    uploadedInspection = storedInspection ? JSON.parse(storedInspection) : null;
  } catch (storageError) {
    console.error("Invalid current inspection data:", storageError);
    uploadedInspection = null;
  }

  const isDemo =
    import.meta.env.VITE_USE_MOCK_API !== "false" ||
    uploadedInspection?.source === "frontend-demo";

  const inspection = {
    ...inspectionData,

    ...(uploadedInspection || {}),

    /*
     * Keep mock analysis only for frontend demonstration.
     * Real backend analysis will replace these fields later.
     */
    product: {
      ...inspectionData.product,

      ...(uploadedInspection
        ? {
            category: uploadedInspection.category,
            is_imported: uploadedInspection.is_imported,
          }
        : {}),
    },

    /*
     * Use the currently logged-in inspector when
     * mock data does not contain a real inspector.
     */
    inspector: {
      ...inspectionData.inspector,
      ...(uploadedInspection?.inspector || {}),
      ...(!inspectionData.inspector?.name && user?.name
        ? {
            name: user.name,
          }
        : {}),
    },

    /*
     * Use the actual inspection creation time when
     * available from the uploaded inspection.
     */
    inspection_date:
      uploadedInspection?.created_at || inspectionData.inspection_date,
  };

  const [selectedEvidence, setSelectedEvidence] = useState(null);

  /*
   * --------------------------------------------------------
   * MOCK INSPECTION ID VALIDATION
   * --------------------------------------------------------
   *
   * While the Python backend is not connected, the frontend
   * cannot ask the server whether an inspection exists.
   * Therefore we validate against the inspection ID that was
   * actually created/stored by the frontend or the mock data.
   *
   * Later, when VITE_USE_MOCK_API=false, the backend becomes
   * the source of truth and this local validation is skipped.
   */
  const validMockIds = [
    inspectionData?.inspection_id,
    inspectionData?.id,
    uploadedInspection?.inspection_id,
    uploadedInspection?.id,
  ].filter(Boolean);

  const isValidMockInspectionId =
    !isDemo || validMockIds.includes(inspectionId);

  const declarations = Array.isArray(inspection?.declarations)
    ? inspection.declarations
    : [];

  const rules = Array.isArray(inspection?.rules) ? inspection.rules : [];

  const violations = Array.isArray(inspection?.violations)
    ? inspection.violations
    : [];

  const fontItems = Array.isArray(inspection?.font_analysis?.items)
    ? inspection.font_analysis.items
    : [];

  const readabilityItems = Array.isArray(
    inspection?.readability_analysis?.items,
  )
    ? inspection.readability_analysis.items
    : [];

  const placementItems = Array.isArray(inspection?.placement_analysis?.items)
    ? inspection.placement_analysis.items
    : [];

  const summary = inspection?.summary || {
    total: 0,
    passed: 0,
    review: 0,
    failed: 0,
  };

  const product = inspection?.product || {};
  const inspector = inspection?.inspector || {};
  const analysis = inspection?.analysis || {};

  /*
   * In demo mode, never present the mock product as if
   * it was identified from the uploaded image.
   */
  const displayedProductName = isDemo
    ? "Sample analysis data"
    : product.name || "N/A";

  const displayedInspectionDate = inspection?.inspection_date
    ? formatDateTime(inspection.inspection_date)
    : "N/A";

  const passPercentage = useMemo(() => {
    const total = Number(summary.total) || 0;
    const passed = Number(summary.passed) || 0;

    if (total <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round((passed / total) * 100)));
  }, [summary]);

  if (!isValidMockInspectionId) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle size={30} className="text-red-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            Inspection Not Found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            We could not find an inspection with ID{" "}
            <span className="break-all font-semibold text-slate-700">
              {inspectionId || "N/A"}
            </span>
            .
          </p>

          <p className="mt-2 text-xs text-slate-400">
            The inspection may have been removed, expired, or the ID may be
            invalid.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/inspections"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Go to History
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const focusEvidence = (field) => {
    setSelectedEvidence(field);

    setTimeout(() => {
      document.getElementById("package-evidence")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/inspections"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Inspection History
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Inspection Result
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {isDemo
                  ? "Frontend demonstration using sample compliance data"
                  : "AI-assisted Legal Metrology compliance assessment"}
              </p>
            </div>

            <StatusBadge status={inspection?.status || "REVIEW"} />
          </div>
        </div>

        <Link
          to={`/inspections/${
            inspection?.inspection_id || inspectionId
          }/report`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <FileText size={17} />
          View Report
        </Link>
      </div>

      {/* =====================================================
          DEMO MODE NOTICE
      ====================================================== */}
      {isDemo && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Demo analysis — sample results are being displayed
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                The Python AI/OCR compliance engine is not connected yet. The
                uploaded image shown below is your actual upload, but the score,
                declarations, rules, violations and bounding boxes are sample
                data and are not claims about this image.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          TOP SUMMARY
      ====================================================== */}
      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* SCORE */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isDemo ? "Sample Compliance Score" : "Compliance Score"}
              </p>

              <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
                {inspection?.score ?? 0}
                <span className="text-2xl text-slate-400">/100</span>
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-100 bg-amber-50">
              <ShieldCheck size={27} className="text-amber-600" />
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-800 transition-all"
              style={{
                width: `${Math.min(Math.max(inspection?.score ?? 0, 0), 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Overall compliance</span>

            <span className="font-semibold text-slate-700">
              {passPercentage}% checks passed
            </span>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            value={summary.passed}
            label="Passed checks"
            icon={<CheckCircle2 size={20} className="text-emerald-600" />}
            iconBackground="bg-emerald-50"
          />

          <SummaryCard
            value={summary.review}
            label="Need review"
            icon={<CircleAlert size={20} className="text-amber-600" />}
            iconBackground="bg-amber-50"
          />

          <SummaryCard
            value={summary.failed}
            label="Failed checks"
            icon={<XCircle size={20} className="text-red-600" />}
            iconBackground="bg-red-50"
          />
        </div>
      </section>

      {/* =====================================================
          INSPECTION INFORMATION
      ====================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          title="Inspection Information"
          description="Basic details associated with this inspection."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Inspection ID"
            value={inspection?.inspection_id || inspectionId || "N/A"}
          />

          <InfoItem label="Inspection Date" value={displayedInspectionDate} />

          <InfoItem
            label="Inspector"
            value={inspector.name || user?.name || "N/A"}
          />

          <InfoItem
            label="Product Category"
            value={product.category || "N/A"}
          />

          <InfoItem label="Product" value={displayedProductName} />

          <InfoItem label="Brand" value={product.brand || "N/A"} />

          <InfoItem
            label="Imported Product"
            value={product.is_imported ? "Yes" : "No"}
          />

          <InfoItem
            label="Processing Time"
            value={analysis.processing_time || "N/A"}
          />
        </div>
      </section>

      {/* =====================================================
          PACKAGE EVIDENCE
      ====================================================== */}
      <section id="package-evidence" className="scroll-mt-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ScanSearch size={20} className="text-slate-700" />

              <h2 className="text-lg font-bold text-slate-900">
                Package Evidence
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {isDemo
                ? "The uploaded image is shown for preview. Bounding boxes below are sample evidence until the AI engine is connected."
                : "AI-detected declarations are highlighted directly on the package image."}
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {declarations.filter((item) => Array.isArray(item.bbox)).length}{" "}
            {isDemo ? "sample evidence points" : "visual evidence points"}
          </span>
        </div>

        {inspection?.image_url ? (
          <ImageViewer
            imageUrl={inspection.image_url}
            imageWidth={inspection.image_width || 1200}
            imageHeight={inspection.image_height || 1500}
            fields={declarations}
            selectedField={selectedEvidence}
            onFieldSelect={focusEvidence}
          />
        ) : (
          <EmptyEvidence />
        )}
      </section>

      {/* =====================================================
          DECLARATIONS
      ====================================================== */}
      <section>
        <SectionHeader
          title="Mandatory Declarations"
          description="Declarations extracted from the package and evaluated against compliance requirements."
        />

        {declarations.length === 0 ? (
          <EmptySection message="No declaration data is available." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {declarations.map((declaration) => (
              <DeclarationCard
                key={declaration.id || declaration.field}
                declaration={declaration}
                selected={
                  selectedEvidence?.id === declaration.id ||
                  selectedEvidence?.field === declaration.field
                }
                onSelect={() => focusEvidence(declaration)}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          AUTOMATED ANALYSIS
      ====================================================== */}
      <section>
        <SectionHeader
          title="Automated Analysis"
          description="Detailed analysis of font size, readability and declaration placement."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <AnalysisCard
            title="Font Size Analysis"
            icon={<ScanSearch size={18} />}
            status={inspection?.font_analysis?.overall_status || "REVIEW"}
            summary={`${inspection?.font_analysis?.passed ?? 0} passed • ${
              inspection?.font_analysis?.review ?? 0
            } review • ${inspection?.font_analysis?.failed ?? 0} failed`}
          >
            {fontItems.length > 0 ? (
              <div className="space-y-3">
                {fontItems.map((item, index) => (
                  <AnalysisRow
                    key={item.field || index}
                    label={item.field || "Unknown field"}
                    value={
                      item.detected_size != null
                        ? `${item.detected_size}${item.unit || ""}`
                        : "N/A"
                    }
                    expected={
                      item.required_size != null
                        ? `${item.required_size}${item.unit || ""}`
                        : null
                    }
                    status={item.status || "REVIEW"}
                  />
                ))}
              </div>
            ) : (
              <EmptyAnalysis />
            )}
          </AnalysisCard>

          <AnalysisCard
            title="Readability Analysis"
            icon={<Info size={18} />}
            status={
              inspection?.readability_analysis?.overall_status || "REVIEW"
            }
            summary={`Average readability score: ${
              inspection?.readability_analysis?.average_score ?? 0
            }%`}
          >
            {readabilityItems.length > 0 ? (
              <div className="space-y-3">
                {readabilityItems.map((item, index) => (
                  <AnalysisRow
                    key={item.field || index}
                    label={item.field || "Unknown field"}
                    value={item.score != null ? `${item.score}%` : "N/A"}
                    expected={item.level || null}
                    status={item.status || "REVIEW"}
                  />
                ))}
              </div>
            ) : (
              <EmptyAnalysis />
            )}
          </AnalysisCard>

          <AnalysisCard
            title="Placement Analysis"
            icon={<ArrowRight size={18} />}
            status={inspection?.placement_analysis?.overall_status || "REVIEW"}
            summary="Verification of declaration placement areas."
          >
            {placementItems.length > 0 ? (
              <div className="space-y-3">
                {placementItems.map((item, index) => (
                  <AnalysisRow
                    key={item.field || index}
                    label={item.field || "Unknown field"}
                    value={item.message || "No details available"}
                    status={item.status || "REVIEW"}
                  />
                ))}
              </div>
            ) : (
              <EmptyAnalysis />
            )}
          </AnalysisCard>
        </div>
      </section>

      {/* =====================================================
          VIOLATIONS
      ====================================================== */}
      <section>
        <SectionHeader
          title="Detected Violations & Reviews"
          description="Issues identified by the compliance engine that may require corrective action or inspector verification."
        />

        {violations.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600" />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  No violations detected
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  The compliance engine did not identify any violations.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {violations.map((violation, index) => (
              <ViolationCard
                key={violation.id || violation.rule_id || index}
                violation={violation}
                onEvidenceClick={() => {
                  const declaration = declarations.find(
                    (item) => item.field === violation.field,
                  );

                  if (declaration) {
                    focusEvidence(declaration);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          RULE EVALUATION
      ====================================================== */}
      <section>
        <SectionHeader
          title="Compliance Rule Evaluation"
          description="Individual rule checks performed by the Legal Metrology compliance engine."
        />

        {rules.length === 0 ? (
          <EmptySection message="No compliance rule results are available." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1.3fr_100px_110px_1.2fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
              <span>Rule</span>
              <span>Status</span>
              <span>Confidence</span>
              <span>Evaluation</span>
            </div>

            <div className="divide-y divide-slate-100">
              {rules.map((rule, index) => (
                <div
                  key={rule.rule_id || index}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1.3fr_100px_110px_1.2fr] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {rule.label || rule.field || "Compliance Rule"}
                    </p>

                    <p className="mt-1 font-mono text-[10px] text-slate-400">
                      {rule.rule_id || "RULE-N/A"}
                    </p>
                  </div>

                  <div>
                    <StatusBadge status={rule.status || "REVIEW"} />
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatConfidence(rule.confidence)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs leading-5 text-slate-500">
                      {rule.message || "No evaluation message available."}
                    </p>

                    <ValueLine
                      label="Actual"
                      value={rule.actual_value ?? "Not detected"}
                    />

                    <ValueLine
                      label="Expected"
                      value={rule.expected_value ?? "Not specified"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          ANALYSIS INFORMATION
      ====================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          title="Analysis Information"
          description="Technical metadata generated during automated inspection."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Analysis Engine" value={analysis.engine || "N/A"} />

          <InfoItem label="OCR" value={analysis.ocr || "N/A"} />

          <InfoItem
            label="Rules Version"
            value={analysis.rules_version || "N/A"}
          />

          <InfoItem
            label="Processed At"
            value={analysis.processed_at || "N/A"}
          />
        </div>
      </section>

      {/* =====================================================
          FINAL ACTION
      ====================================================== */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">
            Inspection analysis completed
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Review the findings and generate the formal inspection report.
          </p>
        </div>

        <Link
          to={`/inspections/${
            inspection?.inspection_id || inspectionId
          }/report`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          <FileText size={17} />
          Generate Report
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ value, label, icon, iconBackground }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBackground}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>

          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-700">
        {value || "N/A"}
      </p>
    </div>
  );
}

/* =========================================================
   DECLARATION CARD
========================================================= */

function DeclarationCard({ declaration, selected, onSelect }) {
  const status = declaration.status || "REVIEW";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border bg-white p-5 text-left shadow-sm transition ${
        selected
          ? "border-slate-400 ring-2 ring-slate-100"
          : "border-slate-200 hover:border-slate-300 hover:shadow"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              status === "PASS"
                ? "bg-emerald-50"
                : status === "FAIL"
                  ? "bg-red-50"
                  : "bg-amber-50"
            }`}
          >
            <StatusIcon status={status} size={18} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {declaration.label || declaration.field || "Declaration"}
            </p>

            <p className="mt-1 break-words text-sm text-slate-500">
              {declaration.detected
                ? (declaration.value ?? "Detected")
                : "Declaration not detected"}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
        <MiniMetric
          label="Confidence"
          value={formatConfidence(declaration.confidence)}
        />

        <MiniMetric
          label="Font"
          value={
            declaration.font_analysis?.detected_size != null
              ? `${declaration.font_analysis.detected_size}${
                  declaration.font_analysis.unit || ""
                }`
              : "N/A"
          }
        />

        <MiniMetric
          label="Readability"
          value={
            declaration.readability?.score != null
              ? `${declaration.readability.score}%`
              : "N/A"
          }
        />
      </div>

      {declaration.placement?.message && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />

          <span>{declaration.placement.message}</span>
        </div>
      )}
    </button>
  );
}

/* =========================================================
   ANALYSIS CARD
========================================================= */

function AnalysisCard({ title, icon, status, summary, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </div>

          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>

        <StatusBadge status={status} />
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">{summary}</p>

      <div className="mt-5">{children}</div>
    </div>
  );
}

/* =========================================================
   ANALYSIS ROW
========================================================= */

function AnalysisRow({ label, value, expected, status }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <StatusIcon status={status} size={15} />

          <span className="truncate text-xs font-semibold text-slate-700">
            {label}
          </span>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span>
          <strong className="text-slate-700">Detected:</strong> {value}
        </span>

        {expected && (
          <span>
            <strong className="text-slate-700">Expected:</strong> {expected}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   VIOLATION CARD
========================================================= */

function ViolationCard({ violation, onEvidenceClick }) {
  const status = violation.status || "REVIEW";

  const isFail = status === "FAIL";

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        status === "FAIL"
          ? "border-red-200 bg-red-50"
          : status === "PASS"
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 shrink-0">
            <StatusIcon status={status} size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">
                {violation.title || violation.field || "Compliance issue"}
              </h3>

              {violation.type && (
                <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {violation.type}
                </span>
              )}
            </div>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {violation.reason ||
                violation.message ||
                "No additional explanation available."}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ValueBox
          label="Actual"
          value={violation.actual_value ?? "Not detected"}
        />

        <ValueBox
          label="Expected"
          value={violation.expected_value ?? "Not specified"}
        />

        <ValueBox
          label="AI Confidence"
          value={formatConfidence(violation.confidence)}
        />
      </div>

      {violation.bbox && (
        <button
          type="button"
          onClick={onEvidenceClick}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ScanSearch size={14} />
          View image evidence
          <ArrowRight size={13} />
        </button>
      )}

      {isFail && !violation.bbox && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-700">
          <Info size={14} />
          No visual evidence box is available because the declaration was not
          detected.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   VALUE BOX
========================================================= */

function ValueBox({ label, value }) {
  return (
    <div className="rounded-lg border border-white/80 bg-white/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

/* =========================================================
   STATUS ICON
========================================================= */

function StatusIcon({ status, size = 18 }) {
  if (status === "PASS") {
    return <CheckCircle2 size={size} className="text-emerald-600" />;
  }

  if (status === "FAIL") {
    return <XCircle size={size} className="text-red-600" />;
  }

  return <CircleAlert size={size} className="text-amber-600" />;
}

/* =========================================================
   VALUE LINE
========================================================= */

function ValueLine({ label, value }) {
  return (
    <p className="mt-1 text-xs">
      <span className="font-medium text-slate-700">{label}:</span>{" "}
      <span className="text-slate-500">{value}</span>
    </p>
  );
}

/* =========================================================
   CONFIDENCE FORMATTER
========================================================= */

function formatConfidence(value) {
  if (value == null || value === "") {
    return "N/A";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return String(value);
  }

  /*
   * Backend may return either:
   * 0.96
   * or
   * 96
   */
  if (numeric <= 1) {
    return `${Math.round(numeric * 100)}%`;
  }

  return `${Math.round(numeric)}%`;
}

/* =========================================================
   EMPTY STATES
========================================================= */

function EmptyEvidence() {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
      <div className="text-center">
        <FileText size={28} className="mx-auto text-slate-300" />

        <p className="mt-3 text-sm font-semibold text-slate-600">
          Package image unavailable
        </p>

        <p className="mt-1 text-xs text-slate-400">
          No evidence image was returned by the analysis engine.
        </p>
      </div>
    </div>
  );
}

function EmptySection({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Info size={24} className="mx-auto text-slate-300" />

      <p className="mt-3 text-sm font-semibold text-slate-600">
        No data available
      </p>

      <p className="mt-1 text-xs text-slate-400">{message}</p>
    </div>
  );
}

function EmptyAnalysis() {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 p-5 text-center">
      <p className="text-xs text-slate-400">Analysis data unavailable</p>
    </div>
  );
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default InspectionResult;
