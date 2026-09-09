import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Loader2, Plus, Search, ShieldCheck, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getInspections } from "../services/inspectionService";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/inspection/StatusBadge";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInspections().then((d) => setItems(Array.isArray(d) ? d : d?.items || d?.validations || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: items.length,
    passed: items.filter((x) => String(x.overall_status || x.status).toUpperCase() === "PASS").length,
    review: items.filter((x) => String(x.overall_status || x.status).toUpperCase() === "REVIEW").length,
    failed: items.filter((x) => String(x.overall_status || x.status).toUpperCase() === "FAIL").length,
  }), [items]);

  const recent = items.slice(0, 6);
  const firstName = (user?.name || "Inspector").split(" ")[0];

  return <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100"><ShieldCheck size={18} className="text-slate-700" /></span><span className="text-sm font-medium text-slate-500">Legal Metrology Inspection System</span></div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Welcome, {firstName}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Monitor package inspections, review compliance results and start a new inspection.</p></div><button onClick={() => navigate("/inspection/new")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"><Plus size={18} /> New Inspection</button></div></section>
    <section><div className="mb-4"><h2 className="text-lg font-bold text-slate-900">System Overview</h2><p className="mt-1 text-sm text-slate-500">Live statistics from your backend validation records.</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Total Inspections" value={stats.total} icon={ClipboardCheck} description="Backend records" /><StatCard title="Passed" value={stats.passed} icon={CheckCircle2} description="Compliant packages" /><StatCard title="Under Review" value={stats.review} icon={Search} description="Require attention" /><StatCard title="Failed" value={stats.failed} icon={XCircle} description="Potential violations" /></div></section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 p-4"><div><h2 className="text-sm font-semibold text-slate-900">Recent Inspections</h2><p className="mt-1 text-xs text-slate-500">Latest validation records returned by FastAPI.</p></div><button onClick={() => navigate("/inspections")} className="text-xs font-semibold text-slate-700 hover:underline">View all</button></div>{loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div> : recent.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No inspections yet. Start your first inspection.</div> : <div className="divide-y divide-slate-100">{recent.map((x) => { const id = x.validation_id || x.inspection_id; const s = String(x.overall_status || x.status || "PENDING").toUpperCase(); return <button key={id} onClick={() => navigate(`/inspection/${id}`)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50"><div className="min-w-0"><p className="break-all text-sm font-semibold text-slate-900">{id}</p><p className="mt-1 text-xs text-slate-500">{x.created_at ? new Date(x.created_at).toLocaleString() : "Date unavailable"}</p></div><div className="flex items-center gap-4"><span className="hidden text-sm font-semibold text-slate-700 sm:block">{x.validation_score != null ? `${x.validation_score}%` : "—"}</span><StatusBadge status={s} /></div></button>; })}</div>}</section>
  </div>;
}
export default Dashboard;
