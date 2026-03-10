import { useState } from 'react';
import { useLeave } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { Search, FileText, Download, Eye, Paperclip } from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { formatDate, calculateDays, LEAVE_TYPE_CONFIG } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeaveRequest } from '@/types/leave';

export default function AllRequests() {
  const { leaveRequests } = useLeave();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [exporting, setExporting] = useState(false);

  const filteredRequests = leaveRequests.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await apiClient.exportLeavesCSV();
      toast({ title: 'CSV exported successfully' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not export CSV file.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const getUploadUrl = (file: string) =>
    `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001'}/uploads/${file}`;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Leave Requests</h1>
          <p className="text-sm text-muted-foreground">View and monitor all leave requests</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'principal') && (
          <Button onClick={handleExportCSV} disabled={exporting} variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, department, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-b bg-muted/50">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 w-10">#</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Student</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Dept</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Type</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">From</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">To</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Days</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Status</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Submitted</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((leave, idx) => {
                    const typeKey = leave.leaveType?.toLowerCase() || 'other';
                    const typeConfig = LEAVE_TYPE_CONFIG[typeKey] || LEAVE_TYPE_CONFIG.other;
                    return (
                      <tr key={leave.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{filteredRequests.length - idx}</td>
                        <td className="px-4 py-3 font-medium">{leave.studentName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{leave.department}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            <span>{typeConfig.icon}</span>
                            <span>{typeConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDate(leave.fromDate)}</td>
                        <td className="px-4 py-3">{formatDate(leave.toDate)}</td>
                        <td className="px-4 py-3 font-medium">{calculateDays(leave.fromDate, leave.toDate)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={leave.status} currentStage={leave.currentStage} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(leave.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {leave.proofFile && (
                              <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                                <a href={getUploadUrl(leave.proofFile)} target="_blank" rel="noopener noreferrer">
                                  <Paperclip className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="h-7 px-2.5" onClick={() => setSelectedRequest(leave)}>
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">{formatDate(selectedRequest.fromDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">To</p>
                  <p className="font-medium">{formatDate(selectedRequest.toDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days</p>
                  <p className="font-medium">{calculateDays(selectedRequest.fromDate, selectedRequest.toDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedRequest.status} currentStage={selectedRequest.currentStage} />
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Reason</p>
                <p className="bg-muted p-2.5 rounded">{selectedRequest.reason}</p>
              </div>
              {selectedRequest.proofFile && (
                <a
                  href={getUploadUrl(selectedRequest.proofFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  View Attached Document
                </a>
              )}
              <div className="pt-2 border-t">
                <WorkflowTimeline request={selectedRequest} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
