import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaveRequestCard } from "@/components/LeaveRequestCard";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";
function Dashboard() {
  const { user } = useAuth();
  const { leaveRequests, getLeavesByStudent, getPendingApprovals } = useLeave();
  const getStageForRole = () => {
    switch (user?.role) {
      case "advisor":
        return 1;
      case "hod":
        return 2;
      case "principal":
        return 3;
      default:
        return 1;
    }
  };
  const studentLeaves = user?.id ? getLeavesByStudent(user.id) : [];
  const pendingApprovals = getPendingApprovals(getStageForRole());
  const totalRequests = leaveRequests.length;
  const totalPending = leaveRequests.filter((l) => l.status === "pending").length;
  const totalApproved = leaveRequests.filter((l) => l.status === "approved").length;
  const totalRejected = leaveRequests.filter((l) => l.status === "rejected").length;
  const stats = [
    { label: "Total", value: totalRequests, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending", value: totalPending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Approved", value: totalApproved, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Rejected", value: totalRejected, icon: XCircle, color: "text-red-500", bg: "bg-red-50" }
  ];
  const renderOverview = () => <div className="grid grid-cols-4 gap-3 mb-6">{stats.map(({ label, value, icon: Icon, color, bg }) => <Card key={label} className="shadow-sm"><CardContent className="p-3 flex items-center gap-3"><div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}><Icon className={`h-4 w-4 ${color}`} /></div><div><p className="text-lg font-bold leading-none">{value}</p><p className="text-xs text-muted-foreground mt-0.5">{label}</p></div></CardContent></Card>)}</div>;
  const renderStudentDashboard = () => <><div className="flex items-center justify-between mb-4"><div><h1 className="text-xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1><p className="text-sm text-muted-foreground">Track and manage your leave requests</p></div><Button asChild size="sm"><Link to="/dashboard/apply"><Plus className="h-4 w-4 mr-1" />
            Apply for Leave
          </Link></Button></div>{renderOverview()}<div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold">Recent Requests</h2><Button variant="ghost" size="sm" asChild className="h-7 text-xs"><Link to="/dashboard/my-requests">
            View All <ArrowRight className="h-3 w-3 ml-1" /></Link></Button></div><div className="space-y-2">{studentLeaves.slice(0, 5).map((request) => <LeaveRequestCard key={request.id} request={request} />)}{studentLeaves.length === 0 && <Card><CardContent className="py-8 text-center"><FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No leave requests yet</p><Button asChild variant="outline" size="sm" className="mt-3"><Link to="/dashboard/apply">Apply for your first leave</Link></Button></CardContent></Card>}</div></>;
  const renderApproverDashboard = () => <><div className="mb-4"><h1 className="text-xl font-bold">Welcome, {user?.name?.split(" ")[0]}!</h1><p className="text-sm text-muted-foreground">Review and approve leave requests</p></div>{renderOverview()}<div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold">Pending Approvals ({pendingApprovals.length})</h2>{pendingApprovals.length > 0 && <Button variant="ghost" size="sm" asChild className="h-7 text-xs"><Link to="/dashboard/approvals">
              View All <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>}</div><div className="space-y-2">{pendingApprovals.slice(0, 5).map((request) => <LeaveRequestCard key={request.id} request={request} />)}{pendingApprovals.length === 0 && <Card><CardContent className="py-8 text-center"><CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" /><p className="text-sm text-muted-foreground">All caught up! No pending approvals.</p></CardContent></Card>}</div></>;
  const renderAdminDashboard = () => <><div className="mb-4"><h1 className="text-xl font-bold">Admin Dashboard</h1><p className="text-sm text-muted-foreground">Manage users and monitor leave requests</p></div>{renderOverview()}<div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold">Recent Requests</h2><Button variant="ghost" size="sm" asChild className="h-7 text-xs"><Link to="/dashboard/all-requests">
            View All <ArrowRight className="h-3 w-3 ml-1" /></Link></Button></div><div className="space-y-2">{leaveRequests.slice(0, 5).map((request) => <LeaveRequestCard key={request.id} request={request} />)}</div></>;
  return <DashboardLayout>{user?.role === "student" && renderStudentDashboard()}{(user?.role === "advisor" || user?.role === "hod" || user?.role === "principal") && renderApproverDashboard()}{user?.role === "admin" && renderAdminDashboard()}</DashboardLayout>;
}
export {
  Dashboard as default
};
