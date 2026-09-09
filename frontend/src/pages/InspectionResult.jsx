import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { getInspectionReportData, reviewValidationResult, getProcessedInspectionImage } from "../services/inspectionService";
import StatusBadge from "../components/inspection/StatusBadge";
import ComplianceScore from "../components/inspection/ComplianceScore";
import ImageViewer from "../components/inspection/ImageViewer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const imageUrl = (image) => {
  const direct = image?.url || image?.image_url || image?.file_url;
  if (direct) return direct;
  const path = image?.file_path;
  if (!path) return "";
  return `${API_BASE_URL}/${String(path).replaceAll("\\", "/").replace(/^\//, "")}`;
};

const label = (value) => String(value || "N/A").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function InspectionResult() {
  const { inspectionId } = useParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [comment, setComment] = useState("");
  const [processedImageUrl, setProcessedImageUrl] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getInspectionReportData(inspectionId);

      setData(result);

      const processed = result?.processed_images?.[0];

      if (processed?.processed_url) {
        setProcessedImageUrl(
          processed.processed_url.startsWith("http")
            ? processed.processed_url
            : `${API_BASE_URL}${processed.processed_url}`,
        );
      } else if (processed?.processed_path) {
        setProcessedImageUrl(
          `${API_BASE_URL}/${String(processed.processed_path)
            .replaceAll("\\", "/")
            .replace(/^\/+/, "")}`,
        );
      } else {
        setProcessedImageUrl("");
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load inspection result.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [inspectionId]);

  const results = Array.isArray(data?.results) ? data.results : Array.isArray(data?.validation_results) ? data.validation_results : [];
  const rules = Array.isArray(data?.rules) ? data.rules : [];
  const images = Array.isArray(data?.images) ? data.images : [];
  const summary = data?.summary || {
    total: results.length,
    passed: results.filter((r) => r.status === "PASS").length,
    review: results.filter((r) => r.status === "REVIEW").length,
    failed: results.filter((r) => r.status === "FAIL").length,
  };
  const score = data?.score ?? data?.validation_score ?? 0;
  const status = data?.status || data?.overall_status || "REVIEW";

  const evidenceFields = useMemo(() => results.filter((r) => Array.isArray(r.bbox) && r.bbox.length === 4), [results]);

  const handleReview = async (resultId, decision) => {
    try {
      setReviewing(resultId);
      await reviewValidationResult(inspectionId, resultId, decision, comment);
      setComment("");
      await load();
    } catch (err) {
      alert(err?.response?.data?.detail || err?.message || "Unable to submit review.");
    } finally {
      setReviewing(null);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-slate-600" size={30} /></div>;

  if (error) return <ErrorState message={error} />;

  const primaryImage = images[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/inspections" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={16} /> Inspection History</Link>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Inspection Result</h1><StatusBadge status={status} /></div>
          <p className="mt-1 break-all text-xs text-slate-400">{inspectionId}</p>
        </div>
        <Link to={`/inspections/${inspectionId}/report`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><FileText size={17} /> View Report</Link>
      </div>

      <ComplianceScore score={Number(score).toFixed(2).replace(/\.00$/, "")} summary={summary} status={status} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ContextCard
          title="Product Category"
          value={data?.product?.category || "N/A"}
        />

        <ContextCard
          title="Package Type"
          value={data?.product?.package_type || "N/A"}
        />

        <ContextCard
          title="Imported"
          value={
            data?.product?.is_imported === true
              ? "Yes"
              : data?.product?.is_imported === false
                ? "No"
                : "N/A"
          }
        />

        <ContextCard
          title="Net Quantity"
          value={
            data?.product?.net_quantity_value != null
              ? `${data.product.net_quantity_value} ${data.product.net_quantity_unit || ""}`
              : "N/A"
          }
        />
      </section>

      {primaryImage && imageUrl(primaryImage) && (
        <section className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
          <ImageViewer
            imageUrl={processedImageUrl || imageUrl(primaryImage)}
            imageWidth={primaryImage.width || 1177}
            imageHeight={primaryImage.height || 825}
            fields={processedImageUrl ? [] : evidenceFields}
            selectedField={selected}
            onFieldSelect={setSelected}
          />
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-slate-600" />
              <h2 className="font-semibold text-slate-900">
                Package Context
              </h2>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <InfoRow
                label="Consumer type"
                value={data?.product?.consumer_type}
              />

              <InfoRow
                label="Industrial"
                value={
                  data?.product?.is_industrial === true
                    ? "Yes"
                    : data?.product?.is_industrial === false
                      ? "No"
                      : "N/A"
                }
              />

              <InfoRow
                label="Institutional"
                value={
                  data?.product?.is_institutional === true
                    ? "Yes"
                    : data?.product?.is_institutional === false
                      ? "No"
                      : "N/A"
                }
              />

              <InfoRow
                label="Image"
                value={primaryImage.file_name || primaryImage.filename}
              />
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Validation Results</h2><p className="mt-1 text-sm text-slate-500">Results returned by the AI extraction and database rule engine.</p></div>
        <div className="space-y-3">
          {results.length === 0 ? <Empty text="No validation results were returned." /> : results.map((result, index) => <ResultCard key={result.result_id || `${result.rule_id}-${index}`} result={result} rule={rules.find((r) => r.rule_id === result.rule_id)} selected={selected} onSelect={setSelected} reviewing={reviewing} comment={comment} setComment={setComment} onReview={handleReview} />)}
        </div>
      </section>

      {rules.length > 0 && <section><h2 className="mb-4 text-lg font-bold text-slate-900">Selected Rules</h2><div className="grid gap-3 md:grid-cols-2">{rules.map((rule) => <div key={rule.rule_id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-900">{rule.rule_id}</span><span className="text-[10px] font-semibold uppercase text-slate-400">{rule.severity || "N/A"}</span></div><p className="mt-2 text-sm font-medium text-slate-700">{rule.section_name || rule.field || "Rule"}</p><p className="mt-1 text-xs leading-5 text-slate-500">{rule.description || rule.rule_text || "Applicable compliance rule"}</p></div>)}</div></section>}
    </div>
  );
}

function ResultCard({ result, rule, selected, onSelect, reviewing, comment, setComment, onReview }) {
  const status = result.status?.toUpperCase();
  const Icon = status === "PASS" ? CheckCircle2 : status === "FAIL" ? XCircle : AlertTriangle;
  const cls = status === "PASS" ? "border-emerald-200 bg-emerald-50/30" : status === "FAIL" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30";
  const canReview = status === "REVIEW" && result.result_id;

  return <div className={`rounded-xl border p-5 ${cls}`}>
    <div className="flex items-start gap-3">
      <Icon size={20} className={status === "PASS" ? "text-emerald-600" : status === "FAIL" ? "text-red-600" : "text-amber-600"} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><StatusBadge status={status} size="small" /><span className="text-xs font-semibold text-slate-400">{result.rule_id || "No rule"}</span></div>
        <h3 className="mt-2 text-sm font-bold text-slate-900">{label(result.field || rule?.field || result.rule_id)}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{result.reason || rule?.description || "No explanation provided."}</p>
        {result.confidence != null && <p className="mt-2 text-xs text-slate-400">Confidence: {Math.round(Number(result.confidence) * 100)}%</p>}
        {result.bbox && <button onClick={() => onSelect(result)} className="mt-3 text-xs font-semibold text-slate-700 hover:underline">View evidence</button>}
        {canReview && <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3"><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Review comment (optional)" className="w-full resize-none rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-slate-400" rows={2} /><div className="mt-2 flex gap-2"><button disabled={reviewing === result.result_id} onClick={() => onReview(result.result_id, "ACCEPT")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{reviewing === result.result_id ? "Saving..." : "Accept"}</button><button disabled={reviewing === result.result_id} onClick={() => onReview(result.result_id, "REJECT")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Reject</button></div></div>}
      </div>
    </div>
  </div>;
}

function ContextCard({ title, value }) { return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p><p className="mt-2 text-sm font-bold capitalize text-slate-800">{String(value)}</p></div>; }
function InfoRow({ label: name, value }) { return <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><span className="text-slate-400">{name}</span><span className="text-right font-semibold capitalize text-slate-700">{String(value ?? "N/A")}</span></div>; }
function Empty({ text }) { return <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{text}</div>; }
function ErrorState({ message }) { return <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center"><XCircle className="mx-auto text-red-600" size={30} /><h1 className="mt-4 text-xl font-bold text-slate-900">Unable to load inspection</h1><p className="mt-2 text-sm text-slate-500">{message}</p><Link to="/inspections" className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Back to History</Link></div>; }

export default InspectionResult;
