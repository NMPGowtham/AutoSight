import { FileSearch, Plus } from "lucide-react";
import { Link } from "react-router-dom";

function EmptyState({
  title = "No data found",
  description = "There is nothing to display here yet.",
  actionText,
  actionPath,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileSearch size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>

      {actionText && actionPath && (
        <Link
          to={actionPath}
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={15} />
          {actionText}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
