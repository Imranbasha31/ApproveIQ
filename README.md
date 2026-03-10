# ApproveIQ — Digital Leave Approval System

A full-stack leave management system with a multi-stage approval workflow (Student → Class Advisor → HOD → Principal). Built with React, Express, and SQL Server.

## Features

- **Multi-role authentication** — Student, Class Advisor, HOD, Principal, Admin
- **3-stage approval workflow** — Leave requests progress through Advisor → HOD → Principal
- **Admin dashboard** — Full user management (add, edit, delete users)
- **Real-time status tracking** — Students can view leave status and approval progress
- **Role-based views** — Each role sees only relevant pending approvals
- **Dark/Light theme** — Toggle between themes

## Tech Stack

| Layer     | Technology                                      |
|-----------|------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, TailwindCSS, ShadCN/UI |
| Backend   | Node.js, Express                                |
| Database  | SQL Server (Windows Authentication via msnodesqlv8) |
| State     | React Context, TanStack Query                   |
| Mobile    | Capacitor (Android/iOS ready)                   |

## Project Structure

```
├── src/                    # Frontend source
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Auth & Leave state management
│   ├── pages/              # Route pages (Dashboard, Login, Approvals, etc.)
│   ├── services/           # API client
│   └── types/              # TypeScript types
├── server/                 # Backend source
│   ├── src/
│   │   ├── index.js        # Express server entry point
│   │   ├── db/             # SQL Server connection
│   │   ├── middleware/      # Auth middleware
│   │   └── routes/         # API routes (users, leaves)
│   └── data/               # Fallback mock data
└── supabase/               # Migration scripts
```

## Prerequisites

- **Node.js** v18+
- **SQL Server** (any edition) with Windows Authentication enabled
- **SQL Server instance** configured and running

## Database Setup

1. Create a database named `LeaveApprovalDB` in SQL Server:

```sql
CREATE DATABASE LeaveApprovalDB;
```

2. Create the required tables:

```sql
USE LeaveApprovalDB;

CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    username NVARCHAR(100) NOT NULL UNIQUE,
    name NVARCHAR(200) NOT NULL,
    email NVARCHAR(200),
    department NVARCHAR(100),
    role NVARCHAR(50),
    password NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE LeaveRequests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL REFERENCES Users(id),
    leave_type NVARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'pending',
    current_stage INT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE LeaveApprovals (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    leave_request_id UNIQUEIDENTIFIER REFERENCES LeaveRequests(id),
    stage INT NOT NULL,
    approver_id UNIQUEIDENTIFIER REFERENCES Users(id),
    status NVARCHAR(20),
    comments NVARCHAR(MAX),
    timestamp DATETIME DEFAULT GETDATE()
);
```

3. Seed default users:

```sql
INSERT INTO Users (id, username, name, email, department, role, password) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'student1', 'Alice Johnson', 'alice@college.edu', 'Computer Science', 'student', 'password'),
('550e8400-e29b-41d4-a716-446655440002', 'advisor1', 'Prof. Smith', 'smith@college.edu', 'Computer Science', 'advisor', 'password'),
('550e8400-e29b-41d4-a716-446655440003', 'hod1', 'Dr. Brown', 'brown@college.edu', 'Computer Science', 'hod', 'password'),
('550e8400-e29b-41d4-a716-446655440004', 'principal1', 'Principal Lee', 'lee@college.edu', 'Administration', 'principal', 'password'),
('550e8400-e29b-41d4-a716-446655440005', 'admin', 'System Administrator', 'admin@college.edu', 'IT Administration', 'admin', 'admin123');
```

4. Update the server connection in `server/src/db/connection.js` with your SQL Server instance name:

```js
const config = {
  server: 'YOUR_MACHINE\\YOUR_INSTANCE',
  database: 'LeaveApprovalDB',
  // ...
};
```

## Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

## Running the Application

```bash
# Terminal 1 — Start backend (port 3001)
cd server
npm run dev

# Terminal 2 — Start frontend (port 8080)
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## API Endpoints

| Method | Endpoint                    | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | `/api/users/login`          | Authenticate user        | Public   |
| GET    | `/api/users`                | List all users           | Required |
| POST   | `/api/users`                | Create user              | Admin    |
| PUT    | `/api/users/:id`            | Update user              | Admin    |
| DELETE | `/api/users/:id`            | Delete user              | Admin    |
| GET    | `/api/leaves`               | Get leave requests       | Required |
| POST   | `/api/leaves`               | Submit leave request     | Required |
| PUT    | `/api/leaves/:id/approve`   | Approve/reject leave     | Required |

## Approval Workflow

```
Student submits leave
        ↓
  Stage 1: Class Advisor
    ├── Approve → Stage 2
    └── Reject  → Done
        ↓
  Stage 2: HOD
    ├── Approve → Stage 3
    └── Reject  → Done
        ↓
  Stage 3: Principal
    ├── Approve → Fully Approved
    └── Reject  → Done
```

## Default Login Credentials

| Role      | Email              | Password   |
|-----------|--------------------|------------|
| Student   | alice@college.edu  | password   |
| Advisor   | smith@college.edu  | password   |
| HOD       | brown@college.edu  | password   |
| Principal | lee@college.edu    | password   |
| Admin     | admin@college.edu  | admin123   |

## License

MIT
