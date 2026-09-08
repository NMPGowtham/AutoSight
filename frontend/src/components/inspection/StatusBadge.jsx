function StatusBadge({ status, size = "default" }) {
  const normalizedStatus = status?.toUpperCase();

  const styles = {
    PASS: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
    FAIL: "border-red-200 bg-red-50 text-red-700",
  };

  const labels = {
    PASS: "PASS",
    REVIEW: "REVIEW",
    FAIL: "FAIL",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${
        styles[normalizedStatus] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      } ${
        size === "small" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          normalizedStatus === "PASS"
            ? "bg-emerald-500"
            : normalizedStatus === "REVIEW"
              ? "bg-amber-500"
              : normalizedStatus === "FAIL"
                ? "bg-red-500"
                : "bg-slate-400"
        }`}
      />

      {labels[normalizedStatus] || normalizedStatus || "UNKNOWN"}
    </span>
  );
}

export default StatusBadge;
