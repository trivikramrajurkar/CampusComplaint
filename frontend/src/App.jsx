import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./hooks/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import StudentDashboard from "./pages/student/StudentDashboard";
import NewComplaint from "./pages/student/NewComplaint";
import MyComplaints from "./pages/student/MyComplaints";
import ComplaintDetail from "./pages/student/ComplaintDetail";

import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorComplaints from "./pages/coordinator/CoordinatorComplaints";
import CoordinatorComplaintDetail from "./pages/coordinator/CoordinatorComplaintDetail";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminComplaintDetail from "./pages/admin/AdminComplaintDetail";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import DepartmentComplaints from "./pages/department/DepartmentComplaints";
import DepartmentComplaintDetail from "./pages/department/DepartmentComplaintDetail";
import AdminUsers from "./pages/admin/AdminUsers";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const map = {
    STUDENT: "/student/dashboard",
    COORDINATOR: "/coordinator/dashboard",
    DEPARTMENT: "/department/dashboard",
    ADMIN: "/admin/dashboard",
  };
  return <Navigate to={map[user.role] || "/login"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/new" element={<NewComplaint />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
      </Route>

      <Route
        path="/department"
        element={
          <ProtectedRoute roles={["DEPARTMENT"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DepartmentDashboard />} />
        <Route path="complaints" element={<DepartmentComplaints />} />
        <Route path="complaints/:id" element={<DepartmentComplaintDetail />} />
      </Route>

      {/* Coordinator routes */}
      <Route
        path="/coordinator"
        element={
          <ProtectedRoute roles={["COORDINATOR"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CoordinatorDashboard />} />
        <Route path="complaints" element={<CoordinatorComplaints />} />
        <Route path="complaints/:id" element={<CoordinatorComplaintDetail />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="complaints/:id" element={<AdminComplaintDetail />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
