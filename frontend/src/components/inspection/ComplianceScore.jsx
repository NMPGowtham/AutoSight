import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

function ComplianceScore({ score, summary, status }) {
  const normalizedStatus = status?.toUpperCase();

  const statusConfig = {
    PASS: {
      label: "Compliant",
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    REVIEW: {
      label: "Requires Review",
      icon: AlertTriangle,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
    FAIL: {
      label: "Potential Violation",
      icon: XCircle,
      iconClass: "text-red-600",
      bgClass: "bg-red-50",
    },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.REVIEW;

  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{score}%</p>
              <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Score
              </p>
            </div>
          </div>

          <div>
            <div
              className={`mb-2 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${config.bgClass}`}
            >
              <Icon size={16} className={config.iconClass} />

              <span className={`text-xs font-semibold ${config.iconClass}`}>
                {config.label}
              </span>
            </div>

            <p className="text-sm leading-5 text-slate-500">
              Overall compliance assessment based on detected declarations and
              applicable rules.
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-3 sm:ml-auto sm:max-w-sm">
          <div className="rounded-lg bg-emerald-50 p-3 text-center">
            <p className="text-xl font-bold text-emerald-700">
              {summary?.passed || 0}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-emerald-600">
              Passed
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-center">
            <p className="text-xl font-bold text-amber-700">
              {summary?.review || 0}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-amber-600">
              Review
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-3 text-center">
            <p className="text-xl font-bold text-red-700">
              {summary?.failed || 0}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-red-600">
              Failed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceScore;
