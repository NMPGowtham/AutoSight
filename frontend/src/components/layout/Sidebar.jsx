import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  FileText,
  LogOut,
  Scale,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "New Inspection",
      path: "/inspection/new",
      icon: ScanLine,
    },
    {
      name: "Inspection History",
      path: "/inspections",
      icon: ClipboardList,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
    },
  ];

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  const handleBrandClick = () => {
    navigate("/dashboard");
    onClose?.();
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
        id="mobile-navigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-slate-200 bg-white
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* =================================================
            BRAND / SYSTEM IDENTITY
        ================================================== */}
        <button
          type="button"
          onClick={handleBrandClick}
          className="group relative flex h-[108px] w-full shrink-0 items-center border-b border-slate-200 px-5 text-left transition-colors hover:bg-slate-50 sm:px-6"
          aria-label="Go to Dashboard"
        >
          {/* Subtle left accent */}
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-slate-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* =================================================
                LOGO
            ================================================== */}
            <div className="relative shrink-0">
              {/* Subtle animated ring */}
              <div className="absolute inset-0 rounded-xl bg-slate-900 opacity-0 blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-10" />

              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <Scale size={22} strokeWidth={2} />
              </div>

              {/* Compliance check */}
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                <ShieldCheck
                  size={9}
                  strokeWidth={2.5}
                  className="text-white"
                />
              </div>
            </div>

            {/* =================================================
                BRAND TEXT
            ================================================== */}
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">
                  Legal Metrology
                </h1>

                <ChevronRight
                  size={13}
                  className="shrink-0 text-slate-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-slate-500"
                />
              </div>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                Package Compliance System
              </p>

              {/* AI indicator */}
              <div className="mt-2 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  AI-Assisted Inspection
                </span>
              </div>
            </div>
          </div>

          {/* Mobile close */}
          <span
            onClick={(event) => {
              event.stopPropagation();
              onClose?.();
            }}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 lg:hidden"
            role="button"
            aria-label="Close navigation"
          >
            <X size={20} />
          </span>
        </button>

        {/* =================================================
            NAVIGATION
        ================================================== */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-white" />
                      )}

                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2.2 : 1.9}
                        className={`shrink-0 transition-transform duration-200 ${
                          !isActive ? "group-hover:scale-105" : ""
                        }`}
                      />

                      <span className="truncate">{item.name}</span>

                      {isActive && (
                        <ChevronRight
                          size={15}
                          className="ml-auto shrink-0 text-slate-400"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* =================================================
              SYSTEM INFO
          ================================================== */}
          <div className="mt-8 px-3">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              System
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <ShieldCheck size={14} className="text-slate-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-700">
                    Compliance Engine
                  </p>

                  <p className="mt-0.5 text-[9px] leading-4 text-slate-400">
                    Automated declaration analysis enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* =================================================
            USER SECTION
        ================================================== */}
        <div className="shrink-0 border-t border-slate-200 p-3">
          {/* User information */}
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
              {user?.name?.charAt(0)?.toUpperCase() || "I"}
            </div>

            {/* User details */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "Inspector"}
              </p>

              <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {user?.role || "INSPECTOR"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 active:bg-red-100"
          >
            <LogOut
              size={19}
              className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
