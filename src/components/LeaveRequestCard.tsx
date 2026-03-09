import { LeaveRequest } from '@/types/leave';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { Calendar, FileText, Building } from 'lucide-react';

interface LeaveRequestCardProps {
  request: LeaveRequest;
  showTimeline?: boolean;
}

export function LeaveRequestCard({ request, showTimeline = false }: LeaveRequestCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-lg">{request.studentName}</h3>
              <StatusBadge status={request.status} currentStage={request.currentStage} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {request.department}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {request.fromDate} → {request.toDate}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            Applied: {request.createdAt}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-sm text-muted-foreground">{request.reason}</p>
        </div>

        {showTimeline && (
          <div className="pt-4 border-t">
            <WorkflowTimeline request={request} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
