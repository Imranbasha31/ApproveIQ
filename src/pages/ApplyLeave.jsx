import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Calendar, FileText, Upload } from "lucide-react";
import { Link } from "react-router-dom";
function ApplyLeave() {
  const { user } = useAuth();
  const { addLeaveRequest } = useLeave();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [proofFile, setProofFile] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "User not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      toast({
        title: "Invalid dates",
        description: "Start date cannot be after end date.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.reason.trim()) {
      toast({
        title: "Missing info",
        description: "Please provide a reason for your leave request.",
        variant: "destructive"
      });
      return;
    }
    addLeaveRequest({
      studentId: user.id,
      studentName: user.name,
      department: user.department || "Unknown",
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason
    }, proofFile || void 0).then(() => {
      toast({
        title: "Leave request submitted!",
        description: "Your request has been sent to the Class Advisor for approval."
      });
      navigate("/dashboard/my-requests");
    }).catch((error) => {
      console.error("Leave submission error:", error);
      const errorMessage = error?.message || "Failed to submit leave request. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    });
  };
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return <DashboardLayout><div className="max-w-2xl mx-auto"><div className="mb-6"><Button variant="ghost" asChild className="mb-4"><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link></Button><h1 className="text-2xl lg:text-3xl font-display font-bold">Apply for Leave</h1><p className="text-muted-foreground mt-1">Submit a new leave request for approval</p></div><Card><CardHeader><CardTitle className="font-display flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />
              Leave Application Form
            </CardTitle><CardDescription>
              Fill in the details below. Your request will go through 3 levels of approval.
            </CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-6">{
    /* Student Info */
  }<div className="p-4 bg-muted rounded-lg space-y-2"><p className="text-sm font-medium">Applicant Details</p><div className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-muted-foreground">Name:</span><span className="ml-2 font-medium">{user?.name}</span></div><div><span className="text-muted-foreground">Department:</span><span className="ml-2 font-medium">{user?.department}</span></div>{user?.studentId && <div><span className="text-muted-foreground">Student ID:</span><span className="ml-2 font-medium">{user.studentId}</span></div>}</div></div>{
    /* Date Range */
  }<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="leaveType">Leave Type</Label><Select value={formData.leaveType} onValueChange={(v) => setFormData({ ...formData, leaveType: v })}><SelectTrigger className="h-11"><SelectValue placeholder="Select leave type" /></SelectTrigger><SelectContent><SelectItem value="medical">🏥 Medical</SelectItem><SelectItem value="personal">👤 Personal</SelectItem><SelectItem value="academic">📚 Academic</SelectItem><SelectItem value="emergency">🚨 Emergency</SelectItem><SelectItem value="other">📋 Other</SelectItem></SelectContent></Select></div></div>{
    /* Date Range */
  }<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="fromDate" className="flex items-center gap-2"><Calendar className="h-4 w-4" />
                    From Date
                  </Label><Input
    id="fromDate"
    type="date"
    min={today}
    value={formData.fromDate}
    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
    required
    className="h-11"
  /></div><div className="space-y-2"><Label htmlFor="toDate" className="flex items-center gap-2"><Calendar className="h-4 w-4" />
                    To Date
                  </Label><Input
    id="toDate"
    type="date"
    min={formData.fromDate || today}
    value={formData.toDate}
    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
    required
    className="h-11"
  /></div></div>{
    /* Reason */
  }<div className="space-y-2"><Label htmlFor="reason">Reason for Leave</Label><Textarea
    id="reason"
    placeholder="Please provide a detailed reason for your leave request..."
    value={formData.reason}
    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
    required
    rows={4}
    className="resize-none"
  /></div>{
    /* File Upload (Optional) */
  }<div className="space-y-2"><Label htmlFor="proof" className="flex items-center gap-2"><Upload className="h-4 w-4" />
                  Supporting Documents (Optional)
                </Label><Input
    id="proof"
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
    className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20"
  /><p className="text-xs text-muted-foreground">
                  Upload medical certificates, invitation cards, or other relevant documents (PDF, JPG, PNG)
                </p></div>{
    /* Approval Workflow Info */
  }<div className="p-4 bg-primary/5 border border-primary/10 rounded-lg"><p className="text-sm font-medium text-primary mb-2">Approval Workflow</p><div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="px-2 py-1 bg-background rounded">Class Advisor</span><span>→</span><span className="px-2 py-1 bg-background rounded">HOD</span><span>→</span><span className="px-2 py-1 bg-background rounded">Principal</span></div></div>{
    /* Submit */
  }<div className="flex gap-4"><Button type="button" variant="outline" className="flex-1" asChild><Link to="/dashboard">Cancel</Link></Button><Button type="submit" variant="hero" className="flex-1"><Send className="h-4 w-4" />
                  Submit Request
                </Button></div></form></CardContent></Card></div></DashboardLayout>;
}
export {
  ApplyLeave as default
};
