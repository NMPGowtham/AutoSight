import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Loader2, Search } from "lucide-react";
import { getInspections } from "../services/inspectionService";
import StatusBadge from "../components/inspection/StatusBadge";

const scoreClass = (score) => Number(score) >= 90 ? "text-emerald-600" : Number(score) >= 75 ? "text-amber-600" : "text-red-600";
const dateText = (value) => value ? new Date(value).toLocaleString() : "N/A";

function InspectionHistory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getInspections().then((data) => setItems(Array.isArray(data) ? data : data?.items || data?.validations || [])).catch((err) => setError(err?.response?.data?.detail || err?.message || "Unable to load inspections.")).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const id = String(item.validation_id || item.inspection_id || "").toLowerCase();
    const text = `${id} ${item.status || item.overall_status || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (status === "ALL" || String(item.overall_status || item.status).toUpperCase() === status);
  }), [items, search, status]);

  return <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Inspection Records</p><h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Inspection History</h1><p className="mt-2 text-sm text-slate-500">Real validations from your FastAPI backend.</p></div><Link to="/inspection/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><ClipboardList size={16} /> New Inspection</Link></div>
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search validation ID..." className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400" /></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="ALL">All statuses</option><option value="PASS">PASS</option><option value="REVIEW">REVIEW</option><option value="FAIL">FAIL</option></select></div>
      {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-500" /></div> : error ? <div className="p-8 text-center text-sm text-red-600">{error}</div> : filtered.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No inspections found.</div> : <div className="divide-y divide-slate-100">{filtered.map((item) => { const id = item.validation_id || item.inspection_id; const s = String(item.overall_status || item.status || "PENDING").toUpperCase(); return <Link key={id} to={`/inspection/${id}`} className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="break-all text-sm font-bold text-slate-900">{id}</p><p className="mt-1 text-xs text-slate-500">Created {dateText(item.created_at)}</p></div><div className="flex items-center gap-5"><div className="text-right"><p className={`text-sm font-bold ${scoreClass(item.validation_score)}`}>{item.validation_score != null ? `${item.validation_score}%` : "—"}</p><p className="text-[10px] uppercase text-slate-400">Score</p></div><StatusBadge status={s} /></div></Link>; })}</div>}
    </div>
  </div>;
}
export default InspectionHistory;
