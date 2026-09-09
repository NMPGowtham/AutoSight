import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Circle, FileImage, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { processValidation } from "../services/inspectionService";

const STAGES = [
  ["Image received", "Validating the uploaded package image"],
  ["AI analysis", "Extracting declarations and package context"],
  ["Rules validation", "Selecting and evaluating applicable rules"],
  ["Compliance assessment", "Preparing the final inspection result"],
];

function Processing() {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const started = useRef(false);
  const [progress, setProgress] = useState(8);
  const [status, setStatus] = useState("PROCESSING");
  const [error, setError] = useState("");
  const [inspection, setInspection] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("current_inspection") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!inspectionId) {
      setStatus("FAILED");
      setError("Inspection ID is missing.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setProgress(15);
        const result = await processValidation(inspectionId);
        if (cancelled) return;

        setInspection((prev) => ({ ...(prev || {}), ...result }));
        sessionStorage.setItem(
          "current_inspection",
          JSON.stringify({ ...(inspection || {}), ...result, validation_id: inspectionId }),
        );
        setProgress(100);
        setStatus("COMPLETED");

        window.setTimeout(() => {
          if (!cancelled) navigate(`/inspection/${inspectionId}`, { replace: true });
        }, 500);
      } catch (err) {
        if (cancelled) return;
        console.error("Validation processing failed:", err);
        setError(err?.response?.data?.detail || err?.message || "The inspection could not be completed.");
        setStatus("FAILED");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [inspectionId, navigate]);

  if (status === "FAILED") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50"><AlertCircle size={28} className="text-red-600" /></div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-red-500">Inspection failed</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">We couldn't complete the analysis</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => navigate("/inspection/new")} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Start New Inspection</button>
            <button onClick={() => navigate("/inspections")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600">History</button>
          </div>
        </div>
      </div>
    );
  }

  const completed = status === "COMPLETED" ? STAGES.length : progress >= 75 ? 3 : progress >= 35 ? 2 : 1;
  const active = Math.min(completed, STAGES.length - 1);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inspection Processing</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Analysing Package</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">The backend is running OCR, AI extraction, context classification and rule validation.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                {status === "COMPLETED" ? <CheckCircle2 size={21} /> : <Loader2 size={21} className="animate-spin" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{status === "COMPLETED" ? "Analysis complete" : "AI compliance analysis in progress"}</p>
                <p className="mt-1 text-xs text-slate-500">{progress}% complete</p>
              </div>
            </div>
            <Sparkles size={19} className="shrink-0 text-slate-400" />
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-900 transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid border-b border-slate-100 sm:grid-cols-3">
          <InfoItem icon={<FileImage size={16} />} label="Package" value={inspection?.file_name || "Package image"} />
          <InfoItem icon={<ShieldCheck size={16} />} label="Category" value={inspection?.context?.product_category || "AI detecting..."} />
          <InfoItem icon={<Sparkles size={16} />} label="Inspection ID" value={inspectionId || "—"} />
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Analysis Pipeline</h2>
          <p className="mt-1 text-xs text-slate-500">The endpoint is synchronous, so the exact internal stage progress is not exposed by the backend.</p>
          <div className="mt-5 space-y-3">
            {STAGES.map(([title, description], index) => {
              const done = status === "COMPLETED" || index < active;
              const current = status !== "COMPLETED" && index === active;
              return <Stage key={title} index={index} title={title} description={description} done={done} current={current} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stage({ index, title, description, done, current }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${done ? "border-emerald-100 bg-emerald-50/40" : current ? "border-slate-300 bg-slate-50" : "border-slate-100"}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? "bg-emerald-100 text-emerald-600" : current ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
        {done ? <CheckCircle2 size={17} /> : current ? <Loader2 size={17} className="animate-spin" /> : <Circle size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <span className="hidden text-[10px] font-semibold text-slate-400 sm:block">{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return <div className="min-w-0 border-b border-slate-100 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:p-5 sm:last:border-r-0"><div className="flex items-center gap-2 text-slate-400">{icon}<span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span></div><p title={String(value)} className="mt-2 truncate text-xs font-semibold text-slate-700">{value}</p></div>;
}

export default Processing;
