function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-slate-100 text-slate-700",
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-500">{description}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            <Icon size={21} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
