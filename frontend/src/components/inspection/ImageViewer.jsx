import { useMemo, useState } from "react";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  MapPin,
} from "lucide-react";

function ImageViewer({
  imageUrl,
  imageWidth = 1200,
  imageHeight = 1500,
  fields = [],
  selectedField = null,
  onFieldSelect,
  className = "",
}) {
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const imageAspectRatio = imageWidth / imageHeight;

  const validFields = useMemo(() => {
    return fields.filter(
      (field) => Array.isArray(field.bbox) && field.bbox.length === 4,
    );
  }, [fields]);

  const handleZoomIn = () => {
    setZoom((current) => Math.min(current + 0.15, 2.5));
  };

  const handleZoomOut = () => {
    setZoom((current) => Math.max(current - 0.15, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const getStatusClasses = (status) => {
    if (status === "PASS") {
      return {
        border: "border-emerald-500",
        bg: "bg-emerald-500/10",
        label: "bg-emerald-600",
      };
    }

    if (status === "FAIL") {
      return {
        border: "border-red-500",
        bg: "bg-red-500/10",
        label: "bg-red-600",
      };
    }

    return {
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      label: "bg-amber-600",
    };
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}
    >
      {/* =========================================
          TOOLBAR
      ========================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-slate-500" />

          <span className="text-xs font-semibold text-slate-700">
            Evidence Viewer
          </span>

          {validFields.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
              {validFields.length} detected
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            title="Zoom out"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="min-w-12 rounded-md px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            title="Zoom in"
          >
            <ZoomIn size={15} />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" />

          <button
            type="button"
            onClick={() => setFullscreen((current) => !current)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* =========================================
          IMAGE AREA
      ========================================= */}
      <div
        className={`relative overflow-auto bg-slate-100 p-4 ${
          fullscreen
            ? "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-6"
            : "min-h-[480px]"
        }`}
      >
        {/* Fullscreen close */}
        {fullscreen && (
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <Minimize2 size={17} />
          </button>
        )}

        {/* Image wrapper */}
        <div
          className={`relative mx-auto ${
            fullscreen ? "max-h-full max-w-full" : "max-w-full"
          }`}
          style={{
            width: `min(100%, ${imageWidth * zoom}px)`,
            aspectRatio: imageAspectRatio,
          }}
        >
          {/* Actual image */}
          <img
            src={imageUrl}
            alt="Package evidence"
            className={`absolute inset-0 h-full w-full object-contain ${
              fullscreen ? "max-h-[90vh]" : ""
            }`}
          />

          {/* =====================================
              BOUNDING BOXES
          ====================================== */}
          {validFields.map((field) => {
            const [x1, y1, x2, y2] = field.bbox;

            const isSelected =
              selectedField?.field === field.field ||
              selectedField?.id === field.id;

            const styles = getStatusClasses(field.status || "REVIEW");

            /*
             * IMPORTANT:
             *
             * Coordinates from Python are based
             * on the original image dimensions.
             *
             * Converting them to percentages makes
             * the bounding boxes responsive.
             */
            const left = (x1 / imageWidth) * 100;

            const top = (y1 / imageHeight) * 100;

            const width = ((x2 - x1) / imageWidth) * 100;

            const height = ((y2 - y1) / imageHeight) * 100;

            return (
              <button
                key={field.id || `${field.field}-${x1}-${y1}`}
                type="button"
                onClick={() => onFieldSelect?.(field)}
                className={`absolute border-2 transition ${
                  isSelected
                    ? `${styles.border} ${styles.bg} z-10 shadow-[0_0_0_2px_rgba(255,255,255,0.8)]`
                    : `${styles.border} ${styles.bg} hover:z-10`
                }`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
                title={field.label || field.field || "Detected field"}
              >
                {/* Label */}
                <span
                  className={`absolute -top-6 left-0 max-w-[180px] truncate rounded px-1.5 py-1 text-[9px] font-bold text-white ${styles.label}`}
                >
                  {field.label || field.field || "Detected"}
                </span>

                {/* Selected indicator */}
                {isSelected && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-bold text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================
          LEGEND
      ========================================= */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-slate-500">Pass</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-[11px] font-medium text-slate-500">Review</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-[11px] font-medium text-slate-500">
            Potential Violation
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400">
          <RotateCcw size={12} />
          Click a highlighted area for details
        </div>
      </div>
    </div>
  );
}

export default ImageViewer;
