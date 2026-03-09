export type UserRole = 'student' | 'advisor' | 'hod' | 'principal' | 'admin';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalStage = 1 | 2 | 3;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  username?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  fromDate: string;
  toDate: string;
  reason: string;
  proofFile?: string;
  currentStage: ApprovalStage;
  status: LeaveStatus;
  createdAt: string;
  approvals: LeaveApproval[];
}

export interface LeaveApproval {
  id: string;
  leaveId: string;
  approverId: string;
  approverName: string;
  stageNumber: ApprovalStage;
  decision: 'approved' | 'rejected' | 'pending';
  comment?: string;
  decidedAt?: string;
}

export const STAGE_LABELS: Record<ApprovalStage, string> = {
  1: 'Class Advisor',
  2: 'HOD',
  3: 'Principal',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  advisor: 'Class Advisor',
  hod: 'HOD',
  principal: 'Principal',
  admin: 'Administrator',
};
