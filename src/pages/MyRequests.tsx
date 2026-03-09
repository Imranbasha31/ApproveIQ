import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LeaveRequestCard } from '@/components/LeaveRequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';

export default function MyRequests() {
  const { user } = useAuth();
  const { leaveRequests, getLeavesByStudent, isLoading } = useLeave();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const studentLeaves = user?.id ? getLeavesByStudent(user.id) : [];

  const pendingLeaves = studentLeaves.filter(l => l.status === 'pending');
  const approvedLeaves = studentLeaves.filter(l => l.status === 'approved');
  const rejectedLeaves = studentLeaves.filter(l => l.status === 'rejected');

  const renderLeaveList = (leaves: typeof studentLeaves) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      );
    }

    if (leaves.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No requests found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {leaves.map((request) => (
          <div 
            key={request.id}
            className="cursor-pointer"
            onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
          >
            <LeaveRequestCard 
              request={request} 
              showTimeline={selectedRequest === request.id}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">My Requests</h1>
          <p className="text-muted-foreground mt-1">View and track all your leave requests</p>
        </div>
        <Button asChild variant="hero">
          <Link to="/dashboard/apply">
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all">
            All ({studentLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedLeaves.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderLeaveList(studentLeaves)}
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          {renderLeaveList(pendingLeaves)}
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          {renderLeaveList(approvedLeaves)}
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          {renderLeaveList(rejectedLeaves)}
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground mt-4">
        Click on a request to view its approval timeline
      </p>
    </DashboardLayout>
  );
}
