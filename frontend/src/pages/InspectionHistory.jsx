import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  Package,
} from "lucide-react";

import StatusBadge from "../components/inspection/StatusBadge";

const inspections = [
  {
    inspection_id: "LM-00124",
    product: "Basmati Rice",
    category: "Food",
    date: "08 Sep 2026",
    score: 82,
    status: "REVIEW",
  },
  {
    inspection_id: "LM-00123",
    product: "Sunflower Oil",
    category: "Edible Oil",
    date: "08 Sep 2026",
    score: 96,
    status: "PASS",
  },
  {
    inspection_id: "LM-00122",
    product: "Washing Powder",
    category: "Household",
    date: "07 Sep 2026",
    score: 91,
    status: "PASS",
  },
  {
    inspection_id: "LM-00121",
    product: "Packaged Sugar",
    category: "Food",
    date: "07 Sep 2026",
    score: 68,
    status: "FAIL",
  },
  {
    inspection_id: "LM-00120",
    product: "Bath Soap",
    category: "Personal Care",
    date: "06 Sep 2026",
    score: 88,
    status: "REVIEW",
  },
  {
    inspection_id: "LM-00119",
    product: "Tea Powder",
    category: "Food",
    date: "06 Sep 2026",
    score: 97,
    status: "PASS",
  },
  {
    inspection_id: "LM-00118",
    product: "Biscuits",
    category: "Food",
    date: "05 Sep 2026",
    score: 94,
    status: "PASS",
  },
  {
    inspection_id: "LM-00117",
    product: "Detergent Liquid",
    category: "Household",
    date: "05 Sep 2026",
    score: 72,
    status: "REVIEW",
  },
];

function InspectionHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredInspections = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return inspections.filter((inspection) => {
      const matchesSearch =
        searchValue === "" ||
        inspection.inspection_id.toLowerCase().includes(searchValue) ||
        inspection.product.toLowerCase().includes(searchValue) ||
        inspection.category.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || inspection.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const getScoreClass = (score) => {
    if (score >= 90) {
      return "text-emerald-600";
    }

    if (score >= 75) {
      return "text-amber-600";
    }

    return "text-red-600";
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Inspection Records
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Inspection History
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Search and review previously completed package inspections and
              their compliance results.
            </p>
          </div>

          <Link
            to="/inspection/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ClipboardList size={16} />
            New Inspection
          </Link>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search ID, product, or category..."
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              aria-label="Search inspections"
            />
          </div>

          {/* Status Filter */}
          <div className="flex w-full items-center gap-2 lg:w-auto">
            <Filter size={16} className="shrink-0 text-slate-400" />

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
              }}
              className="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 sm:min-w-40 lg:w-auto"
              aria-label="Filter by inspection status"
            >
              <option value="ALL">All Status</option>
              <option value="PASS">Pass</option>
              <option value="REVIEW">Review</option>
              <option value="FAIL">Fail</option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================
          RESULT COUNT
      ====================================================== */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredInspections.length}
          </span>{" "}
          inspection
          {filteredInspections.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {filteredInspections.length === 0 ? (
        <EmptyState
          hasFilters={Boolean(search.trim()) || statusFilter !== "ALL"}
          onClear={clearFilters}
        />
      ) : (
        <>
          {/* =================================================
              DESKTOP TABLE
          ================================================== */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Inspection
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Score
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInspections.map((inspection) => (
                    <tr
                      key={inspection.inspection_id}
                      className="border-b border-slate-100 transition hover:bg-slate-50 last:border-b-0"
                    >
                      {/* Inspection ID */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {inspection.inspection_id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Legal Metrology Inspection
                        </p>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {inspection.product}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {inspection.category}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays size={15} className="text-slate-400" />
                          {inspection.date}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-bold ${getScoreClass(
                            inspection.score,
                          )}`}
                        >
                          {inspection.score}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={inspection.status} />
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/inspections/${inspection.inspection_id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================== */}
          <div className="space-y-3 md:hidden">
            {filteredInspections.map((inspection) => (
              <Link
                key={inspection.inspection_id}
                to={`/inspections/${inspection.inspection_id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {inspection.inspection_id}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <Package size={15} className="shrink-0 text-slate-400" />

                      <p className="truncate text-sm font-medium text-slate-700">
                        {inspection.product}
                      </p>
                    </div>

                    <p className="mt-1 pl-[23px] text-xs text-slate-500">
                      {inspection.category}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <StatusBadge status={inspection.status} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  {/* Date */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <CalendarDays size={13} />
                      {inspection.date}
                    </p>
                  </div>

                  {/* Score */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Score
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${getScoreClass(
                        inspection.score,
                      )}`}
                    >
                      {inspection.score}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                  View inspection
                  <ChevronRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <ClipboardList size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        No inspections found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {hasFilters
          ? "No inspection records match your current search or filter."
          : "There are no inspection records available yet."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default InspectionHistory;
