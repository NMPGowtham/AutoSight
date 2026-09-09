import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Printer, ShieldCheck } from "lucide-react";
import { generateInspectionReport, getInspectionReport, getInspectionReportData } from "../services/inspectionService";
import StatusBadge from "../components/inspection/StatusBadge";

function Report() {
  const { inspectionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { getInspectionReportData(inspectionId).then(setData).catch((err) => setError(err?.response?.data?.detail || err?.message || "Unable to load report.")).finally(() => setLoading(false)); }, [inspectionId]);

  const download = async () => {
  try {
    setGenerating(true);
    setError("");

    await generateInspectionReport(inspectionId);

    const blob = await getInspectionReport(inspectionId);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `inspection-${inspectionId}.pdf`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (err) {
    setError(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to download report."
    );
  } finally {
    setGenerating(false);
  }
};

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error && !data) return <div className="mx-auto mt-12 max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-600">{error}</div>;

  const results = data?.results || data?.validation_results || [];
  const status = data?.status || data?.overall_status || "REVIEW";
  const score = data?.score ?? data?.validation_score ?? 0;

  return <div className="mx-auto w-full max-w-5xl space-y-5 pb-8">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><Link to={`/inspection/${inspectionId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"><ArrowLeft size={16} /> Back to Inspection</Link><div className="flex gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"><Printer size={16} /> Print</button><button disabled={generating} onClick={download} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download PDF</button></div></div>
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <header className="border-b border-slate-200 pb-6"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Legal Metrology Inspection Report</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Inspection {inspectionId}</h1><p className="mt-1 text-sm text-slate-500">Generated from the backend validation pipeline.</p></div><ShieldCheck className="text-slate-700" /></div></header>
      <div className="mt-6 grid gap-4 sm:grid-cols-3"><ReportStat label="Status"><StatusBadge status={status} /></ReportStat><ReportStat label="Score"><strong className="text-2xl">{score}%</strong></ReportStat><ReportStat label="Results"><strong className="text-2xl">{results.length}</strong></ReportStat></div>
      <section className="mt-8">
  <h2 className="text-lg font-bold text-slate-900">
    Package Context
  </h2>

  <div className="mt-3 grid gap-3 sm:grid-cols-2">
    <Info
      label="Category"
      value={data?.product?.category}
    />

    <Info
      label="Package type"
      value={data?.product?.package_type}
    />

    <Info
      label="Imported"
      value={
        data?.product?.is_imported === true
          ? "Yes"
          : data?.product?.is_imported === false
            ? "No"
            : "N/A"
      }
    />

    <Info
      label="Net quantity"
      value={
        data?.product?.net_quantity_value != null
          ? `${data.product.net_quantity_value} ${data.product.net_quantity_unit || ""}`
          : "N/A"
      }
    />

    <Info
      label="Consumer type"
      value={data?.product?.consumer_type}
    />

    <Info
      label="Industrial"
      value={
        data?.product?.is_industrial === true
          ? "Yes"
          : data?.product?.is_industrial === false
            ? "No"
            : "N/A"
      }
    />

    <Info
      label="Institutional"
      value={
        data?.product?.is_institutional === true
          ? "Yes"
          : data?.product?.is_institutional === false
            ? "No"
            : "N/A"
      }
    />

    <Info
      label="Image"
      value={data?.images?.[0]?.file_name || "N/A"}
    />
  </div>
</section>
      <section className="mt-8"><h2 className="text-lg font-bold text-slate-900">Validation Results</h2><div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">{results.map((r, i) => <div key={r.result_id || i} className="p-4"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={r.status} size="small" /><span className="text-xs font-semibold text-slate-400">{r.rule_id}</span></div><p className="mt-2 text-sm font-bold text-slate-900">{String(r.field || "Rule").replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-600">{r.reason || r.message || "No explanation provided."}</p></div>)}</div></section>
      {error && <p className="mt-5 text-xs text-red-600">{error}</p>}
    </article>
  </div>;
}
function ReportStat({ label, children }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><div className="mt-2">{children}</div></div>; }
function Info({ label, value }) { return <div className="rounded-lg border border-slate-100 p-3"><p className="text-[10px] uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold capitalize text-slate-700">{String(value ?? "N/A")}</p></div>; }
export default Report;
