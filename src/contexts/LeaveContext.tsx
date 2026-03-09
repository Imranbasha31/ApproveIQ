import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LeaveRequest, LeaveApproval, ApprovalStage } from '@/types/leave';
import { apiClient, LeaveRequestDTO } from '@/services/api';
import { useAuth } from './AuthContext';

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'approvals' | 'currentStage' | 'status'>) => Promise<void>;
  approveLeave: (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment?: string) => Promise<void>;
  rejectLeave: (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment: string) => Promise<void>;
  getLeavesByStudent: (studentId: string) => LeaveRequest[];
  getPendingApprovals: (stage: ApprovalStage) => LeaveRequest[];
  isLoading: boolean;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

// Convert API response to frontend format
function convertAPILeaveToRequest(data: LeaveRequestDTO): LeaveRequest {
  return {
    id: data.id.toLowerCase(),
    studentId: data.student_id.toLowerCase(),
    studentName: data.student_name,
    department: '',
    fromDate: data.start_date,
    toDate: data.end_date,
    reason: data.reason,
    currentStage: (data.current_stage || 1) as ApprovalStage,
    status: data.status as any,
    createdAt: data.created_at.split('T')[0],
    approvals: [],
  };
}

export function LeaveProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLeaves = async () => {
    if (!user) {
      console.log('No user, skipping loadLeaves');
      return;
    }
    
    // Ensure apiClient has current user set
    apiClient.setCurrentUser(user);
    
    setIsLoading(true);
    try {
      console.log('Loading leaves for user:', user.id);
      console.log('API Client headers will include:', { 
        'x-user-id': user.id, 
        'x-username': user.username 
      });
      const data = await apiClient.getLeaves();
      console.log('Received leaves from API:', data);
      const converted = data.map(convertAPILeaveToRequest);
      console.log('Converted leaves:', converted);
      setLeaveRequests(converted);
    } catch (error) {
      console.error('Failed to load leaves:', error);
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User changed, loading leaves');
      loadLeaves();
    } else {
      console.log('No user, clearing leaves');
      setLeaveRequests([]);
    }
  }, [user?.id]); // Use user.id to trigger on user changes

  const addLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'approvals' | 'currentStage' | 'status'>) => {
    try {
      const response = await apiClient.createLeave({
        leave_type: 'general',
        start_date: request.fromDate,
        end_date: request.toDate,
        reason: request.reason,
      });
      console.log('Leave created successfully:', response);
      
      // Reload leaves to get the new data
      await loadLeaves();
      console.log('Leaves reloaded after creation');
    } catch (error) {
      console.error('Failed to create leave request:', error);
      throw error;
    }
  };

  const approveLeave = async (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment?: string) => {
    try {
      // Determine next stage
      const nextStage = stage === 3 ? 3 : (stage + 1) as ApprovalStage;
      const finalStatus = stage === 3 ? 'approved' : 'pending';
      
      await apiClient.updateLeave(leaveId, {
        status: finalStatus,
        current_stage: nextStage,
        approver_stage: stage,
        comments: comment,
      });
      await loadLeaves();
    } catch (error) {
      console.error('Failed to approve leave:', error);
      throw error;
    }
  };

  const rejectLeave = async (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment: string) => {
    try {
      await apiClient.updateLeave(leaveId, {
        status: 'rejected',
        comments: comment,
      });
      await loadLeaves();
    } catch (error) {
      console.error('Failed to reject leave:', error);
      throw error;
    }
  };

  const getLeavesByStudent = (studentId: string) => {
    return leaveRequests.filter(leave => leave.studentId === studentId);
  };

  const getPendingApprovals = (stage: ApprovalStage) => {
    return leaveRequests.filter(
      leave => leave.status === 'pending' && leave.currentStage === stage
    );
  };

  return (
    <LeaveContext.Provider value={{ 
      leaveRequests, 
      addLeaveRequest, 
      approveLeave, 
      rejectLeave, 
      getLeavesByStudent, 
      getPendingApprovals,
      isLoading,
    }}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
}
