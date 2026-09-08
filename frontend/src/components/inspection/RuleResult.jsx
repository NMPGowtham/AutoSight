import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
} from "lucide-react";

import StatusBadge from "./StatusBadge";

function RuleResult({ rule, onViewEvidence }) {
  const status = rule.status?.toUpperCase();

  const icons = {
    PASS: CheckCircle2,
    REVIEW: AlertTriangle,
    FAIL: XCircle,
  };

  const Icon = icons[status] || AlertTriangle;

  const iconClasses = {
    PASS: "bg-emerald-50 text-emerald-600",
    REVIEW: "bg-amber-50 text-amber-600",
    FAIL: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            iconClasses[status] || "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} size="small" />

            <span className="text-[11px] font-medium text-slate-400">
              {rule.rule_id}
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {rule.field?.replaceAll("_", " ")}
          </p>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {rule.message}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div>
              <p className="font-medium text-slate-400">Severity</p>

              <p
                className={`mt-1 font-semibold ${
                  rule.severity === "HIGH"
                    ? "text-red-600"
                    : rule.severity === "MEDIUM"
                      ? "text-amber-600"
                      : "text-slate-700"
                }`}
              >
                {rule.severity || "N/A"}
              </p>
            </div>

            <div>
              <p className="font-medium text-slate-400">Confidence</p>

              <p className="mt-1 font-semibold text-slate-700">
                {Math.round((rule.confidence || 0) * 100)}%
              </p>
            </div>
          </div>

          {rule.actual_value && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Detected value
              </p>

              <p className="mt-1 break-words text-sm font-medium text-slate-800">
                {rule.actual_value}
              </p>
            </div>
          )}

          {rule.expected_value && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Expected
              </p>

              <p className="mt-1 break-words text-sm font-medium text-slate-800">
                {rule.expected_value}
              </p>
            </div>
          )}

          {rule.bbox && (
            <button
              type="button"
              onClick={() => onViewEvidence?.(rule)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 transition hover:text-slate-900"
            >
              View evidence
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RuleResult;
