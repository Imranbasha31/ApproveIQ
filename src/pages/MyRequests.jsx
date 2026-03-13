import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { FileText, Plus, Eye, Paperclip } from "lucide-react";
import { formatDate, calculateDays, LEAVE_TYPE_CONFIG } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
function MyRequests() {
  const { user } = useAuth();
  const { getLeavesByStudent, isLoading } = useLeave();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const studentLeaves = user?.id ? getLeavesByStudent(user.id) : [];
  const filteredLeaves = statusFilter === "all" ? studentLeaves : studentLeaves.filter((l) => l.status === statusFilter);
  const getUploadUrl = (file) => `/uploads/view/${file}`;
  if (isLoading) {
    return <DashboardLayout><div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div></DashboardLayout>;
  }
  return <DashboardLayout><div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">My Requests</h1><p className="text-sm text-muted-foreground">All your submitted leave requests</p></div><Button asChild size="sm"><Link to="/dashboard/apply"><Plus className="h-4 w-4 mr-1" />
            New Request
          </Link></Button></div><Card><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">Leave History</CardTitle><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px] h-8 text-sm"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div></CardHeader><CardContent className="p-0">{filteredLeaves.length === 0 ? <div className="py-12 text-center"><FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">No requests found</p><Button asChild variant="outline" size="sm" className="mt-3"><Link to="/dashboard/apply">Apply for leave</Link></Button></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-t border-b bg-muted/50"><th className="text-left font-medium text-muted-foreground px-4 py-2.5 w-10">#</th><th className="text-left font-medium text-muted-foreground px-4 py-2.5">Type</th><th className="text-left font-medium text-muted-foreground px-4 py-2.5">From</th><th className="text-left font-medium text-muted-foreground px-4 py-2.5">To</th><th className="text-left font-medium text-muted-foreground px-4 py-2.5">Days</th><th className="text-left font-medium text-muted-foreground px-4 py-2.5">Status</th><th className="text-left font-medium text-muted-foreground px-4 py-2.5">Submitted</th><th className="text-right font-medium text-muted-foreground px-4 py-2.5">Actions</th></tr></thead><tbody>{filteredLeaves.map((leave, idx) => {
    const typeKey = leave.leaveType?.toLowerCase() || "other";
    const typeConfig = LEAVE_TYPE_CONFIG[typeKey] || LEAVE_TYPE_CONFIG.other;
    return <tr key={leave.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors"><td className="px-4 py-3 text-muted-foreground">{filteredLeaves.length - idx}</td><td className="px-4 py-3"><span className="flex items-center gap-1.5"><span>{typeConfig.icon}</span><span className="capitalize">{typeConfig.label}</span></span></td><td className="px-4 py-3">{formatDate(leave.fromDate)}</td><td className="px-4 py-3">{formatDate(leave.toDate)}</td><td className="px-4 py-3 font-medium">{calculateDays(leave.fromDate, leave.toDate)}</td><td className="px-4 py-3"><StatusBadge status={leave.status} currentStage={leave.currentStage} /></td><td className="px-4 py-3 text-muted-foreground">{formatDate(leave.createdAt)}</td><td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1">{leave.proofFile && <Button variant="outline" size="sm" className="h-7 px-2.5" asChild><a href={getUploadUrl(leave.proofFile)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />
                                Document
                              </a></Button>}<Button variant="outline" size="sm" className="h-7 px-2.5" onClick={() => setSelectedRequest(leave)}><Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button></div></td></tr>;
  })}</tbody></table></div>}</CardContent></Card><Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Leave Details</DialogTitle></DialogHeader>{selectedRequest && <div className="space-y-4"><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">From</p><p className="font-medium">{formatDate(selectedRequest.fromDate)}</p></div><div><p className="text-muted-foreground">To</p><p className="font-medium">{formatDate(selectedRequest.toDate)}</p></div><div><p className="text-muted-foreground">Days</p><p className="font-medium">{calculateDays(selectedRequest.fromDate, selectedRequest.toDate)}</p></div><div><p className="text-muted-foreground">Status</p><StatusBadge status={selectedRequest.status} currentStage={selectedRequest.currentStage} /></div></div><div className="text-sm"><p className="text-muted-foreground mb-1">Reason</p><p className="bg-muted p-2.5 rounded text-sm">{selectedRequest.reason}</p></div>{selectedRequest.proofFile && <a
    href={getUploadUrl(selectedRequest.proofFile)}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-sm text-primary hover:underline"
  ><Paperclip className="h-4 w-4" />
                  View Attached Document
                </a>}<div className="pt-2 border-t"><WorkflowTimeline request={selectedRequest} /></div></div>}</DialogContent></Dialog></DashboardLayout>;
}
export {
  MyRequests as default
};
