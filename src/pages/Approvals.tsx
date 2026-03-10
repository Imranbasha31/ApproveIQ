import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { toast } from '@/hooks/use-toast';
import { LeaveRequest, ApprovalStage, STAGE_LABELS } from '@/types/leave';
import { formatDate, calculateDays, LEAVE_TYPE_CONFIG } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Eye,
  Paperclip,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Approvals() {
  const { user } = useAuth();
  const { getPendingApprovals, approveLeave, rejectLeave } = useLeave();
  
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [viewRequest, setViewRequest] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState('');

  const getStageForRole = (): ApprovalStage => {
    switch (user?.role) {
      case 'advisor': return 1;
      case 'hod': return 2;
      case 'principal': return 3;
      default: return 1;
    }
  };

  const stage = getStageForRole();
  const pendingApprovals = getPendingApprovals(stage);

  const handleAction = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setComment('');
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType || !user) return;

    if (actionType === 'reject' && !comment.trim()) {
      toast({
        title: 'Comment required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    if (actionType === 'approve') {
      approveLeave(selectedRequest.id, user.id, user.name, stage, comment || undefined);
      toast({
        title: 'Request approved',
        description: stage === 3 
          ? 'Leave request has been finally approved.' 
          : `Request forwarded to ${STAGE_LABELS[(stage + 1) as ApprovalStage]}.`,
      });
    } else {
      rejectLeave(selectedRequest.id, user.id, user.name, stage, comment);
      toast({
        title: 'Request rejected',
        description: 'The student will be notified of the rejection.',
      });
    }

    setSelectedRequest(null);
    setActionType(null);
    setComment('');
  };

  const getUploadUrl = (file: string) =>
    `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001'}/uploads/${file}`;

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review as {user?.role && STAGE_LABELS[stage]} &middot; {pendingApprovals.length} pending
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No pending approvals at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5 w-10">#</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Student</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Dept</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Type</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">From</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">To</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Days</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Submitted</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((request, idx) => {
                    const typeKey = request.leaveType?.toLowerCase() || 'other';
                    const typeConfig = LEAVE_TYPE_CONFIG[typeKey] || LEAVE_TYPE_CONFIG.other;
                    return (
                      <tr key={request.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{request.studentName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{request.department}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            <span>{typeConfig.icon}</span>
                            <span>{typeConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDate(request.fromDate)}</td>
                        <td className="px-4 py-3">{formatDate(request.toDate)}</td>
                        <td className="px-4 py-3 font-medium">{calculateDays(request.fromDate, request.toDate)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(request.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {request.proofFile && (
                              <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                                <a href={getUploadUrl(request.proofFile)} target="_blank" rel="noopener noreferrer">
                                  <Paperclip className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => setViewRequest(request)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="default" size="sm" className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction(request, 'approve')}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm" className="h-7 px-2.5" onClick={() => handleAction(request, 'reject')}>
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Details</DialogTitle>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-medium">{viewRequest.studentName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{viewRequest.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">{formatDate(viewRequest.fromDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">To</p>
                  <p className="font-medium">{formatDate(viewRequest.toDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days</p>
                  <p className="font-medium">{calculateDays(viewRequest.fromDate, viewRequest.toDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={viewRequest.status} currentStage={viewRequest.currentStage} />
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Reason</p>
                <p className="bg-muted p-2.5 rounded">{viewRequest.reason}</p>
              </div>
              {viewRequest.proofFile && (
                <a
                  href={getUploadUrl(viewRequest.proofFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  View Attached Document
                </a>
              )}
              <div className="pt-2 border-t">
                <WorkflowTimeline request={viewRequest} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedRequest(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Add an optional comment.'
                : 'Please provide a reason for rejection.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            {selectedRequest && (
              <div className="p-2.5 bg-muted rounded text-sm">
                <p className="font-medium">{selectedRequest.studentName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(selectedRequest.fromDate)} → {formatDate(selectedRequest.toDate)}
                </p>
              </div>
            )}
            <Textarea
              placeholder={actionType === 'approve' ? 'Optional comment...' : 'Reason for rejection (required)...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setActionType(null); setSelectedRequest(null); }}>
              Cancel
            </Button>
            <Button 
              size="sm"
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={confirmAction}
            >
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Confirm
                  {stage < 3 && (
                    <>
                      <ChevronRight className="h-3 w-3 mx-0.5" />
                      <span className="text-xs opacity-75">{STAGE_LABELS[(stage + 1) as ApprovalStage]}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
