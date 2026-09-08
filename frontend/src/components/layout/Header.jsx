import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Bell,
  ChevronDown,
  Menu,
  Settings,
  UserRound,
  LogOut,
  Scale,
  ShieldCheck,
  ScanSearch,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Clock3,
  X,
  Sun,
  Moon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const displayName = user?.name || "Inspector";
  const role = user?.role || "INSPECTOR";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* =========================================================
     DEMO NOTIFICATIONS
  ========================================================= */

  const notifications = [
    {
      id: 1,
      title: "Inspection completed",
      description: "LM-00124 analysis is ready for review.",
      time: "2 min ago",
      icon: CheckCircle2,
    },
    {
      id: 2,
      title: "Compliance issue detected",
      description: "LM-00121 contains declaration violations.",
      time: "15 min ago",
      icon: AlertTriangle,
    },
    {
      id: 3,
      title: "Report generated",
      description: "Compliance report for LM-00120 is available.",
      time: "1 hr ago",
      icon: FileCheck2,
    },
  ];

  /* =========================================================
     PAGE TITLES
  ========================================================= */

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/inspection/new": "New Inspection",
    "/inspections": "Inspection History",
    "/reports": "Reports",
    "/profile": "My Profile",
  };

  const currentPage = pageTitles[location.pathname] || "Inspection Platform";

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleLogout = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    logout();
  };

  const handleMenuClick = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    onMenuClick?.();
  };

  const handleNotificationToggle = () => {
    setNotificationsOpen((current) => !current);
    setProfileOpen(false);
  };

  const handleProfileToggle = () => {
    setProfileOpen((current) => !current);
    setNotificationsOpen(false);
  };

  return (
    <header
      className="
        relative z-40 flex h-16 shrink-0
        items-center justify-between
        border-b border-slate-200
        bg-white px-3
        transition-colors duration-200
        dark:border-slate-800
        dark:bg-slate-950
        sm:px-5
        lg:px-7
      "
    >
      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {/* =================================================
            MOBILE MENU
        ================================================== */}

        <button
          type="button"
          onClick={handleMenuClick}
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-lg
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-slate-900
            active:bg-slate-200
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
            lg:hidden
          "
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
        >
          <Menu size={22} strokeWidth={2} />
        </button>

        {/* =================================================
            DESKTOP BRAND
        ================================================== */}

        <div className="hidden min-w-0 items-center gap-3 sm:flex">
          {/* Logo */}

          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              bg-slate-900
              text-white
              shadow-sm
              dark:bg-white
              dark:text-slate-950
            "
          >
            <Scale size={18} strokeWidth={2} />
          </div>

          {/* Brand text */}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="
                  truncate text-xs font-bold
                  tracking-wide
                  text-slate-800
                  dark:text-slate-100
                "
              >
                LEGAL METROLOGY
              </p>

              <span
                className="
                  hidden h-1 w-1 rounded-full
                  bg-slate-300
                  dark:bg-slate-600
                  md:block
                "
              />

              <p
                className="
                  hidden truncate text-[10px]
                  font-medium uppercase
                  tracking-wider
                  text-slate-400
                  dark:text-slate-500
                  md:block
                "
              >
                Compliance Inspection Platform
              </p>
            </div>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {currentPage}
              </span>

              <span className="text-slate-300 dark:text-slate-700">/</span>

              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                AI-assisted analysis
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            MOBILE BRAND
        ================================================== */}

        <div className="min-w-0 sm:hidden">
          <div className="flex items-center gap-2">
            <div
              className="
                flex h-8 w-8 shrink-0
                items-center justify-center
                rounded-lg
                bg-slate-900
                text-white
                dark:bg-white
                dark:text-slate-950
              "
            >
              <Scale size={16} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate text-xs font-bold
                  tracking-wide
                  text-slate-800
                  dark:text-slate-100
                "
              >
                LEGAL METROLOGY
              </p>

              <p
                className="
                  truncate text-[9px]
                  font-medium uppercase
                  tracking-wider
                  text-slate-400
                  dark:text-slate-500
                "
              >
                {currentPage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {/* =================================================
            AI ENGINE
        ================================================== */}

        <div
          className="
            hidden items-center gap-2
            rounded-lg
            border border-slate-200
            bg-slate-50
            px-3 py-2
            lg:flex
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div
            className="
              flex h-5 w-5
              items-center justify-center
              rounded-md
              bg-white
              dark:bg-slate-800
            "
          >
            <ScanSearch
              size={12}
              className="text-slate-600 dark:text-slate-300"
            />
          </div>

          <div className="leading-none">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              AI Engine
            </p>

            <p className="mt-1 text-[8px] font-medium text-slate-400 dark:text-slate-500">
              OCR • Rule Validation
            </p>
          </div>
        </div>

        {/* =================================================
            DAY / NIGHT TOGGLE
        ================================================== */}

        <button
          type="button"
          onClick={toggleTheme}
          className="
            group flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-lg
            border border-slate-200
            bg-white
            text-slate-700
            shadow-sm
            transition-all duration-200
            hover:bg-slate-100
            hover:text-slate-950
            active:scale-95
            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-200
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
          title={isDark ? "Switch to day mode" : "Switch to night mode"}
          aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
        >
          {isDark ? (
            <Sun
              size={18}
              strokeWidth={2}
              className="
                transition-transform
                duration-300
                group-hover:rotate-45
              "
            />
          ) : (
            <Moon
              size={18}
              strokeWidth={2}
              className="
                transition-transform
                duration-300
                group-hover:-rotate-12
              "
            />
          )}
        </button>

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationToggle}
            className={`
              relative flex h-10 w-10
              shrink-0 items-center
              justify-center rounded-lg
              transition
              ${
                notificationsOpen
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }
            `}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="menu"
          >
            <Bell size={18} strokeWidth={1.9} />

            {/* Monochrome unread dot */}

            <span
              className="
                absolute right-2 top-2
                h-2 w-2 rounded-full
                border-2 border-white
                bg-slate-900
                dark:border-slate-950
                dark:bg-white
              "
            />
          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================== */}

          {notificationsOpen && (
            <>
              {/* Backdrop */}

              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setNotificationsOpen(false)}
                className="
                  fixed inset-0 z-40
                  cursor-default
                  bg-transparent
                "
              />

              {/* Dropdown */}

              <div
                className="
                  absolute right-0 top-[48px]
                  z-50
                  w-[calc(100vw-24px)]
                  max-w-[360px]
                  overflow-hidden
                  rounded-xl
                  border border-slate-200
                  bg-white
                  shadow-xl
                  dark:border-slate-700
                  dark:bg-slate-900
                "
              >
                {/* Header */}

                <div
                  className="
                    flex items-center
                    justify-between
                    border-b border-slate-100
                    px-4 py-3
                    dark:border-slate-800
                  "
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Notifications
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                      Recent system activity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="
                      flex h-7 w-7
                      items-center justify-center
                      rounded-md
                      text-slate-400
                      hover:bg-slate-100
                      hover:text-slate-700
                      dark:hover:bg-slate-800
                      dark:hover:text-white
                    "
                    aria-label="Close notifications"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Notifications */}

                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="
                          group flex w-full gap-3
                          border-b border-slate-100
                          px-4 py-3
                          text-left
                          transition
                          hover:bg-slate-50
                          dark:border-slate-800
                          dark:hover:bg-slate-800
                        "
                      >
                        <div
                          className="
                            flex h-9 w-9
                            shrink-0 items-center
                            justify-center rounded-lg
                            bg-slate-100
                            text-slate-600
                            dark:bg-slate-800
                            dark:text-slate-300
                          "
                        >
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                            {notification.description}
                          </p>

                          <div className="mt-1.5 flex items-center gap-1">
                            <Clock3
                              size={10}
                              className="text-slate-300 dark:text-slate-600"
                            />

                            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}

                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="
                    flex min-h-10 w-full
                    items-center justify-center
                    border-t border-slate-100
                    bg-slate-50
                    px-4
                    text-[10px]
                    font-semibold
                    text-slate-500
                    transition
                    hover:bg-slate-100
                    dark:border-slate-800
                    dark:bg-slate-950
                    dark:text-slate-400
                    dark:hover:bg-slate-900
                  "
                >
                  View all notifications
                </button>
              </div>
            </>
          )}
        </div>

        {/* Divider */}

        <div
          className="
            mx-1 hidden h-6 w-px
            bg-slate-200
            dark:bg-slate-800
            sm:block
          "
        />

        {/* =================================================
            PROFILE
        ================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={handleProfileToggle}
            className="
              flex h-10 shrink-0
              items-center gap-2
              rounded-lg p-1
              transition
              hover:bg-slate-50
              dark:hover:bg-slate-800
            "
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Open profile menu"
          >
            {/* Avatar */}

            <div
              className="
                flex h-9 w-9
                shrink-0 items-center
                justify-center rounded-lg
                bg-slate-900
                text-xs font-bold
                text-white
                shadow-sm
                dark:bg-white
                dark:text-slate-950
              "
            >
              {initials || "I"}
            </div>

            {/* Name */}

            <div className="hidden text-left md:block">
              <p className="max-w-[140px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                {displayName}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {role}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`
                hidden text-slate-400
                transition-transform
                duration-200
                md:block
                ${profileOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================== */}

          {profileOpen && (
            <>
              {/* Backdrop */}

              <button
                type="button"
                aria-label="Close profile menu"
                onClick={() => setProfileOpen(false)}
                className="
                  fixed inset-0 z-40
                  cursor-default
                  bg-transparent
                "
              />

              {/* Dropdown */}

              <div
                className="
                  absolute right-0 top-[48px]
                  z-50
                  w-[calc(100vw-24px)]
                  max-w-[280px]
                  overflow-hidden
                  rounded-xl
                  border border-slate-200
                  bg-white
                  shadow-xl
                  dark:border-slate-700
                  dark:bg-slate-900
                "
              >
                {/* Profile summary */}

                <div
                  className="
                    border-b border-slate-100
                    bg-slate-50 p-4
                    dark:border-slate-800
                    dark:bg-slate-950
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-11 w-11
                        shrink-0 items-center
                        justify-center rounded-xl
                        bg-slate-900
                        text-sm font-bold
                        text-white
                        dark:bg-white
                        dark:text-slate-950
                      "
                    >
                      {initials || "I"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {displayName}
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {role}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white" />

                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      Account active
                    </span>
                  </div>
                </div>

                {/* Menu */}

                <div className="p-2">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="
                      flex min-h-11
                      items-center gap-3
                      rounded-lg px-3 py-2.5
                      text-sm font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      hover:text-slate-900
                      dark:text-slate-300
                      dark:hover:bg-slate-800
                      dark:hover:text-white
                    "
                  >
                    <UserRound size={16} />

                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="
                      flex min-h-11
                      items-center gap-3
                      rounded-lg px-3 py-2.5
                      text-sm font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      hover:text-slate-900
                      dark:text-slate-300
                      dark:hover:bg-slate-800
                      dark:hover:text-white
                    "
                  >
                    <Settings size={16} />

                    <span>Account Settings</span>
                  </Link>
                </div>

                {/* Logout */}

                <div
                  className="
                    border-t border-slate-100
                    p-2
                    dark:border-slate-800
                  "
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex min-h-11
                      w-full items-center
                      gap-3 rounded-lg
                      px-3 py-2.5
                      text-sm font-semibold
                      text-slate-600
                      transition
                      hover:bg-slate-100
                      hover:text-slate-900
                      dark:text-slate-300
                      dark:hover:bg-slate-800
                      dark:hover:text-white
                    "
                  >
                    <LogOut size={16} />

                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
