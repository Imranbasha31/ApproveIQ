import { Badge } from '@/components/ui/badge';
import { LeaveStatus, ApprovalStage, STAGE_LABELS } from '@/types/leave';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: LeaveStatus;
  currentStage?: ApprovalStage;
}

export function StatusBadge({ status, currentStage }: StatusBadgeProps) {
  if (status === 'approved') {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Approved
      </Badge>
    );
  }

  if (status === 'rejected') {
    return (
      <Badge variant="rejected" className="gap-1">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="pending" className="gap-1">
      <Clock className="h-3 w-3" />
      Pending {currentStage && `(${STAGE_LABELS[currentStage]})`}
    </Badge>
  );
}
