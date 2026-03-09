import { useState } from 'react';
import { useLeave } from '@/contexts/LeaveContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveRequestCard } from '@/components/LeaveRequestCard';
import { Search, FileText } from 'lucide-react';

export default function AllRequests() {
  const { leaveRequests } = useLeave();
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const filteredRequests = leaveRequests.filter(r => 
    r.studentName.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase()) ||
    r.reason.toLowerCase().includes(search.toLowerCase())
  );

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
  const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected');

  const renderList = (requests: typeof filteredRequests) => {
    if (requests.length === 0) {
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
        {requests.map((request) => (
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
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">All Leave Requests</h1>
        <p className="text-muted-foreground mt-1">View and monitor all leave requests in the system</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, department, or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all">
            All ({filteredRequests.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderList(filteredRequests)}
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          {renderList(pendingRequests)}
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          {renderList(approvedRequests)}
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          {renderList(rejectedRequests)}
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground mt-4">
        Click on a request to view its approval timeline
      </p>
    </DashboardLayout>
  );
}
