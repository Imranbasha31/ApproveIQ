-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LeaveApprovalDB')
BEGIN
  CREATE DATABASE LeaveApprovalDB;
END
GO

USE LeaveApprovalDB;
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
BEGIN
  CREATE TABLE Users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    username NVARCHAR(100) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    department NVARCHAR(100),
    role NVARCHAR(50) DEFAULT 'student',
    created_at DATETIME DEFAULT GETUTCDATE(),
    updated_at DATETIME DEFAULT GETUTCDATE()
  );
END
GO

-- Create LeaveRequests table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'LeaveRequests' AND xtype = 'U')
BEGIN
  CREATE TABLE LeaveRequests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL,
    leave_type NVARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETUTCDATE(),
    updated_at DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (student_id) REFERENCES Users(id)
  );
END
GO

-- Create LeaveApprovals table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'LeaveApprovals' AND xtype = 'U')
BEGIN
  CREATE TABLE LeaveApprovals (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    leave_request_id UNIQUEIDENTIFIER NOT NULL,
    stage INT NOT NULL,
    approver_id UNIQUEIDENTIFIER NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending',
    comments NVARCHAR(MAX),
    timestamp DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (leave_request_id) REFERENCES LeaveRequests(id),
    FOREIGN KEY (approver_id) REFERENCES Users(id)
  );
END
GO

-- Insert sample data
IF NOT EXISTS (SELECT * FROM Users WHERE username = 'student1')
BEGIN
  INSERT INTO Users (username, name, email, department, role)
  VALUES 
    ('student1', 'Alice Johnson', 'alice@college.edu', 'Computer Science', 'student'),
    ('advisor1', 'Prof. Smith', 'smith@college.edu', 'Computer Science', 'advisor'),
    ('hod1', 'Dr. Brown', 'brown@college.edu', 'Computer Science', 'hod'),
    ('principal1', 'Principal Lee', 'lee@college.edu', 'Administration', 'principal');
END
GO
