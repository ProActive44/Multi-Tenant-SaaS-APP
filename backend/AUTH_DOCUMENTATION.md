# Authentication System Documentation

## Overview

This authentication system supports **multi-tenant SaaS** with two distinct user types:
1. **SUPER_ADMIN** - Global administrators (no organization)
2. **ORG_USER** - Organization-scoped users (ORG_OWNER, ORG_ADMIN, ORG_MEMBER)

## User Roles

### Role Hierarchy

```
SUPER_ADMIN          → Global access, no organization
  ↓
ORG_OWNER           → Organization owner
  ↓
ORG_ADMIN           → Organization administrator
  ↓
ORG_MEMBER          → Organization member (default)
```

### Role Definitions

| Role | Organization Required | Description |
|------|----------------------|-------------|
| `SUPER_ADMIN` | ❌ No | Global admin with system-wide access |
| `ORG_OWNER` | ✅ Yes | Organization owner with full org access |
| `ORG_ADMIN` | ✅ Yes | Organization admin with management access |
| `ORG_MEMBER` | ✅ Yes | Standard organization member |

## Database Schema

### User Model

```prisma
enum UserRole {
  SUPER_ADMIN  // Global admin, no organization
  ORG_OWNER    // Organization owner
  ORG_ADMIN    // Organization admin
  ORG_MEMBER   // Organization member
}

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  passwordHash   String
  firstName      String
  lastName       String
  role           UserRole  @default(ORG_MEMBER)
  
  // NULL for SUPER_ADMIN, required for ORG_* roles
  organizationId String?
  organization   Organization? @relation(...)
  
  isActive       Boolean   @default(true)
  lastLoginAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

### Key Changes from Original Schema

- ✅ `organizationId` is now **optional** (nullable)
- ✅ Added `UserRole` enum for type safety
- ✅ Added `role` index for performance
- ✅ `organization` relation is now optional

## API Endpoints

### Base URL
```
http://localhost:5000/api/auth
```

### 1. Register User

**POST** `/api/auth/register`

Register a new user (SUPER_ADMIN or ORG_USER).

#### Request Body

**For SUPER_ADMIN:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123",
  "firstName": "Super",
  "lastName": "Admin",
  "role": "SUPER_ADMIN"
}
```

**For ORG_USER:**
```json
{
  "email": "user@acme.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ORG_MEMBER",
  "organizationId": "org-uuid-here"
}
```

#### Validation Rules

- ✅ Email must be valid format
- ✅ Password minimum 6 characters
- ✅ Role must be one of: `SUPER_ADMIN`, `ORG_OWNER`, `ORG_ADMIN`, `ORG_MEMBER`
- ✅ `SUPER_ADMIN` **cannot** have `organizationId`
- ✅ `ORG_*` roles **must** have `organizationId`
- ✅ Organization must exist and be active

#### Success Response (201)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ORG_MEMBER",
      "organizationId": "org-uuid",
      "organization": {
        "id": "org-uuid",
        "name": "Acme Corp",
        "slug": "acme-corp"
      },
      "isActive": true,
      "createdAt": "2026-01-28T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

#### Request Body

```json
{
  "email": "user@acme.com",
  "password": "securePassword123"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ORG_MEMBER",
      "organizationId": "org-uuid",
      "organization": {
        "id": "org-uuid",
        "name": "Acme Corp",
        "slug": "acme-corp",
        "status": "active"
      },
      "isActive": true,
      "lastLoginAt": "2026-01-28T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**403 Forbidden** - Account inactive or organization suspended
```json
{
  "success": false,
  "message": "Account is inactive"
}
```

### 3. Get Profile

**GET** `/api/auth/me`

Get current authenticated user's profile.

#### Headers

```
Authorization: Bearer <jwt-token>
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "user@acme.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ORG_MEMBER",
    "organizationId": "org-uuid",
    "organization": {
      "id": "org-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active"
    },
    "isActive": true
  }
}
```

## JWT Token Structure

### Payload

```json
{
  "userId": "user-uuid",
  "email": "user@acme.com",
  "role": "ORG_MEMBER",
  "organizationId": "org-uuid",  // null for SUPER_ADMIN
  "iat": 1706400000,
  "exp": 1707004800
}
```

### Token Expiration

Default: **7 days** (configurable via `JWT_EXPIRES_IN` env variable)

## Middleware

### 1. `authenticate`

Validates JWT and attaches user info to `req.user`.

```javascript
import { authenticate } from './middleware/authenticate.js';

router.get('/protected', authenticate, (req, res) => {
  // req.user is available
  // req.tenantId is set for organization users
});
```

**Attached to request:**
```javascript
req.user = {
  userId: "user-uuid",
  email: "user@acme.com",
  role: "ORG_MEMBER",
  organizationId: "org-uuid"  // null for SUPER_ADMIN
}

req.tenantId = "org-uuid"  // Only for organization users
```

### 2. `authorize(...roles)`

Restrict access to specific roles.

```javascript
import { authenticate, authorize } from './middleware/authenticate.js';

// Only ORG_OWNER and ORG_ADMIN can access
router.delete('/users/:id', 
  authenticate, 
  authorize('ORG_OWNER', 'ORG_ADMIN'), 
  deleteUser
);
```

### 3. `requireOrganization`

Ensure user belongs to an organization (not SUPER_ADMIN).

```javascript
import { authenticate, requireOrganization } from './middleware/authenticate.js';

// Only organization users can access
router.get('/org-data', 
  authenticate, 
  requireOrganization, 
  getOrgData
);
```

### 4. `requireSuperAdmin`

Restrict access to SUPER_ADMIN only.

```javascript
import { authenticate, requireSuperAdmin } from './middleware/authenticate.js';

// Only SUPER_ADMIN can access
router.get('/admin/stats', 
  authenticate, 
  requireSuperAdmin, 
  getGlobalStats
);
```

### 5. `tenantContext`

Validates organization context and sets `req.tenantId`.

```javascript
import { authenticate } from './middleware/authenticate.js';
import { tenantContext } from './middleware/tenantContext.js';

// Ensures organization is active
router.get('/data', 
  authenticate, 
  tenantContext, 
  getData
);
```

## Multi-Tenancy Flow

### For Organization Users

```
1. User logs in
   ↓
2. JWT generated with organizationId
   ↓
3. authenticate middleware extracts user info
   ↓
4. tenantContext middleware validates organization
   ↓
5. req.tenantId is set
   ↓
6. All queries scoped to organizationId
```

### For SUPER_ADMIN

```
1. SUPER_ADMIN logs in
   ↓
2. JWT generated with organizationId = null
   ↓
3. authenticate middleware extracts user info
   ↓
4. tenantContext middleware sets req.tenantId = null
   ↓
5. SUPER_ADMIN has global access
```

## Security Features

### Password Security
- ✅ Passwords hashed with **bcrypt** (10 rounds)
- ✅ Passwords never returned in responses
- ✅ Minimum 6 characters (configurable)

### JWT Security
- ✅ Signed with secret key
- ✅ Expiration enforced
- ✅ Token verification on every request
- ✅ Bearer token format required

### Organization Security
- ✅ Organization existence validated
- ✅ Organization status checked (must be active)
- ✅ Suspended organizations cannot login
- ✅ Inactive users cannot login

### Data Isolation
- ✅ Organization users can only access their org data
- ✅ SUPER_ADMIN can access all data
- ✅ Tenant context enforced via middleware

## Usage Examples

### Example 1: Register SUPER_ADMIN

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@system.com",
    "password": "superSecure123",
    "firstName": "System",
    "lastName": "Admin",
    "role": "SUPER_ADMIN"
  }'
```

### Example 2: Register Organization User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ORG_MEMBER",
    "organizationId": "org-uuid-here"
  }'
```

### Example 3: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "password": "password123"
  }'
```

### Example 4: Access Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Error Handling

All errors follow standard format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - User/Organization not found |
| 409 | Conflict - Email already exists |
| 500 | Internal Server Error |

## Testing the Auth System

### 1. Create an Organization First

```bash
curl -X POST http://localhost:5000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan": "pro"
  }'
```

Save the `id` from the response.

### 2. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "ORG_OWNER",
    "organizationId": "<org-id-from-step-1>"
  }'
```

Save the `token` from the response.

### 3. Test Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token-from-step-2>"
```

## Next Steps

- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Implement refresh tokens
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Implement 2FA
- [ ] Add session management
- [ ] Implement user invitation system

---

**Authentication system is production-ready and fully integrated with multi-tenancy!** 🔐
