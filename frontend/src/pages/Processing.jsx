import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  FileImage,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getInspection } from "../services/inspectionService";

const PROCESSING_STAGES = [
  {
    id: "image",
    title: "Image received",
    description: "Validating the uploaded package image",
  },
  {
    id: "ocr",
    title: "OCR analysis",
    description: "Extracting text and declarations from the label",
  },
  {
    id: "declarations",
    title: "Declaration identification",
    description: "Identifying mandatory packaged commodity declarations",
  },
  {
    id: "rules",
    title: "Rules validation",
    description: "Checking declarations against compliance rules",
  },
  {
    id: "readability",
    title: "Readability analysis",
    description: "Evaluating font size, visibility and placement",
  },
  {
    id: "assessment",
    title: "Compliance assessment",
    description: "Preparing the final compliance result",
  },
];

const MOCK_STAGE_DELAY = 900;

function Processing() {
  const navigate = useNavigate();
  const { inspectionId } = useParams();

  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [status, setStatus] = useState("PROCESSING");
  const [error, setError] = useState("");

  const [inspection, setInspection] = useState(() => {
    try {
      const saved = sessionStorage.getItem("current_inspection");

      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved);

      if (!parsed || typeof parsed !== "object") {
        return null;
      }

      return parsed;
    } catch (storageError) {
      console.error("Unable to read current inspection:", storageError);

      return null;
    }
  });

  const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  /*
   * ---------------------------------------------------------
   * MOCK PROCESSING
   * ---------------------------------------------------------
   *
   * Used while the Python backend is unavailable.
   *
   * The frontend simulates the six inspection stages so the
   * complete SIH demo flow can be tested.
   */
  useEffect(() => {
    if (!useMockApi) {
      return;
    }

    if (!inspectionId) {
      setError("Inspection ID is missing.");
      setStatus("FAILED");
      return;
    }

    let stageTimer;
    let cancelled = false;

    const runMockProcessing = () => {
      let stage = 0;

      setProgress(0);
      setCurrentStage(0);
      setStatus("PROCESSING");

      stageTimer = setInterval(() => {
        if (cancelled) {
          return;
        }

        stage += 1;

        const nextProgress = Math.min(
          100,
          Math.round((stage / PROCESSING_STAGES.length) * 100),
        );

        setProgress(nextProgress);

        if (stage < PROCESSING_STAGES.length) {
          setCurrentStage(stage);
        }

        if (stage >= PROCESSING_STAGES.length) {
          clearInterval(stageTimer);

          setCurrentStage(PROCESSING_STAGES.length);
          setProgress(100);
          setStatus("COMPLETED");

          setTimeout(() => {
            if (!cancelled) {
              navigate(`/inspection/${inspectionId}`, {
                replace: true,
              });
            }
          }, 700);
        }
      }, MOCK_STAGE_DELAY);
    };

    runMockProcessing();

    return () => {
      cancelled = true;

      if (stageTimer) {
        clearInterval(stageTimer);
      }
    };
  }, [inspectionId, navigate, useMockApi]);

  /*
   * ---------------------------------------------------------
   * REAL BACKEND PROCESSING
   * ---------------------------------------------------------
   *
   * When:
   *
   * VITE_USE_MOCK_API=false
   *
   * the frontend polls the Python API until the inspection
   * is completed or failed.
   */
  useEffect(() => {
    if (useMockApi) {
      return;
    }

    if (!inspectionId) {
      setError("Inspection ID is missing.");
      setStatus("FAILED");
      return;
    }

    let cancelled = false;
    let intervalId;

    const pollInspection = async () => {
      try {
        const result = await getInspection(inspectionId);

        if (cancelled) {
          return;
        }

        setInspection((previous) => ({
          ...(previous || {}),
          ...result,
        }));

        const backendStatus = String(
          result?.status || result?.processing_status || "PROCESSING",
        ).toUpperCase();

        const backendProgress = Number(result?.progress ?? 0);

        setProgress(
          Number.isFinite(backendProgress)
            ? Math.max(0, Math.min(100, backendProgress))
            : 0,
        );

        setStatus(backendStatus);

        const stageFromBackend =
          result?.current_stage_index ?? result?.stage_index;

        if (Number.isFinite(Number(stageFromBackend))) {
          setCurrentStage(
            Math.max(
              0,
              Math.min(PROCESSING_STAGES.length, Number(stageFromBackend)),
            ),
          );
        } else {
          const calculatedStage = Math.floor(
            (Math.max(0, Math.min(100, backendProgress)) / 100) *
              PROCESSING_STAGES.length,
          );

          setCurrentStage(calculatedStage);
        }

        if (
          backendStatus === "COMPLETED" ||
          backendStatus === "COMPLETE" ||
          backendStatus === "SUCCESS" ||
          backendProgress >= 100
        ) {
          setProgress(100);
          setCurrentStage(PROCESSING_STAGES.length);
          setStatus("COMPLETED");

          clearInterval(intervalId);

          setTimeout(() => {
            if (!cancelled) {
              navigate(`/inspection/${inspectionId}`, {
                replace: true,
              });
            }
          }, 500);
        }

        if (backendStatus === "FAILED" || backendStatus === "ERROR") {
          clearInterval(intervalId);

          setStatus("FAILED");

          setError(
            result?.error ||
              result?.message ||
              "The inspection could not be completed.",
          );
        }
      } catch (pollError) {
        console.error("Inspection polling failed:", pollError);

        if (cancelled) {
          return;
        }

        /*
         * Do not immediately fail the screen for a temporary
         * network error. The next polling cycle can recover.
         */
        if (pollError?.response?.status === 404) {
          clearInterval(intervalId);

          setStatus("FAILED");
          setError("Inspection could not be found.");
        }
      }
    };

    pollInspection();

    intervalId = setInterval(pollInspection, 1500);

    return () => {
      cancelled = true;

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [inspectionId, navigate, useMockApi]);

  /*
   * ---------------------------------------------------------
   * DERIVED INFORMATION
   * ---------------------------------------------------------
   */

  const completedStages = useMemo(() => {
    if (status === "COMPLETED") {
      return PROCESSING_STAGES.length;
    }

    return Math.floor((progress / 100) * PROCESSING_STAGES.length);
  }, [progress, status]);

  const activeStage = Math.min(currentStage, PROCESSING_STAGES.length - 1);

  const displayStage =
    status === "COMPLETED"
      ? "Analysis complete"
      : PROCESSING_STAGES[activeStage]?.title || "Preparing analysis";

  const fileName =
    inspection?.file_name || inspection?.filename || "Package image";

  const category = inspection?.category || "Not specified";

  /*
   * ---------------------------------------------------------
   * ERROR STATE
   * ---------------------------------------------------------
   */
  if (status === "FAILED") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={28} className="text-red-600" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-red-500">
            Inspection failed
          </p>

          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            We couldn't complete the analysis
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            {error ||
              "Something went wrong while processing the package image."}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/inspection/new")}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start New Inspection
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Inspection Processing
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Analysing Package
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          The compliance engine is examining the uploaded package image for
          mandatory declarations and Legal Metrology requirements.
        </p>
      </div>

      {/* =====================================================
          MAIN PROCESSING CARD
      ====================================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Top status */}
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                {status === "COMPLETED" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <Sparkles size={21} className="animate-pulse" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {status === "COMPLETED" ? "Completed" : "AI inspection"}
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {displayStage}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {status === "COMPLETED" ? (
                  <CheckCircle2 size={13} className="text-emerald-600" />
                ) : (
                  <Loader2 size={13} className="animate-spin text-slate-600" />
                )}
                {progress}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                Overall progress
              </span>

              <span className="text-[11px] font-semibold text-slate-700">
                {completedStages} / {PROCESSING_STAGES.length} stages
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ===================================================
            INSPECTION INFORMATION
        ==================================================== */}
        <div className="grid border-b border-slate-100 sm:grid-cols-3">
          <InfoItem
            icon={<FileImage size={16} />}
            label="Package"
            value={fileName}
          />

          <InfoItem
            icon={<ShieldCheck size={16} />}
            label="Category"
            value={category}
          />

          <InfoItem
            icon={<Sparkles size={16} />}
            label="Inspection ID"
            value={inspectionId || "—"}
          />
        </div>

        {/* ===================================================
            STAGES
        ==================================================== */}
        <div className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Analysis Pipeline
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Each stage is processed automatically by the inspection workflow.
            </p>
          </div>

          <div className="space-y-3">
            {PROCESSING_STAGES.map((stage, index) => {
              const isCompleted =
                status === "COMPLETED" || index < currentStage;

              const isActive = status !== "COMPLETED" && index === currentStage;

              const isPending = !isCompleted && !isActive;

              return (
                <StageItem
                  key={stage.id}
                  stage={stage}
                  index={index}
                  isCompleted={isCompleted}
                  isActive={isActive}
                  isPending={isPending}
                />
              );
            })}
          </div>
        </div>

        {/* ===================================================
            FOOTER
        ==================================================== */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <ShieldCheck size={14} className="text-slate-600" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Automated compliance analysis
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                OCR, declaration detection, readability analysis and rule
                validation are being processed before generating the final
                result.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM NOTE
      ====================================================== */}
      <div className="mt-5 text-center">
        <p className="text-[10px] leading-5 text-slate-400">
          Please keep this page open while the inspection is being processed.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   STAGE ITEM
========================================================= */

function StageItem({ stage, index, isCompleted, isActive, isPending }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3.5 transition sm:p-4 ${
        isActive
          ? "border-slate-300 bg-slate-50 shadow-sm"
          : isCompleted
            ? "border-emerald-100 bg-emerald-50/40"
            : "border-slate-100 bg-white"
      }`}
    >
      {/* Stage icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isCompleted
            ? "bg-emerald-100 text-emerald-600"
            : isActive
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 size={17} />
        ) : isActive ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <Circle size={16} />
        )}
      </div>

      {/* Stage number */}
      <div className="hidden w-6 shrink-0 text-center sm:block">
        <span
          className={`text-[10px] font-bold ${
            isCompleted
              ? "text-emerald-600"
              : isActive
                ? "text-slate-700"
                : "text-slate-300"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-xs font-semibold sm:text-sm ${
              isPending ? "text-slate-500" : "text-slate-800"
            }`}
          >
            {stage.title}
          </p>

          {isActive && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
              In progress
            </span>
          )}

          {isCompleted && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
              Complete
            </span>
          )}
        </div>

        <p
          className={`mt-1 text-[10px] leading-5 sm:text-xs ${
            isPending ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {stage.description}
        </p>
      </div>

      {/* Status */}
      <div className="hidden shrink-0 sm:block">
        {isCompleted ? (
          <span className="text-[10px] font-semibold text-emerald-600">
            Done
          </span>
        ) : isActive ? (
          <span className="text-[10px] font-semibold text-slate-600">
            Processing
          </span>
        ) : (
          <span className="text-[10px] font-medium text-slate-300">
            Pending
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="min-w-0 border-b border-slate-100 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:p-5 sm:last:border-r-0">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p
        title={value}
        className="mt-2 truncate text-xs font-semibold text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

export default Processing;
