import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, closeDB } from "./db/connection.js";
import usersRouter from "./routes/users.js";
import leavesRouter from "./routes/leaves.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Resolve paths relative to server dir (ESM __dirname equivalent)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");
const distPath = path.resolve(__dirname, "../../dist");

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeMap = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".txt": "text/plain; charset=utf-8"
  };
  return mimeMap[ext] || "application/octet-stream";
}

app.use(cors());
app.use(express.json());

// API routes (before static middleware)
app.use("/api/users", usersRouter);
app.use("/api/leaves", leavesRouter);

// Document viewing endpoint
app.get("/uploads/view/:file", (req, res) => {
  const safeFileName = path.basename(req.params.file);
  const filePath = path.join(uploadsDir, safeFileName);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.setHeader("Content-Type", getMimeType(safeFileName));
  res.setHeader("Content-Disposition", `inline; filename="${safeFileName}"`);
  res.sendFile(filePath);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve frontend build files BEFORE wildcard routes (static files must come before * catch-all)
app.use(express.static(distPath));

// Fallback to index.html for SPA routing (must be last)
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: "Frontend not built. Run: npm run build" });
  }
});
async function isBackendAlreadyRunning(port) {
  try {
    const response = await fetch(`http://localhost:${port}/health`);
    if (!response.ok) {
      return false;
    }
    const payload = await response.json();
    return payload?.status === "ok";
  } catch {
    return false;
  }
}

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.log("\u2139 DB not available, using mock data");
  }

  const server = app.listen(PORT, () => {
    console.log(`\u2713 Server running on http://localhost:${PORT}`);
  });

  server.on("error", async (error) => {
    if (error?.code !== "EADDRINUSE") {
      throw error;
    }

    const alreadyRunning = await isBackendAlreadyRunning(PORT);
    if (alreadyRunning) {
      console.log(`\u2139 Backend already running on http://localhost:${PORT}`);
      process.exit(0);
    }

    console.error(`\u2717 Port ${PORT} is already in use by another process.`);
    process.exit(1);
  });
}
start();
process.on("SIGTERM", async () => {
  await closeDB();
  process.exit(0);
});
