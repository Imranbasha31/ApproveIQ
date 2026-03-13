import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/types/leave";
import {
  LogOut,
  Home,
  FileText,
  CheckSquare,
  Users,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  const getNavItems = () => {
    const items = [
      { label: "Dashboard", icon: Home, path: "/dashboard" }
    ];
    if (user?.role === "student") {
      items.push(
        { label: "Apply for Leave", icon: FileText, path: "/dashboard/apply" },
        { label: "My Requests", icon: CheckSquare, path: "/dashboard/my-requests" }
      );
    }
    if (user?.role === "advisor") {
      items.push(
        { label: "Pending Approvals", icon: CheckSquare, path: "/dashboard/approvals" },
        { label: "All Requests", icon: FileText, path: "/dashboard/all-requests" }
      );
    }
    if (user?.role === "hod") {
      items.push(
        { label: "Pending Approvals", icon: CheckSquare, path: "/dashboard/approvals" },
        { label: "Department Requests", icon: FileText, path: "/dashboard/department-requests" }
      );
    }
    if (user?.role === "principal") {
      items.push(
        { label: "Pending Approvals", icon: CheckSquare, path: "/dashboard/approvals" }
      );
    }
    if (user?.role === "admin") {
      items.push(
        { label: "Pending Approvals", icon: CheckSquare, path: "/dashboard/approvals" },
        { label: "All Requests", icon: FileText, path: "/dashboard/all-requests" },
        { label: "Manage Users", icon: Users, path: "/dashboard/users" },
        { label: "Reports", icon: BarChart3, path: "/dashboard/reports" }
      );
    }
    return items;
  };
  const navItems = getNavItems();
  return <div className="min-h-screen bg-background">{
    /* Mobile Header */
  }<header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b h-16 flex items-center justify-between px-4"><button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="h-6 w-6" /></button><span className="font-display font-semibold">Leave Approval System</span><div className="w-10" /></header>{
    /* Sidebar Overlay */
  }{sidebarOpen && <div
    className="lg:hidden fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
    onClick={() => setSidebarOpen(false)}
  />}{
    /* Sidebar */
  }<aside className={cn(
    "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  )}><div className="flex flex-col h-full">{
    /* Logo */
  }<div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border"><div className="flex items-center gap-2"><img src="/yq-logo.svg" alt="ApproveIQ" className="h-8 w-8" /><span className="font-display font-semibold">ApproveIQ</span></div><button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1"><X className="h-5 w-5" /></button></div>{
    /* User Info */
  }<div className="p-4 border-b border-sidebar-border"><p className="font-medium truncate">{user?.name}</p><p className="text-sm text-sidebar-foreground/70">{user?.role && ROLE_LABELS[user.role]}</p></div>{
    /* Navigation */
  }<nav className="flex-1 p-4 space-y-1">{navItems.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return <Link
      key={item.path}
      to={item.path}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    ><Icon className="h-4 w-4" />{item.label}</Link>;
  })}</nav>{
    /* Logout */
  }<div className="p-4 border-t border-sidebar-border"><Button
    variant="ghost"
    className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
    onClick={handleLogout}
  ><LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button></div></div></aside>{
    /* Main Content */
  }<main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen"><div className="p-4 lg:p-8">{children}</div></main></div>;
}
export {
  DashboardLayout
};
