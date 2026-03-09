import { useLeave } from '@/contexts/LeaveContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Reports() {
  const { leaveRequests } = useLeave();

  const statusData = [
    { name: 'Pending', value: leaveRequests.filter(l => l.status === 'pending').length, color: 'hsl(221, 83%, 53%)' },
    { name: 'Approved', value: leaveRequests.filter(l => l.status === 'approved').length, color: 'hsl(142, 71%, 45%)' },
    { name: 'Rejected', value: leaveRequests.filter(l => l.status === 'rejected').length, color: 'hsl(0, 84%, 60%)' },
  ];

  // Mock monthly data
  const monthlyData = [
    { month: 'Sep', requests: 12, approved: 10, rejected: 2 },
    { month: 'Oct', requests: 18, approved: 14, rejected: 4 },
    { month: 'Nov', requests: 15, approved: 12, rejected: 3 },
    { month: 'Dec', requests: 8, approved: 5, rejected: 1 },
  ];

  const departmentData = [
    { department: 'Computer Science', requests: 15 },
    { department: 'Electronics', requests: 12 },
    { department: 'Mechanical', requests: 8 },
    { department: 'Civil', requests: 10 },
    { department: 'Electrical', requests: 6 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">View leave statistics and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leaveRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusData[0].value}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusData[1].value}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusData[2].value}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Request Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip />
                <Bar dataKey="approved" fill="hsl(142, 71%, 45%)" name="Approved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="hsl(0, 84%, 60%)" name="Rejected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Department-wise Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-sm" />
              <YAxis dataKey="department" type="category" className="text-sm" width={120} />
              <Tooltip />
              <Bar dataKey="requests" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
