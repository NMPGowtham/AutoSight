import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();

  const name = user?.name || "Inspector";

  const role = user?.role || "INSPECTOR";

  const inspectorId = user?.id || "INS-001";

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = role === "ADMIN";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* =================================================
          HEADER
      ================================================== */}
      <div>
        <Link
          to="/dashboard"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your inspector account and access details.
        </p>
      </div>

      {/* =================================================
          PROFILE HERO
      ================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-900 px-5 py-7 sm:px-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-slate-900">
              {initials}
            </div>

            {/* Identity */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{name}</h2>

                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {role}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Legal Metrology Inspection Officer
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  {inspectorId}
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Active account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic information */}
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <ProfileInfo
            icon={<UserRound size={17} />}
            label="Full Name"
            value={name}
          />

          <ProfileInfo
            icon={<ShieldCheck size={17} />}
            label="Role"
            value={isAdmin ? "Administrator" : "Inspector"}
          />

          <ProfileInfo
            icon={<KeyRound size={17} />}
            label="Inspector ID"
            value={inspectorId}
          />

          <ProfileInfo
            icon={<Mail size={17} />}
            label="Account Type"
            value="Authorized User"
          />
        </div>
      </section>

      {/* =================================================
          ACCESS & PERMISSIONS
      ================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">Access & Permissions</h2>

          <p className="mt-1 text-xs text-slate-500">
            Features available to your current role.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Permission
            title="Package Inspection"
            description="Upload and analyse packaged commodities."
            enabled
          />

          <Permission
            title="Compliance Results"
            description="Review AI-assisted compliance findings."
            enabled
          />

          <Permission
            title="Inspection History"
            description="Access previous inspection records."
            enabled
          />

          <Permission
            title="Compliance Reports"
            description="View and generate inspection reports."
            enabled
          />

          <Permission
            title="Dashboard Analytics"
            description="View inspection and violation statistics."
            enabled
          />

          <Permission
            title="User Administration"
            description="Manage system users and permissions."
            enabled={isAdmin}
          />
        </div>
      </section>

      {/* =================================================
          ACCOUNT STATUS
      ================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">Account Status</h2>

          <p className="mt-1 text-xs text-slate-500">
            Current account and session information.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatusItem
            icon={<CheckCircle2 size={17} className="text-emerald-600" />}
            label="Account"
            value="Active"
          />

          <StatusItem
            icon={<ShieldCheck size={17} className="text-slate-600" />}
            label="Authentication"
            value="Authenticated"
          />

          <StatusItem
            icon={<Clock3 size={17} className="text-slate-600" />}
            label="Session"
            value="Current session"
          />
        </div>
      </section>

      {/* =================================================
          SECURITY
      ================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Security</h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Keep your account secure and sign out when you finish your
              inspection session.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </section>

      {/* =================================================
          SYSTEM INFORMATION
      ================================================== */}
      <div className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Legal Metrology Compliance System</span>

        <span>Frontend Version 1.0</span>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE INFO
========================================================= */

function ProfileInfo({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PERMISSION
========================================================= */

function Permission({ title, description, enabled }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-sm font-semibold ${
              enabled ? "text-slate-700" : "text-slate-400"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-xs leading-5 ${
              enabled ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${
            enabled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {enabled ? "Allowed" : "Restricted"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS ITEM
========================================================= */

function StatusItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

export default Profile;
