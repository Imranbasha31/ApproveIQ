import { Router } from "express";
import { getPool } from "../db/connection.js";
import { authMiddleware } from "../middleware/auth.js";
const router = Router();
const MOCK_USERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "student1",
    name: "Alice Johnson",
    email: "alice@college.edu",
    department: "Computer Science",
    role: "student"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    username: "advisor1",
    name: "Prof. Smith",
    email: "smith@college.edu",
    department: "Computer Science",
    role: "advisor"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    username: "hod1",
    name: "Dr. Brown",
    email: "brown@college.edu",
    department: "Computer Science",
    role: "hod"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    username: "principal1",
    name: "Principal Lee",
    email: "lee@college.edu",
    department: "Administration",
    role: "principal"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    username: "admin",
    name: "System Administrator",
    email: "bashaimran021@gmail.com",
    department: "IT Administration",
    role: "admin"
  }
];

const MOCK_CREDENTIALS = {
  "alice@college.edu": "password",
  "smith@college.edu": "password",
  "brown@college.edu": "password",
  "lee@college.edu": "password",
  "bashaimran021@gmail.com": "12345678"
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const pool = getPool();

    // SQL Server validates column names at parse time, so pick an existing credential column first.
    const columnsResult = await pool.request().query(`
      SELECT name
      FROM sys.columns
      WHERE object_id = OBJECT_ID('Users')
        AND name IN ('password', 'password_hash')
    `);

    const colNames = new Set((columnsResult.recordset || []).map((row) => String(row.name).toLowerCase()));
    const credentialColumn = colNames.has("password")
      ? "[password]"
      : colNames.has("password_hash")
        ? "[password_hash]"
        : null;

    if (!credentialColumn) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const query = `
      SELECT TOP 1 id, username, name, email, department, role
      FROM Users
      WHERE LOWER(email) = LOWER(@email)
        AND CAST(${credentialColumn} AS NVARCHAR(255)) = @password
    `;

    const result = await pool.request().input("email", email).input("password", password).query(query);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json(result.recordset[0]);
  } catch (error) {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!found || MOCK_CREDENTIALS[found.email.toLowerCase()] !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.json(found);
  }
});

router.get("/me", authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json(req.user);
});
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(
      "SELECT id, username, name, email, department, role FROM Users"
    );
    res.json(result.recordset);
  } catch (error) {
    console.log("DB unavailable, using mock users");
    res.json(MOCK_USERS);
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { username, name, email, department, role, password } = req.body || {};

  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: "name, email, role, and password are required" });
  }

  const normalizedUsername = (username || String(email).split("@")[0] || "").trim();
  if (!normalizedUsername) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    const pool = getPool();
    const existing = await pool.request().input("username", normalizedUsername).query(
      "SELECT TOP 1 id FROM Users WHERE LOWER(username) = LOWER(@username)"
    );

    if (existing.recordset?.length) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const result = await pool.request()
      .input("username", normalizedUsername)
      .input("name", name)
      .input("email", email)
      .input("department", department || "")
      .input("role", role)
      .input("password", password)
      .query(`
        INSERT INTO Users (username, name, email, department, role, [password])
        OUTPUT inserted.id, inserted.username, inserted.name, inserted.email, inserted.department, inserted.role
        VALUES (@username, @name, @email, @department, @role, @password)
      `);

    return res.status(201).json(result.recordset[0]);
  } catch (error) {
    const duplicate = MOCK_USERS.some(
      (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase() || u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ error: "User with same username/email already exists" });
    }

    const created = {
      id: `mock-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      username: normalizedUsername,
      name,
      email,
      department: department || "",
      role
    };
    MOCK_USERS.push(created);
    MOCK_CREDENTIALS[String(email).toLowerCase()] = String(password);
    return res.status(201).json(created);
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, department, role, password } = req.body || {};

  if (!name || !email || !role) {
    return res.status(400).json({ error: "name, email, and role are required" });
  }

  try {
    const pool = getPool();
    const hasPassword = typeof password === "string" && password.length > 0;
    const request = pool.request()
      .input("id", id)
      .input("name", name)
      .input("email", email)
      .input("department", department || "")
      .input("role", role);

    if (hasPassword) {
      request.input("password", password);
    }

    const result = await request.query(`
      UPDATE Users
      SET name = @name,
          email = @email,
          department = @department,
          role = @role,
          ${hasPassword ? "[password] = @password," : ""}
          updated_at = GETUTCDATE()
      OUTPUT inserted.id, inserted.username, inserted.name, inserted.email, inserted.department, inserted.role
      WHERE id = @id
    `);

    if (!result.recordset?.length) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(result.recordset[0]);
  } catch (error) {
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    MOCK_USERS[idx] = {
      ...MOCK_USERS[idx],
      name,
      email,
      department: department || "",
      role
    };

    if (typeof password === "string" && password.length > 0) {
      MOCK_CREDENTIALS[String(email).toLowerCase()] = password;
    }

    return res.json(MOCK_USERS[idx]);
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = getPool();
    const existing = await pool.request().input("id", id).query(
      "SELECT TOP 1 id FROM Users WHERE id = @id"
    );

    if (!existing.recordset?.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete dependent rows first to satisfy foreign keys in LeaveApprovals/LeaveRequests.
    await pool.request().input("id", id).query(`
      DELETE FROM LeaveApprovals
      WHERE approver_id = @id
         OR leave_request_id IN (
           SELECT id FROM LeaveRequests WHERE student_id = @id
         )
    `);

    await pool.request().input("id", id).query(
      "DELETE FROM LeaveRequests WHERE student_id = @id"
    );

    await pool.request().input("id", id).query(
      "DELETE FROM Users WHERE id = @id"
    );

    return res.json({ success: true });
  } catch (error) {
    if (error?.number === 547) {
      return res.status(409).json({ error: "Cannot delete user due to related records" });
    }

    if (error?.message && !String(error.message).includes("Database not connected")) {
      return res.status(500).json({ error: "Failed to delete user" });
    }

    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    MOCK_USERS.splice(idx, 1);
    return res.json({ success: true });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
