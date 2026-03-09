import { LeaveRequest, STAGE_LABELS, ApprovalStage } from '@/types/leave';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowTimelineProps {
  request: LeaveRequest;
}

export function WorkflowTimeline({ request }: WorkflowTimelineProps) {
  const stages: ApprovalStage[] = [1, 2, 3];

  const getStageStatus = (stage: ApprovalStage) => {
    const approval = request.approvals.find(a => a.stageNumber === stage);
    if (approval) {
      return approval.decision;
    }
    if (request.status === 'rejected') return 'skipped';
    if (request.currentStage === stage) return 'current';
    if (request.currentStage > stage) return 'approved';
    return 'waiting';
  };

  const getStageApproval = (stage: ApprovalStage) => {
    return request.approvals.find(a => a.stageNumber === stage);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-display font-semibold text-foreground">Approval Workflow</h4>
      <div className="relative">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage);
          const approval = getStageApproval(stage);
          const isLast = index === stages.length - 1;

          return (
            <div key={stage} className="relative flex gap-4">
              {/* Connector line */}
              {!isLast && (
                <div 
                  className={cn(
                    "absolute left-4 top-8 w-0.5 h-full -translate-x-1/2",
                    status === 'approved' ? "bg-success" : 
                    status === 'rejected' ? "bg-destructive" :
                    "bg-border"
                  )}
                />
              )}

              {/* Icon */}
              <div 
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  status === 'approved' && "bg-success text-success-foreground",
                  status === 'rejected' && "bg-destructive text-destructive-foreground",
                  status === 'current' && "bg-primary text-primary-foreground animate-pulse",
                  status === 'waiting' && "bg-muted text-muted-foreground",
                  status === 'skipped' && "bg-muted text-muted-foreground opacity-50"
                )}
              >
                {status === 'approved' && <CheckCircle className="h-4 w-4" />}
                {status === 'rejected' && <XCircle className="h-4 w-4" />}
                {status === 'current' && <Clock className="h-4 w-4" />}
                {(status === 'waiting' || status === 'skipped') && <User className="h-4 w-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between">
                  <h5 className={cn(
                    "font-medium",
                    status === 'skipped' && "text-muted-foreground opacity-50"
                  )}>
                    Stage {stage}: {STAGE_LABELS[stage]}
                  </h5>
                  {approval?.decidedAt && (
                    <span className="text-xs text-muted-foreground">
                      {approval.decidedAt}
                    </span>
                  )}
                </div>
                
                {approval && (
                  <div className="mt-1 text-sm">
                    <p className="text-muted-foreground">
                      {approval.decision === 'approved' ? 'Approved' : 'Rejected'} by {approval.approverName}
                    </p>
                    {approval.comment && (
                      <p className="mt-1 text-muted-foreground italic">
                        "{approval.comment}"
                      </p>
                    )}
                  </div>
                )}

                {status === 'current' && (
                  <p className="mt-1 text-sm text-primary font-medium">
                    Awaiting approval...
                  </p>
                )}

                {status === 'waiting' && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Waiting for previous stage
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
