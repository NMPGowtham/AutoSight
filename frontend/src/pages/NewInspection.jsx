import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileImage,
  ImagePlus,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";

import { analyzeInspection } from "../services/inspectionService";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const CATEGORIES = [
  "Food",
  "Beverages",
  "Cosmetics",
  "Household",
  "Electrical",
  "Pharmaceuticals",
  "Other",
];

function NewInspection() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [category, setCategory] = useState("Food");
  const [isImported, setIsImported] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Keep mock mode enabled until the Python backend is ready.
   *
   * .env:
   * VITE_USE_MOCK_API=true
   */
  const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  /*
   * Clean up object URL.
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /*
   * Validate selected image.
   */
  const validateFile = (file) => {
    if (!file) {
      return "Please select an image.";
    }

    if (!file.type.startsWith("image/")) {
      return "Only image files are supported.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be less than 10 MB.";
    }

    return "";
  };

  /*
   * Handle selected file.
   */
  const handleFile = (file) => {
    setError("");

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  /*
   * Remove selected image.
   */
  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
   * Convert image to data URL.
   *
   * Used only for frontend/demo flow.
   * In production the backend will store the uploaded image.
   */
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error("Unable to read image."));
      };

      reader.readAsDataURL(file);
    });
  };

  /*
   * Read actual image dimensions.
   */
  const getImageDimensions = (dataUrl) => {
    return new Promise((resolve) => {
      const image = new Image();

      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };

      image.onerror = () => {
        resolve({
          width: 1200,
          height: 1500,
        });
      };

      image.src = dataUrl;
    });
  };

  /*
   * Start inspection.
   *
   * MOCK MODE:
   *   Save temporary data and continue to demo processing.
   *
   * REAL MODE:
   *   Send image to Python backend.
   */
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload a package image before continuing.");
      return;
    }

    if (!category) {
      setError("Please select a product category.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      /*
       * Temporary ID for frontend demo.
       *
       * Later the backend will generate
       * the actual inspection ID.
       */
      const inspectionId = `LM-${Date.now().toString().slice(-6)}`;

      /*
       * =====================================================
       * MOCK MODE
       * =====================================================
       *
       * Keep this active while Python backend is unavailable.
       */
      if (useMockApi) {
        const imageData = await fileToDataUrl(selectedFile);

        const dimensions = await getImageDimensions(imageData);

        const inspectionSession = {
          inspection_id: inspectionId,

          image_url: imageData,

          image_width: dimensions.width,

          image_height: dimensions.height,

          file_name: selectedFile.name,

          file_size: selectedFile.size,

          category,

          is_imported: isImported,

          created_at: new Date().toISOString(),

          /*
           * Useful later for identifying
           * whether this was frontend demo
           * or backend analysis.
           */
          source: "frontend-demo",
        };

        sessionStorage.setItem(
          "current_inspection",
          JSON.stringify(inspectionSession),
        );

        navigate(`/inspection/${inspectionId}/processing`);

        return;
      }

      /*
       * =====================================================
       * REAL BACKEND MODE
       * =====================================================
       *
       * This code becomes active automatically
       * when:
       *
       * VITE_USE_MOCK_API=false
       *
       * and the Python API is available.
       */
      const result = await analyzeInspection(
        selectedFile,
        category,
        isImported,
      );

      /*
       * Backend should return an inspection ID.
       *
       * Example:
       * {
       *   inspection_id: "LM-001249",
       *   status: "PROCESSING"
       * }
       */
      const backendInspectionId =
        result?.inspection_id || result?.id || inspectionId;

      /*
       * Store useful upload information
       * for the processing/result screens.
       */
      const imageData = await fileToDataUrl(selectedFile);

      const dimensions = await getImageDimensions(imageData);

      const inspectionSession = {
        inspection_id: backendInspectionId,

        image_url: imageData,

        image_width: dimensions.width,

        image_height: dimensions.height,

        file_name: selectedFile.name,

        file_size: selectedFile.size,

        category,

        is_imported: isImported,

        created_at: new Date().toISOString(),

        source: "backend",
      };

      sessionStorage.setItem(
        "current_inspection",
        JSON.stringify(inspectionSession),
      );

      navigate(`/inspection/${backendInspectionId}/processing`);
    } catch (analysisError) {
      console.error("Inspection analysis failed:", analysisError);

      const message =
        analysisError?.response?.data?.detail ||
        analysisError?.message ||
        "Unable to start the inspection. Please try again.";

      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          New Inspection
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Scan a Package
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Upload a clear image of the packaged commodity to analyse mandatory
          declarations and check Legal Metrology compliance.
        </p>
      </div>

      {/* =====================================================
          WORKFLOW
      ====================================================== */}
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {/* Step 01 */}
        <div className="rounded-xl bg-slate-900 px-3 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Step 01
          </p>

          <div className="mt-1 flex items-center justify-center gap-1.5">
            <Upload size={13} className="text-white" />

            <p className="text-xs font-semibold text-white sm:text-sm">
              Upload Image
            </p>
          </div>
        </div>

        {/* Step 02 */}
        <div className="rounded-xl px-3 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Step 02
          </p>

          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[8px] font-bold text-slate-400">
              2
            </span>

            <p className="text-xs font-semibold text-slate-600 sm:text-sm">
              AI Analysis
            </p>
          </div>
        </div>

        {/* Step 03 */}
        <div className="rounded-xl px-3 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Step 03
          </p>

          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[8px] font-bold text-slate-400">
              3
            </span>

            <p className="text-xs font-semibold text-slate-600 sm:text-sm">
              Compliance Report
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* ===================================================
            IMAGE UPLOAD
        ==================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Package Image
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Use a clear front or label image with readable declarations.
                </p>
              </div>

              {selectedFile && (
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:flex">
                  <CheckCircle2 size={12} />
                  Image ready
                </span>
              )}
            </div>
          </div>

          {!previewUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex min-h-[390px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition ${
                isDragging
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl transition ${
                  isDragging
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-500 shadow-sm group-hover:bg-slate-900 group-hover:text-white"
                }`}
              >
                <Upload size={27} />
              </div>

              <h3 className="mt-5 text-sm font-semibold text-slate-800">
                {isDragging ? "Drop your image here" : "Upload package image"}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                Drag and drop an image here, or click to browse files from your
                computer.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["JPG", "PNG", "WEBP", "Max 10 MB"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {/* Preview */}
              <div className="relative flex min-h-[390px] items-center justify-center bg-slate-100 p-4">
                <img
                  src={previewUrl}
                  alt="Selected package"
                  className="max-h-[520px] max-w-full rounded-lg object-contain shadow-sm"
                />

                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 shadow-sm">
                  <CheckCircle2 size={12} />
                  Ready for analysis
                </div>

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-md transition hover:bg-red-50 hover:text-red-600"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X size={17} />
                </button>
              </div>

              {/* File information */}
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FileImage size={17} className="text-slate-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {selectedFile?.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {formatFileSize(selectedFile?.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RotateCcw size={13} />
                  Change image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            INSPECTION SETTINGS
        ==================================================== */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">
                Inspection Details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Provide basic information about the package.
              </p>
            </div>

            {/* Category */}
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Product Category
              </span>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {/* Imported */}
            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <input
                  id="imported"
                  type="checkbox"
                  checked={isImported}
                  onChange={(event) => setIsImported(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />

                <label htmlFor="imported" className="cursor-pointer">
                  <span className="block text-sm font-semibold text-slate-700">
                    Imported product
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Enable this if the packaged commodity is imported.
                  </span>
                </label>
              </div>
            </div>

            {/* Checks */}
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">
                What will be checked?
              </p>

              <div className="mt-3 space-y-2.5">
                <CheckItem text="Mandatory declarations" />
                <CheckItem text="MRP and net quantity" />
                <CheckItem text="Manufacturer / importer details" />
                <CheckItem text="Font size and readability" />
                <CheckItem text="Declaration placement" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-800">
                    Unable to continue
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analyze */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Preparing Inspection...
              </>
            ) : (
              <>
                <ScanIcon />
                Analyse Package
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-[10px] leading-5 text-slate-400">
            The uploaded image will be analysed by the Legal Metrology
            compliance engine.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CHECK ITEM
========================================================= */

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />

      <span className="text-xs text-slate-600">{text}</span>
    </div>
  );
}

/* =========================================================
   ICON
========================================================= */

function ScanIcon() {
  return <ImagePlus size={17} />;
}

/* =========================================================
   FILE SIZE
========================================================= */

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default NewInspection;
