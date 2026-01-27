# Multi-Tenant SaaS Application

Production-grade Multi-Tenant SaaS application with modern frontend and scalable backend.

## 🏗️ Architecture Overview

This is a **monorepo** containing both frontend and backend:

```
Multi-Tenant SaaS APP/
├── frontend/          # React/Next.js frontend
├── backend/           # Node.js + Express + Prisma API
└── README.md          # This file
```

### Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT Authentication
- Multi-tenant architecture (org-based isolation)

**Frontend:**
- React (to be implemented)
- Modern UI/UX
- Responsive design
- State management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and navigate to project**
```bash
cd "Multi-Tenant SaaS APP"
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend runs on `http://localhost:5000`

3. **Setup Frontend** (coming soon)
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

### Backend (`/backend`)
```
backend/
├── src/
│   ├── config/              # Database, environment config
│   ├── middleware/          # Auth, tenant context, error handling
│   ├── modules/             # Feature modules (organizations, users)
│   ├── utils/               # Logger, response helpers
│   └── app.js               # Express app
├── prisma/
│   └── schema.prisma        # Database schema
└── server.js                # Entry point
```

### Frontend (`/frontend`)
Coming soon - Modern React application with:
- Authentication UI
- Organization management
- User dashboard
- Responsive design

## 🔐 Multi-Tenancy Architecture

### How It Works

1. **Organization-based isolation**: Each tenant = one organization
2. **Single database, shared schema**: Cost-effective and scalable
3. **Row-level security**: All queries filtered by `organizationId`
4. **JWT-based context**: Tenant ID embedded in authentication token

### Data Isolation

```javascript
// Every user belongs to an organization
User {
  id: "user-123"
  email: "john@acme.com"
  organizationId: "org-456"  // ← Tenant isolation
}

// All queries are scoped
const users = await prisma.user.findMany({
  where: { organizationId: req.tenantId }  // ← Automatic filtering
});
```

## 🛣️ API Endpoints

Base URL: `http://localhost:5000/api`

### Organizations
- `POST /organizations` - Create organization
- `GET /organizations` - List all (paginated)
- `GET /organizations/:id` - Get by ID
- `PATCH /organizations/:id` - Update
- `DELETE /organizations/:id` - Delete
- `PATCH /organizations/:id/plan` - Update subscription
- `PATCH /organizations/:id/suspend` - Suspend
- `PATCH /organizations/:id/activate` - Activate

### Health Check
- `GET /health` - Server status

## 🔧 Development Scripts

### Backend
```bash
cd backend
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations
```

### Frontend (coming soon)
```bash
cd frontend
npm run dev              # Start dev server
npm run build            # Production build
```

## 📝 Development Roadmap

### ✅ Phase 1: Backend Foundation (Current)
- [x] Project structure
- [x] Express + Prisma setup
- [x] Organization CRUD
- [x] Multi-tenant architecture
- [x] Error handling & logging

### 🚧 Phase 2: Authentication (Next)
- [ ] User registration/login
- [ ] JWT implementation
- [ ] Password hashing
- [ ] Refresh tokens

### 📋 Phase 3: Frontend
- [ ] React setup
- [ ] Authentication UI
- [ ] Organization dashboard
- [ ] User management

### 🎯 Phase 4: Advanced Features
- [ ] Role-based access control (RBAC)
- [ ] Subscription management
- [ ] Billing integration
- [ ] Webhooks & events
- [ ] Audit logs

## 🔒 Security Features

- Helmet.js security headers
- CORS configuration
- Rate limiting
- Environment variable validation
- SQL injection protection (Prisma)
- XSS protection

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- Frontend Documentation (coming soon)

## 🤝 Contributing

This is a production-grade template. Feel free to:
1. Add new features
2. Improve security
3. Enhance performance
4. Add tests

## 📄 License

ISC

---

**Built with ❤️ for scalable SaaS applications**
