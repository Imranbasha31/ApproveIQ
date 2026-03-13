import { Router } from "express";
import { getPool } from "../db/connection.js";
import { authMiddleware } from "../middleware/auth.js";
import { z } from "zod";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || "").toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
const router = Router();
const CreateLeaveSchema = z.object({
  leave_type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string()
});
const mockLeaves = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    student_id: "550e8400-e29b-41d4-a716-446655440001",
    student_name: "Alice Johnson",
    department: "Computer Science",
    leave_type: "medical",
    start_date: "2026-03-15",
    end_date: "2026-03-17",
    reason: "Medical appointment",
    status: "pending",
    current_stage: 1,
    created_at: "2026-03-08T10:00:00Z",
    updated_at: "2026-03-08T10:00:00Z"
  }
];
router.get("/export/csv", authMiddleware, async (req, res) => {
  if (req.user?.role !== "admin" && req.user?.role !== "principal") {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT lr.id, u.name as student_name, lr.leave_type, lr.start_date, lr.end_date,
             lr.reason, lr.status, lr.current_stage, lr.created_at
      FROM LeaveRequests lr
      JOIN Users u ON lr.student_id = u.id
      ORDER BY lr.created_at DESC
    `);
    const rows = result.recordset;
    const csvHeader = "ID,Student Name,Leave Type,Start Date,End Date,Reason,Status,Stage,Created At";
    const csvRows = rows.map(
      (r) => [
        r.id,
        `"${(r.student_name || "").replace(/"/g, '""')}"`,
        r.leave_type,
        r.start_date,
        r.end_date,
        `"${(r.reason || "").replace(/"/g, '""')}"`,
        r.status,
        r.current_stage,
        r.created_at
      ].join(",")
    );
    const csv = [csvHeader, ...csvRows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leave_requests.csv");
    res.send(csv);
  } catch (error) {
    const csvHeader = "ID,Student Name,Leave Type,Start Date,End Date,Reason,Status,Stage,Created At";
    const csvRows = mockLeaves.map(
      (r) => [
        r.id,
        `"${(r.student_name || "").replace(/"/g, '""')}"`,
        r.leave_type,
        r.start_date,
        r.end_date,
        `"${(r.reason || "").replace(/"/g, '""')}"`,
        r.status,
        r.current_stage,
        r.created_at
      ].join(",")
    );
    const csv = [csvHeader, ...csvRows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leave_requests.csv");
    res.send(csv);
  }
});
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    if (req.user?.role === "student") {
      const result = await pool.request().input("userId", req.user.id).query(`
          SELECT lr.*, u.name as student_name, u.department as department
          FROM LeaveRequests lr
          JOIN Users u ON lr.student_id = u.id
          WHERE lr.student_id = @userId
          ORDER BY lr.created_at DESC
        `);
      res.json(result.recordset);
    } else if (req.user?.role === "hod") {
      const result = await pool.request().input("userId", req.user.id).query(`
        SELECT lr.*, u.name as student_name, u.department as department
        FROM LeaveRequests lr
        JOIN Users u ON lr.student_id = u.id
        WHERE LOWER(ISNULL(u.department, '')) = LOWER(ISNULL((
          SELECT TOP 1 department FROM Users WHERE id = @userId
        ), ''))
        ORDER BY lr.created_at DESC
      `);
      res.json(result.recordset);
    } else {
      const result = await pool.request().query(`
        SELECT lr.*, u.name as student_name, u.department as department
        FROM LeaveRequests lr
        JOIN Users u ON lr.student_id = u.id
        ORDER BY lr.created_at DESC
      `);
      res.json(result.recordset);
    }
  } catch (error) {
    console.log("DB unavailable, using mock leaves");
    if (req.user?.role === "student") {
      const filtered = mockLeaves.filter((l) => l.student_id === req.user?.id);
      res.json(filtered);
    } else if (req.user?.role === "hod") {
      const filtered = mockLeaves.filter(
        (l) => String(l.department || "").toLowerCase() === String(req.user?.department || "").toLowerCase()
      );
      res.json(filtered);
    } else {
      res.json(mockLeaves);
    }
  }
});
router.post("/", authMiddleware, upload.single("proof_file"), async (req, res) => {
  const payload = {
    leave_type: req.body?.leave_type,
    start_date: req.body?.start_date,
    end_date: req.body?.end_date,
    reason: req.body?.reason
  };

  try {
    const data = CreateLeaveSchema.parse(payload);
    const pool = getPool();

    await pool.request().input("student_id", req.user?.id).input("leave_type", data.leave_type).input("start_date", data.start_date).input("end_date", data.end_date).input("reason", data.reason).input("proof_file", req.file?.filename || null).query(`
        INSERT INTO LeaveRequests (student_id, leave_type, start_date, end_date, reason, proof_file, status)
        VALUES (@student_id, @leave_type, @start_date, @end_date, @reason, @proof_file, 'pending')
      `);

    res.status(201).json({ message: "Leave request created successfully" });
  } catch (error) {
    console.error("Leave creation error:", error?.message || String(error));
    try {
      const data = CreateLeaveSchema.parse(payload);
      const newLeave = {
        id: Math.random().toString(36).substr(2, 9),
        student_id: req.user?.id,
        student_name: req.user?.name,
        leave_type: data.leave_type,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        proof_file: req.file?.filename,
        status: "pending",
        current_stage: 1,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      mockLeaves.push(newLeave);
      console.log("Leave created with mock data:", newLeave);
      res.status(201).json({ message: "Leave request created successfully (mock)", id: newLeave.id });
    } catch (validationError) {
      console.error("Validation error:", validationError?.message || String(validationError));
      res.status(400).json({ error: "Invalid request data. Please check your inputs." });
    }
  }
});
router.put("/:id/approve", authMiddleware, async (req, res) => {
  try {
    const { status, current_stage, comments } = req.body;
    const pool = getPool();
    await pool.request().input("id", req.params.id).input("status", status).input("current_stage", current_stage || 1).input("updated_at", /* @__PURE__ */ new Date()).query(
      "UPDATE LeaveRequests SET status = @status, current_stage = @current_stage, updated_at = @updated_at WHERE id = @id"
    );
    res.json({ message: "Leave request updated successfully" });
  } catch (error) {
    const leave = mockLeaves.find((l) => l.id === req.params.id);
    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }
    leave.status = req.body.status;
    leave.current_stage = req.body.current_stage || leave.current_stage;
    leave.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    console.log("Leave updated (mock):", leave);
    res.json({ message: "Leave request updated successfully (mock)" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
