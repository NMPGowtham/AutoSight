import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FileQuestion, Home } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-lg text-center">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <FileQuestion size={30} />
          </div>

          {/* Error code */}
          <p className="mt-8 text-6xl font-bold tracking-tight text-slate-900 sm:text-7xl">
            404
          </p>

          {/* Heading */}
          <h1 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
            Page not found
          </h1>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            The page you are looking for doesn't exist, may have been moved, or
            the URL may be incorrect.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              to="/dashboard"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Home size={16} />
              Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* System information */}
          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-400">
              Legal Metrology Inspection Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
