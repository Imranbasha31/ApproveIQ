import { LeaveRequest } from '@/types/leave';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { Paperclip } from 'lucide-react';
import { formatDate, calculateDays, LEAVE_TYPE_CONFIG } from '@/lib/utils';

interface LeaveRequestCardProps {
  request: LeaveRequest;
  showTimeline?: boolean;
}

export function LeaveRequestCard({ request, showTimeline = false }: LeaveRequestCardProps) {
  const leaveType = LEAVE_TYPE_CONFIG[request.reason ? request.fromDate ? request.toDate ? 'medical' : 'other' : 'other' : 'other'];
  
  return (
    <Card className="overflow-hidden transition-all duration-150 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{request.studentName}</h3>
                <StatusBadge status={request.status} currentStage={request.currentStage} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span>{request.department}</span>
                <span>{formatDate(request.fromDate)} → {formatDate(request.toDate)}</span>
                <span className="font-medium">{calculateDays(request.fromDate, request.toDate)}d</span>
                {request.proofFile && (
                  <a
                    href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001'}/uploads/${request.proofFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Paperclip className="h-3 w-3" />
                    Doc
                  </a>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(request.createdAt)}
          </span>
        </div>
        {request.reason && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{request.reason}</p>
        )}
        {showTimeline && (
          <div className="pt-3 mt-3 border-t">
            <WorkflowTimeline request={request} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
