import { Loader2 } from "lucide-react";

function LoadingSpinner({
  size = 20,
  text = "Loading...",
  fullScreen = false,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 size={size} className="animate-spin text-slate-700" />

      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
