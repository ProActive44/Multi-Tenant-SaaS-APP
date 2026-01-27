# Backend - Multi-Tenant SaaS API

Production-grade Multi-Tenant SaaS backend built with Node.js, Express, and Prisma.

## 🏗️ Architecture

### Multi-Tenancy Strategy
- **Pattern**: Single database, shared schema
- **Isolation**: Organization-based (org_id foreign key)
- **Tenant Context**: Extracted from JWT and enforced via middleware
- **Data Isolation**: All queries filtered by organizationId

### Layered Architecture
```
Routes → Controllers → Services → Repositories → Database
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration (database, env)
│   ├── middleware/          # Express middleware (auth, tenant, errors)
│   ├── modules/             # Feature modules
│   │   └── organizations/   # Organization module (CRUD)
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
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup database**
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. **Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 📊 Database Schema

### Organization Model
Represents a tenant in the system with subscription management.

### User Model
Users belonging to organizations with role-based access.

## 🛣️ API Endpoints

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations` - List organizations (paginated)
- `GET /api/organizations/:id` - Get organization
- `PATCH /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization
- `PATCH /api/organizations/:id/plan` - Update subscription plan
- `PATCH /api/organizations/:id/suspend` - Suspend organization
- `PATCH /api/organizations/:id/activate` - Activate organization

### Health Check
- `GET /health` - Server health status

## 🔧 Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

## 🔐 Multi-Tenancy Implementation

All queries are automatically scoped to the authenticated user's organization:

```javascript
// ✅ Tenant-scoped query
const users = await prisma.user.findMany({
  where: { organizationId: req.tenantId }
});
```

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT authentication (to be implemented)
- Input validation (to be enhanced)
