import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "./AuthContext";
const LeaveContext = createContext(void 0);
function convertAPILeaveToRequest(data) {
  return {
    id: data.id.toLowerCase(),
    studentId: data.student_id.toLowerCase(),
    studentName: data.student_name,
    department: data.department || "",
    leaveType: data.leave_type || "general",
    fromDate: data.start_date,
    toDate: data.end_date,
    reason: data.reason,
    currentStage: data.current_stage || 1,
    status: data.status,
    createdAt: data.created_at.split("T")[0],
    proofFile: data.proof_file || void 0,
    approvals: []
  };
}
function LeaveProvider({ children }) {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadLeaves = async () => {
    if (!user) {
      console.log("No user, skipping loadLeaves");
      return;
    }
    apiClient.setCurrentUser(user);
    setIsLoading(true);
    try {
      console.log("Loading leaves for user:", user.id);
      console.log("API Client headers will include:", {
        "x-user-id": user.id,
        "x-username": user.username
      });
      const data = await apiClient.getLeaves();
      console.log("Received leaves from API:", data);
      const converted = data.map(convertAPILeaveToRequest);
      console.log("Converted leaves:", converted);
      setLeaveRequests(converted);
    } catch (error) {
      console.error("Failed to load leaves:", error);
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      console.log("User changed, loading leaves");
      loadLeaves();
    } else {
      console.log("No user, clearing leaves");
      setLeaveRequests([]);
    }
  }, [user?.id]);
  const addLeaveRequest = async (request, file) => {
    try {
      const response = await apiClient.createLeave({
        leave_type: request.leaveType || "general",
        start_date: request.fromDate,
        end_date: request.toDate,
        reason: request.reason
      }, file);
      console.log("Leave created successfully:", response);
      await loadLeaves();
      console.log("Leaves reloaded after creation");
    } catch (error) {
      console.error("Failed to create leave request:", error);
      throw error;
    }
  };
  const approveLeave = async (leaveId, approverId, approverName, stage, comment) => {
    try {
      const nextStage = stage === 3 ? 3 : stage + 1;
      const finalStatus = stage === 3 ? "approved" : "pending";
      await apiClient.updateLeave(leaveId, {
        status: finalStatus,
        current_stage: nextStage,
        approver_stage: stage,
        comments: comment
      });
      await loadLeaves();
    } catch (error) {
      console.error("Failed to approve leave:", error);
      throw error;
    }
  };
  const rejectLeave = async (leaveId, approverId, approverName, stage, comment) => {
    try {
      await apiClient.updateLeave(leaveId, {
        status: "rejected",
        comments: comment
      });
      await loadLeaves();
    } catch (error) {
      console.error("Failed to reject leave:", error);
      throw error;
    }
  };
  const getLeavesByStudent = (studentId) => {
    return leaveRequests.filter((leave) => leave.studentId === studentId);
  };
  const getPendingApprovals = (stage) => {
    return leaveRequests.filter(
      (leave) => leave.status === "pending" && leave.currentStage === stage
    );
  };
  return <LeaveContext.Provider value={{
    leaveRequests,
    addLeaveRequest,
    approveLeave,
    rejectLeave,
    getLeavesByStudent,
    getPendingApprovals,
    isLoading
  }}>{children}</LeaveContext.Provider>;
}
function useLeave() {
  const context = useContext(LeaveContext);
  if (context === void 0) {
    throw new Error("useLeave must be used within a LeaveProvider");
  }
  return context;
}
export {
  LeaveProvider,
  useLeave
};
