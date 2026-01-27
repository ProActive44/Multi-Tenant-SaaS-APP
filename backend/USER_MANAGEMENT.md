# User Management System Documentation

## Overview

This user management system implements **strict tenant isolation** for Multi-Tenant SaaS. Users can only manage other users within their own organization, and the `organizationId` is **always** enforced from the JWT token, never from request body.

## Key Security Principles

### 🔒 Tenant Isolation Enforcement

1. **organizationId Source**: ALWAYS from `req.tenantId` (JWT token)
2. **Never from Request Body**: `organizationId` in request body is rejected
3. **Repository-Level Filtering**: All queries include `organizationId` filter
4. **Role-Based Access**: Only ORG_OWNER and ORG_ADMIN can manage users

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/users
```

All endpoints require authentication (`Authorization: Bearer <token>`)

---

### 1. Create User in Organization

**POST** `/api/users`

Create a new user in the authenticated user's organization.

#### Authorization
- ✅ **ORG_OWNER** - Can create users
- ✅ **ORG_ADMIN** - Can create users
- ❌ **ORG_MEMBER** - Cannot create users
- ❌ **SUPER_ADMIN** - Cannot create organization users

#### Request Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "newuser@acme.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "ORG_MEMBER"  // ORG_OWNER, ORG_ADMIN, or ORG_MEMBER
}
```

#### ⚠️ CRITICAL: organizationId Handling
```javascript
// ❌ WRONG - This will be REJECTED
{
  "email": "user@example.com",
  "organizationId": "some-org-id"  // ← REJECTED!
}

// ✅ CORRECT - organizationId comes from token
// Just send user data, organizationId is extracted from JWT
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Validation Rules
- ✅ Email must be valid format
- ✅ Password minimum 6 characters
- ✅ Role must be: `ORG_OWNER`, `ORG_ADMIN`, or `ORG_MEMBER`
- ✅ Email must be unique within organization
- ✅ `organizationId` in request body is **rejected**

#### Success Response (201)
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-uuid",
    "email": "newuser@acme.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ORG_MEMBER",
    "organizationId": "org-uuid",
    "organization": {
      "id": "org-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp"
    },
    "isActive": true,
    "createdAt": "2026-01-28T00:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request** - organizationId in request body
```json
{
  "success": false,
  "message": "organizationId cannot be specified in request body"
}
```

**403 Forbidden** - SUPER_ADMIN trying to create org user
```json
{
  "success": false,
  "message": "Organization context required. SUPER_ADMIN cannot create organization users."
}
```

**409 Conflict** - Email already exists in organization
```json
{
  "success": false,
  "message": "User with this email already exists in your organization"
}
```

---

### 2. Get Users in Organization

**GET** `/api/users`

List all users in the authenticated user's organization.

#### Authorization
- ✅ **All organization members** can view users in their org
- ✅ **SUPER_ADMIN** can view all users (with optional filter)

#### Query Parameters
```
?page=1              # Page number (default: 1)
&limit=10            # Items per page (default: 10)
&role=ORG_MEMBER     # Filter by role (optional)
&isActive=true       # Filter by active status (optional)
&organizationId=...  # SUPER_ADMIN only: Filter by org (optional)
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user-uuid-1",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ORG_OWNER",
      "organizationId": "org-uuid",
      "isActive": true,
      "lastLoginAt": "2026-01-28T00:00:00.000Z",
      "createdAt": "2026-01-27T00:00:00.000Z"
    },
    {
      "id": "user-uuid-2",
      "email": "jane@acme.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "ORG_MEMBER",
      "organizationId": "org-uuid",
      "isActive": true,
      "lastLoginAt": "2026-01-28T00:00:00.000Z",
      "createdAt": "2026-01-28T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

#### Tenant Isolation
```javascript
// ORG_USER: Automatically scoped to their organization
// Query: WHERE organizationId = req.tenantId

// SUPER_ADMIN: Can see all users
// Query: WHERE organizationId = req.query.organizationId (optional)
```

---

### 3. Get Current User

**GET** `/api/users/me`

Get the authenticated user's profile.

#### Authorization
- ✅ **All authenticated users**

#### Success Response (200)
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "john@acme.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ORG_OWNER",
    "organizationId": "org-uuid",
    "organization": {
      "id": "org-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active"
    },
    "isActive": true,
    "lastLoginAt": "2026-01-28T00:00:00.000Z",
    "createdAt": "2026-01-27T00:00:00.000Z"
  }
}
```

---

### 4. Get User by ID

**GET** `/api/users/:id`

Get a specific user by ID (tenant-scoped).

#### Authorization
- ✅ **All organization members** can view users in their org

#### Success Response (200)
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "jane@acme.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ORG_MEMBER",
    "organizationId": "org-uuid",
    "organization": {
      "id": "org-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active"
    },
    "isActive": true,
    "lastLoginAt": "2026-01-28T00:00:00.000Z",
    "createdAt": "2026-01-28T00:00:00.000Z"
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "User not found in your organization"
}
```

**Note**: Returns 404 even if user exists in another organization (tenant isolation).

---

### 5. Update User

**PATCH** `/api/users/:id`

Update a user in the organization.

#### Authorization
- ✅ **ORG_OWNER** - Can update users
- ✅ **ORG_ADMIN** - Can update users
- ❌ **ORG_MEMBER** - Cannot update users

#### Request Body
```json
{
  "firstName": "Jane Updated",
  "lastName": "Smith Updated",
  "role": "ORG_ADMIN",
  "isActive": true
}
```

#### ⚠️ Security Notes
- `organizationId` in request body is **rejected**
- `organizationId` cannot be changed
- User must exist in requester's organization

#### Success Response (200)
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user-uuid",
    "email": "jane@acme.com",
    "firstName": "Jane Updated",
    "lastName": "Smith Updated",
    "role": "ORG_ADMIN",
    "organizationId": "org-uuid",
    "isActive": true,
    "updatedAt": "2026-01-28T01:00:00.000Z"
  }
}
```

---

### 6. Delete User

**DELETE** `/api/users/:id`

Delete a user from the organization.

#### Authorization
- ✅ **ORG_OWNER** - Can delete users
- ✅ **ORG_ADMIN** - Can delete users
- ❌ **ORG_MEMBER** - Cannot delete users

#### Restrictions
- ❌ Cannot delete yourself
- ✅ User must exist in your organization

#### Success Response (200)
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "message": "User deleted successfully"
  }
}
```

#### Error Response (400)
```json
{
  "success": false,
  "message": "You cannot delete your own account"
}
```

---

### 7. Toggle User Status

**PATCH** `/api/users/:id/status`

Activate or deactivate a user.

#### Authorization
- ✅ **ORG_OWNER** - Can toggle status
- ✅ **ORG_ADMIN** - Can toggle status

#### Request Body
```json
{
  "isActive": false
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "user-uuid",
    "email": "jane@acme.com",
    "isActive": false,
    "updatedAt": "2026-01-28T01:00:00.000Z"
  }
}
```

---

## Tenant Isolation Architecture

### How It Works

```
1. User makes request with JWT token
   ↓
2. authenticate middleware extracts user info
   req.user = { userId, email, role, organizationId }
   ↓
3. tenantContext middleware validates organization
   req.tenantId = organizationId (from token)
   ↓
4. Controller receives request
   organizationId = req.tenantId (NOT req.body)
   ↓
5. Service layer enforces tenant isolation
   ↓
6. Repository queries with organizationId filter
   WHERE organizationId = req.tenantId
   ↓
7. Data returned is scoped to organization
```

### Repository-Level Enforcement

**Example: Find Users**
```javascript
// ✅ CORRECT - Tenant-scoped query
async findByOrganization(organizationId, options) {
  const where = {
    organizationId,  // ← CRITICAL: Always filter by org
    ...otherFilters
  };
  
  return await prisma.user.findMany({ where });
}

// ❌ WRONG - No tenant filter
async findAll() {
  return await prisma.user.findMany();  // ← Exposes all users!
}
```

**Example: Update User**
```javascript
// ✅ CORRECT - Tenant-scoped update
async updateUserInOrganization(userId, organizationId, data) {
  return await prisma.user.updateMany({
    where: {
      id: userId,
      organizationId,  // ← CRITICAL: Ensures user is in org
    },
    data,
  });
}

// ❌ WRONG - No tenant filter
async update(userId, data) {
  return await prisma.user.update({
    where: { id: userId },  // ← Can update users in other orgs!
    data,
  });
}
```

---

## Middleware Chain

### Standard Organization Route
```javascript
router.post(
  '/',
  authenticate,           // 1. Validate JWT
  requireOrganization,    // 2. Ensure user has organization
  tenantContext,          // 3. Validate organization is active
  authorize('ORG_OWNER'), // 4. Check role
  controller.createUser   // 5. Execute
);
```

### Middleware Execution Flow
```
Request
  ↓
authenticate
  - Validates JWT
  - Sets req.user = { userId, email, role, organizationId }
  - Sets req.tenantId = organizationId (if has org)
  ↓
requireOrganization
  - Checks req.user.organizationId exists
  - Rejects SUPER_ADMIN
  ↓
tenantContext
  - Validates organization exists
  - Validates organization is active
  - Confirms req.tenantId
  ↓
authorize('ORG_OWNER', 'ORG_ADMIN')
  - Checks req.user.role is in allowed list
  ↓
Controller
  - Uses req.tenantId for organizationId
  - NEVER uses req.body.organizationId
```

---

## Security Best Practices

### ✅ DO

1. **Always use req.tenantId**
   ```javascript
   const organizationId = req.tenantId;
   await userService.createUser(data, organizationId);
   ```

2. **Reject organizationId in request body**
   ```javascript
   if (req.body.organizationId) {
     throw new Error('organizationId cannot be specified');
   }
   ```

3. **Filter all queries by organizationId**
   ```javascript
   const users = await prisma.user.findMany({
     where: { organizationId: req.tenantId }
   });
   ```

4. **Use updateMany/deleteMany for tenant safety**
   ```javascript
   // ✅ Safe - Won't update if not in org
   await prisma.user.updateMany({
     where: { id: userId, organizationId },
     data
   });
   ```

### ❌ DON'T

1. **Never trust organizationId from request body**
   ```javascript
   // ❌ DANGEROUS
   const { organizationId } = req.body;
   await createUser(data, organizationId);
   ```

2. **Never query without organizationId filter**
   ```javascript
   // ❌ DANGEROUS - Exposes all users
   const users = await prisma.user.findMany();
   ```

3. **Never use update/delete without tenant filter**
   ```javascript
   // ❌ DANGEROUS - Can modify users in other orgs
   await prisma.user.update({
     where: { id: userId },
     data
   });
   ```

---

## Usage Examples

### Example 1: Create User (ORG_OWNER)

```bash
# 1. Login as ORG_OWNER
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "password": "password123"
  }'

# Save the token from response

# 2. Create user (organizationId from token)
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@acme.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "Member",
    "role": "ORG_MEMBER"
  }'
```

### Example 2: List Users

```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Example 3: Get Current User

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer <token>"
```

### Example 4: Update User

```bash
curl -X PATCH http://localhost:5000/api/users/<user-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ORG_ADMIN",
    "isActive": true
  }'
```

### Example 5: Delete User

```bash
curl -X DELETE http://localhost:5000/api/users/<user-id> \
  -H "Authorization: Bearer <token>"
```

---

## Role-Based Access Matrix

| Action | SUPER_ADMIN | ORG_OWNER | ORG_ADMIN | ORG_MEMBER |
|--------|-------------|-----------|-----------|------------|
| Create User | ❌ | ✅ | ✅ | ❌ |
| List Users (Own Org) | ✅* | ✅ | ✅ | ✅ |
| View User (Own Org) | ❌ | ✅ | ✅ | ✅ |
| Update User | ❌ | ✅ | ✅ | ❌ |
| Delete User | ❌ | ✅ | ✅ | ❌ |
| Toggle Status | ❌ | ✅ | ✅ | ❌ |
| Get Own Profile | ✅ | ✅ | ✅ | ✅ |

\* SUPER_ADMIN can list all users across organizations

---

## Error Handling

### Common Errors

| Code | Message | Cause |
|------|---------|-------|
| 400 | organizationId cannot be specified in request body | Client sent organizationId |
| 400 | Missing required fields | Required fields missing |
| 400 | Invalid email format | Email validation failed |
| 400 | You cannot delete your own account | Self-deletion attempt |
| 403 | Organization context required | SUPER_ADMIN trying to create org user |
| 403 | Insufficient permissions | Role not authorized |
| 404 | User not found in your organization | User doesn't exist or in different org |
| 409 | User with this email already exists | Email conflict in organization |

---

## Testing Checklist

- [ ] Create user as ORG_OWNER
- [ ] Create user as ORG_ADMIN
- [ ] Try to create user as ORG_MEMBER (should fail)
- [ ] Try to create user with organizationId in body (should fail)
- [ ] List users in organization
- [ ] Get user by ID (same org)
- [ ] Try to get user from different org (should fail)
- [ ] Update user role
- [ ] Try to update organizationId (should be ignored)
- [ ] Delete user
- [ ] Try to delete yourself (should fail)
- [ ] Toggle user status
- [ ] SUPER_ADMIN list all users

---

**User management system is production-ready with strict tenant isolation!** 🔒
