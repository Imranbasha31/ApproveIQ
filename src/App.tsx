import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LeaveProvider } from "@/contexts/LeaveContext";
import { useEffect } from "react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyLeave from "./pages/ApplyLeave";
import MyRequests from "./pages/MyRequests";
import Approvals from "./pages/Approvals";
import AllRequests from "./pages/AllRequests";
import DepartmentRequests from "./pages/DepartmentRequests";
import ManageUsers from "./pages/ManageUsers";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/apply" element={<ProtectedRoute><ApplyLeave /></ProtectedRoute>} />
      <Route path="/dashboard/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
      <Route path="/dashboard/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
      <Route path="/dashboard/all-requests" element={<ProtectedRoute><AllRequests /></ProtectedRoute>} />
      <Route path="/dashboard/department-requests" element={<ProtectedRoute><DepartmentRequests /></ProtectedRoute>} />
      <Route path="/dashboard/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
      <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Use system preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LeaveProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </LeaveProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
