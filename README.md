# Multi-Tenant SaaS Application

A robust SaaS-style application featuring distinct Super Admin and Organization portals. Built with a focus on tenant isolation, role-based access control (RBAC), and secure task management.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Frontend:** React, TypeScript, Tailwind CSS
- **Authentication:** JWT, BCrypt

## ✨ Key Features

- **Dual Portal System:**
  - **Super Admin Portal:** Manage organizations and global admins.
  - **Organization Portal:** Tenant-specific workspace for task management.
- **Multi-Tenancy:** Strict data isolation using `organizationId`.
- **Task Management:** Multi-assignee support, status workflows, and priority levels.
- **User Management:** Comprehensive tools for managing organization members.

## 🔐 Authentication & Authorization

The system employs a secure, multi-layered security architecture:

- **Portal Separation:** Distinct login flows for Super Admins and Organization Users ensure strict access boundaries.
- **JWT Authentication:** Stateless, secure session management using JSON Web Tokens.
- **Role-Based Access Control (RBAC):** Granular permissions enforce what Super Admins, Org Owners, Admins, and Members can do.
- **Tenant Enforcement:** Middleware automatically validates tenant context on every request, preventing cross-organization data access.

## 👥 Roles Overview

| Role | Scope | Key Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | Global | Manage Organizations, Create Org Admins |
| **Org Owner** | Tenant | Full control over Org Users & Tasks |
| **Org Admin** | Tenant | Manage Users, Create/Edit/Assign Tasks (Manager) |
| **Org Member** | Tenant | View Assigned Tasks, Update Status |

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="24h"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL="http://localhost:5000/api"
```

## 🚀 Setup Instructions

### Backend Setup
1. Navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Set up environment variables (see above).
4. Run migrations: `npx prisma migrate dev`
5. Start server: `npm run dev`

### Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`



## 📌 Assumptions & Design Decisions

- Super Admins are restricted to organization management only and have no access to organization-level users or tasks to ensure strict tenant isolation.
- Each user belongs to exactly one organization.
- Organization ownership is assigned during organization creation.
- Email notifications are mocked for demo purposes, which is permitted by the requirements.


## 📋 Task Management Rules

- Tasks can be assigned only to users within the same organization.
- Only the task creator or assigned users can close a task.
- Only the task creator can reopen or edit a completed task.
- All task rules are enforced at the API level.


## ✅ Assessment Alignment

This application fulfills all mandatory requirements of the MERN Multi-Tenant SaaS assessment, including strict portal separation, tenant isolation, RBAC, and task business rules.



## 🧪 Demo Credentials
These credentials are for local testing and demonstration purposes only.

### Super Admin
- Email: superadmin@gmail.com
- Password: super@123

### Organization Admin
- Email: sundar@gmail.com
- Password: sundar@123

### Organization Member
- Email: Ruth@gmail.com
- Password: ruth@123
