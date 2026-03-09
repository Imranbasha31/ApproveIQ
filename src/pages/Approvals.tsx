import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LeaveRequestCard } from '@/components/LeaveRequestCard';
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { toast } from '@/hooks/use-toast';
import { LeaveRequest, ApprovalStage, STAGE_LABELS } from '@/types/leave';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  ChevronRight,
  Calendar,
  User,
  Building
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and process leave requests as {user?.role && STAGE_LABELS[stage]}
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">There are no pending approvals at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingApprovals.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="font-display flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      {request.studentName}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {request.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {request.fromDate} → {request.toDate}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Applied: {request.createdAt}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reason */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reason for Leave
                  </p>
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                </div>

                {/* Workflow Timeline */}
                <WorkflowTimeline request={request} />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="success" 
                    className="flex-1"
                    onClick={() => handleAction(request, 'approve')}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                    {stage < 3 && (
                      <>
                        <ChevronRight className="h-4 w-4 mx-1" />
                        <span className="text-xs opacity-75">Forward to {STAGE_LABELS[(stage + 1) as ApprovalStage]}</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleAction(request, 'reject')}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedRequest(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Add an optional comment for the approval.'
                : 'Please provide a reason for rejection. This will be visible to the student.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium">{selectedRequest.studentName}</p>
                <p className="text-muted-foreground">
                  {selectedRequest.fromDate} → {selectedRequest.toDate}
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
            <Button variant="outline" onClick={() => { setActionType(null); setSelectedRequest(null); }}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'approve' ? 'success' : 'destructive'}
              onClick={confirmAction}
            >
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Approval
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
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
