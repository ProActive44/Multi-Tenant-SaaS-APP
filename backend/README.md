# Backend - Multi-Tenant SaaS API

Production-grade Multi-Tenant SaaS backend built with Node.js, Express, and Prisma.

## 🏗️ Architecture

### Multi-Tenancy Strategy
- **Pattern**: Single database, shared schema
- **Isolation**: Organization-based (`organizationId` foreign key)
- **Tenant Context**: Extracted from JWT and enforced via middleware (`req.tenantId`)
- **Data Isolation**: All queries filtered by `organizationId`

### Layered Architecture
```
Routes → Controllers → Services → Repositories → Database
```

## 🌐 Live API

Base URL: [https://multi-tenant-saas-app-koqw.onrender.com/api](https://multi-tenant-saas-app-koqw.onrender.com/api)

> ⚠️ **Note:** Deployed on a free Render instance. May take **1-2 minutes** to wake up from inactivity.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration (database, env)
│   ├── middleware/          # Express middleware (auth, tenant, errors)
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication (Login, Register)
│   │   ├── organizations/   # Organization management
│   │   ├── super-admin/     # Super Admin features
│   │   ├── tasks/           # Task management
│   │   └── users/           # User management
│   ├── utils/               # Utilities (logger, response helpers)
│   └── app.js               # Express app setup
├── prisma/
│   └── schema.prisma        # Database schema
└── server.js                # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
Create a `.env` file:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/dbname"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 // 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Super Admin Configuration
SUPER_ADMIN_EMAIL="superadmin@gmail.com"
SUPER_ADMIN_PASSWORD="super@123"
```

3. **Setup database**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## �️ API Endpoints

### Authentication
- `POST /api/auth/register` - Organization User Registration
- `POST /api/auth/login` - Organization User Login
- `GET /api/auth/me` - Get Current User Profile

### Super Admin Authentication
- `POST /api/super-admin/auth/login` - Super Admin Login
- `GET /api/super-admin/auth/me` - Get Super Admin Profile

### Super Admin Organization Management
- `POST /api/super-admin/organizations` - Create Organization
- `GET /api/super-admin/organizations` - List Organizations
- `GET /api/super-admin/organizations/:id` - Get Organization Details
- `PATCH /api/super-admin/organizations/:id` - Update Organization
- `PATCH /api/super-admin/organizations/:id/enable` - Enable Organization
- `PATCH /api/super-admin/organizations/:id/disable` - Disable Organization
- `DELETE /api/super-admin/organizations/:id` - Delete Organization

### Tasks (Organization Portal)
- `POST /api/tasks` - Create Task
- `GET /api/tasks` - List Tasks
- `GET /api/tasks/:id` - Get Task Details
- `PATCH /api/tasks/:id` - Update Task
- `DELETE /api/tasks/:id` - Delete Task

### Users (Organization Portal)
- `GET /api/users` - List Users
- `POST /api/users` - Create User
- `GET /api/users/:id` - Get User Details
- `PATCH /api/users/:id` - Update User
- `DELETE /api/users/:id` - Delete User
- `PATCH /api/users/:id/status` - Toggle User Status
- `GET /api/users/me` - Get Current User Profile

## 🔐 Multi-Tenancy Implementation

All queries are automatically scoped to the authenticated user's organization via middleware:

```javascript
// Middleware extracts tenantId from JWT
const organizationId = req.tenantId;

// Repository uses it for scoping
return await prisma.task.findMany({
  where: { organizationId }
});
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configured for frontend access
- **Rate Limiting**: Brute-force protection
- **JWT Authentication**: Secure stateless sessions
- **RBAC**: Role-Based Access Control (Super Admin, Owner, Admin, Member)
- **Input Validation**: Request body validation

## 👥 Roles & Permissions

| Role | Scope | Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | Global | Manage Organizations, Create Org Admins |
| **Org Owner** | Tenant | Full control over Org Users & Tasks |
| **Org Admin** | Tenant | Manage Users, Create/Edit/Assign Tasks |
| **Org Member** | Tenant | View Assigned Tasks, Update Status |
