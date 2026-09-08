import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewInspection from "./pages/NewInspection";
import Processing from "./pages/Processing";
import InspectionResult from "./pages/InspectionResult";
import InspectionHistory from "./pages/InspectionHistory";
import InspectionDetails from "./pages/InspectionDetails";
import Report from "./pages/Report";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================================
            DEFAULT ROUTE
        ========================================= */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* =========================================
            LOGIN
        ========================================= */}
        <Route path="/login" element={<Login />} />

        {/* =========================================
            PROTECTED APPLICATION
        ========================================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/*Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* New Inspection */}
            <Route path="/inspection/new" element={<NewInspection />} />

            {/* Processing */}
            <Route
              path="/inspection/:inspectionId/processing"
              element={<Processing />}
            />

            {/* Inspection Result */}
            <Route
              path="/inspection/:inspectionId"
              element={<InspectionResult />}
            />

            {/* Inspection History */}
            <Route path="/inspections" element={<InspectionHistory />} />

            {/* Inspection Details */}
            <Route
              path="/inspections/:inspectionId"
              element={<InspectionDetails />}
            />

            {/* Individual Report */}
            <Route
              path="/inspections/:inspectionId/report"
              element={<Report />}
            />

            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        {/* =========================================
            404
        ========================================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
