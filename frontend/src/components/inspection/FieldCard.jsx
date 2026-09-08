import { FileText } from "lucide-react";

function FieldCard({ field, value, confidence, onClick, selected }) {
  const percentage = Math.round((confidence || 0) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-slate-900 bg-slate-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <FileText size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {field.replaceAll("_", " ")}
            </p>

            <span className="shrink-0 text-[11px] font-semibold text-slate-500">
              {percentage}%
            </span>
          </div>

          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
            {value || "Not detected"}
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-700 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

export default FieldCard;
