# 📋 Project Structure Overview

## Complete Folder Structure

```
Multi-Tenant SaaS APP/
│
├── backend/                          # Node.js + Express + Prisma API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Prisma client singleton
│   │   │   └── env.js               # Environment config & validation
│   │   │
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Global error handling
│   │   │   └── tenantContext.js     # Multi-tenant context extraction
│   │   │
│   │   ├── modules/
│   │   │   └── organizations/
│   │   │       ├── organization.routes.js      # API routes
│   │   │       ├── organization.controller.js  # Request handlers
│   │   │       ├── organization.service.js     # Business logic
│   │   │       └── organization.repository.js  # Data access layer
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js            # Winston logger
│   │   │   └── response.js          # Standardized API responses
│   │   │
│   │   └── app.js                   # Express app setup
│   │
│   ├── prisma/
│   │   └── schema.prisma            # Database schema (PostgreSQL)
│   │
│   ├── server.js                    # Entry point
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment template
│   └── README.md                    # Backend documentation
│
├── frontend/                         # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/              # Reusable UI components (to be created)
│   │   ├── pages/                   # Page components (to be created)
│   │   ├── hooks/                   # Custom React hooks (to be created)
│   │   ├── services/                # API service layer (to be created)
│   │   ├── context/                 # React Context providers (to be created)
│   │   ├── types/                   # TypeScript types (to be created)
│   │   ├── utils/                   # Utility functions (to be created)
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # Entry point
│   │
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML template
│   ├── package.json                 # Dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript config
│   ├── .env.example                 # Environment template
│   └── README.md                    # Frontend documentation
│
├── .gitignore                       # Git ignore rules
└── README.md                        # Main project documentation
```

## 🏗️ Architecture Layers

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Request                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ROUTES (organization.routes.js)                        │
│  - Define API endpoints                                 │
│  - Map HTTP methods to controllers                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  CONTROLLERS (organization.controller.js)               │
│  - Handle HTTP requests/responses                       │
│  - Input validation                                     │
│  - Delegate to services                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  SERVICES (organization.service.js)                     │
│  - Business logic                                       │
│  - Data validation                                      │
│  - Orchestration                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  REPOSITORIES (organization.repository.js)              │
│  - Data access layer                                    │
│  - Prisma queries                                       │
│  - Database operations                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL via Prisma)                       │
│  - Organizations table                                  │
│  - Users table                                          │
│  - Multi-tenant data isolation                          │
└─────────────────────────────────────────────────────────┘
```

### Multi-Tenancy Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User Authentication                                 │
│     - User logs in with email/password                  │
│     - Backend validates credentials                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. JWT Token Generation                                │
│     - Create JWT with payload:                          │
│       {                                                 │
│         userId: "user-123",                             │
│         organizationId: "org-456",  ← Tenant ID         │
│         role: "admin"                                   │
│       }                                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Client Stores Token                                 │
│     - Frontend stores JWT in localStorage               │
│     - Includes in Authorization header for all requests │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. Tenant Context Middleware                           │
│     - Extract organizationId from JWT                   │
│     - Attach to req.tenantId                            │
│     - Validate organization is active                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  5. Data Isolation                                      │
│     - All queries filtered by organizationId            │
│     - Example:                                          │
│       prisma.user.findMany({                            │
│         where: { organizationId: req.tenantId }         │
│       })                                                │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Security Layers

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - DDoS protection
4. **JWT** - Authentication (to be implemented)
5. **Prisma** - SQL injection protection
6. **Environment Variables** - Secrets management

## 📊 Database Schema

```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  domain VARCHAR UNIQUE,
  plan VARCHAR DEFAULT 'free',
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (Multi-tenant)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'member',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_status ON organizations(status);
```

## 🚀 Development Workflow

### 1. Backend Development
```bash
cd backend
npm run dev              # Start server on :5000
npm run prisma:studio    # Open database GUI
```

### 2. Frontend Development
```bash
cd frontend
npm run dev              # Start Vite on :5173
```

### 3. Database Management
```bash
cd backend
npm run prisma:migrate   # Run migrations
npm run prisma:generate  # Generate Prisma client
```

## 📝 File Naming Conventions

### Backend
- **Routes**: `[feature].routes.js`
- **Controllers**: `[feature].controller.js`
- **Services**: `[feature].service.js`
- **Repositories**: `[feature].repository.js`
- **Middleware**: `[name].js`
- **Utils**: `[name].js`

### Frontend
- **Components**: `PascalCase.tsx` (e.g., `Button.tsx`)
- **Pages**: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- **Hooks**: `use[Name].ts` (e.g., `useAuth.ts`)
- **Services**: `[name].service.ts` (e.g., `api.service.ts`)
- **Types**: `[name].types.ts` (e.g., `user.types.ts`)

## 🎯 Next Development Steps

### Phase 1: Authentication (Backend)
1. Create auth module
2. Implement JWT generation/validation
3. Add password hashing (bcrypt)
4. Create login/register endpoints

### Phase 2: Authentication (Frontend)
1. Create login/register pages
2. Implement auth context
3. Add protected routes
4. Create auth service layer

### Phase 3: Core Features
1. User management
2. Organization settings
3. Role-based access control
4. Dashboard UI

### Phase 4: Advanced Features
1. Subscription management
2. Billing integration
3. Webhooks
4. Audit logs
5. Email notifications

## 📚 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend Runtime | Node.js | JavaScript runtime |
| Backend Framework | Express.js | Web framework |
| Database | PostgreSQL | Relational database |
| ORM | Prisma | Type-safe database access |
| Frontend Framework | React 19 | UI library |
| Frontend Language | TypeScript | Type safety |
| Build Tool | Vite | Fast dev server & bundler |
| Authentication | JWT | Stateless auth |
| Logging | Winston | Structured logging |
| Security | Helmet.js | HTTP headers |

---

**This structure is designed for scalability, maintainability, and production readiness.**
