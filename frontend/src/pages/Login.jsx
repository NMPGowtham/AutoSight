import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  Scale,
  ScanSearch,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /*
   * If already authenticated, redirect to the
   * requested page or dashboard.
   */
  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || "/dashboard";

    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);

      await login(username.trim(), password);

      const destination = location.state?.from?.pathname || "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (loginError) {
      console.error("Login failed:", loginError);

      setError(
        loginError?.message ||
          "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoInspector = () => {
    setUsername("inspector");
    setPassword("inspector123");
    setError("");
  };

  const fillDemoAdmin = () => {
    setUsername("admin");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        {/* =====================================================
            LEFT PANEL
        ====================================================== */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          {/* =================================================
              SUBTLE BACKGROUND DESIGN
          ================================================== */}

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Large decorative circles */}
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full border border-slate-700/40" />

          <div className="absolute -right-20 top-[30%] h-72 w-72 rounded-full border border-slate-700/30" />

          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-slate-800/20 blur-3xl" />

          {/* Main content */}
          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-16 xl:py-12">
            {/* =================================================
                BRAND
            ================================================== */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg">
                <Scale size={23} strokeWidth={2} />
              </div>

              <div>
                <p className="text-sm font-bold tracking-[0.08em] text-white">
                  LEGAL METROLOGY
                </p>

                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Compliance System
                </p>
              </div>
            </div>

            {/* =================================================
                MAIN LEFT CONTENT
            ================================================== */}
            <div className="max-w-xl">
              {/* System badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Inspection Platform
                </span>
              </div>

              {/* Heading */}
              <h1 className="max-w-lg text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
                Package compliance,
                <br />
                <span className="text-slate-400">made easier.</span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
                AI-assisted inspection of packaged commodities, mandatory
                declarations and Legal Metrology compliance requirements.
              </p>

              {/* =================================================
                  INSPECTION FLOW
              ================================================== */}
              <div className="mt-9 max-w-lg">
                <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Inspection workflow
                </p>

                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute left-4 right-4 top-4 hidden h-px bg-slate-700 sm:block" />

                  <div className="relative grid gap-4 sm:grid-cols-3">
                    <WorkflowStep
                      number="01"
                      icon={<ScanSearch size={16} />}
                      title="Scan"
                      description="Capture package"
                    />

                    <WorkflowStep
                      number="02"
                      icon={<FileCheck2 size={16} />}
                      title="Analyse"
                      description="Detect declarations"
                    />

                    <WorkflowStep
                      number="03"
                      icon={<ShieldCheck size={16} />}
                      title="Validate"
                      description="Check compliance"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  KEY CAPABILITIES
              ================================================== */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                <Capability text="OCR analysis" />
                <Capability text="Declaration detection" />
                <Capability text="Rule validation" />
                <Capability text="Compliance reports" />
              </div>
            </div>

            {/* =================================================
                LEFT FOOTER
            ================================================== */}
            <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">
              <span>Legal Metrology</span>

              <span className="h-1 w-1 rounded-full bg-slate-700" />

              <span>Packaged Commodities</span>

              <span className="h-1 w-1 rounded-full bg-slate-700" />

              <span>Inspection</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}
        <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-[410px]">
            {/* =================================================
                MOBILE BRAND
            ================================================== */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Scale size={20} />
              </div>

              <div>
                <p className="text-sm font-bold tracking-[0.08em] text-slate-900">
                  LEGAL METROLOGY
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Compliance System
                </p>
              </div>
            </div>

            {/* =================================================
                LOGIN HEADER
            ================================================== */}
            <div>
              <div className="mb-5 flex items-center gap-2">
                <div className="h-px w-6 bg-slate-300" />

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Inspector Portal
                </p>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[34px]">
                Sign in
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Access the inspection and compliance management system.
              </p>
            </div>

            {/* =================================================
                LOGIN FORM
            ================================================== */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="text-xs font-semibold text-slate-700"
                >
                  Username
                </label>

                <div className="relative mt-2">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter your username"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[11px] font-medium text-slate-400 transition hover:text-slate-700"
                    onClick={() =>
                      setError(
                        "Please contact your administrator to reset your password.",
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-xs leading-5 text-red-700">{error}</p>
                </div>
              )}

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
                />

                <label htmlFor="remember" className="text-xs text-slate-500">
                  Keep me signed in
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                DEMO ACCESS
            ================================================== */}
            <div className="mt-7 overflow-hidden rounded-xl border border-slate-200">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <ShieldCheck size={15} className="text-slate-600" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Demo access
                  </p>

                  <p className="text-[9px] text-slate-400">
                    For SIH demonstration
                  </p>
                </div>
              </div>

              {/* Demo buttons */}
              <div className="p-4">
                <p className="text-[10px] leading-5 text-slate-400">
                  Select a demo role to automatically fill the login
                  credentials.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillDemoInspector}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <UserRound size={14} />
                    Inspector
                  </button>

                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <ShieldCheck size={14} />
                    Administrator
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                SECURITY
            ================================================== */}
            <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <LockKeyhole size={12} />

              <span>Secure inspector authentication</span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span>v1.0</span>
            </div>

            <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-slate-300">
              Legal Metrology Compliance System
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   WORKFLOW STEP
========================================================= */

function WorkflowStep({ number, icon, title, description }) {
  return (
    <div className="relative flex items-center gap-3 sm:block">
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-600 bg-slate-900 text-slate-300">
        {icon}
      </div>

      <div className="sm:mt-3">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-bold tracking-wider text-slate-500">
            {number}
          </span>

          <p className="text-[11px] font-semibold text-slate-200">{title}</p>
        </div>

        <p className="mt-0.5 text-[9px] text-slate-500">{description}</p>
      </div>
    </div>
  );
}

/* =========================================================
   CAPABILITY
========================================================= */

function Capability({ text }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={13} className="text-emerald-500" />

      <span className="text-[10px] font-medium text-slate-400">{text}</span>
    </div>
  );
}

export default Login;
