# Frontend Setup - Multi-Tenant SaaS

## ✅ Implementation Complete

The frontend is now fully set up with React 19, TypeScript, Tailwind CSS, and authentication.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.ts              # Axios instance with JWT interceptors
│   │   └── auth.api.ts           # API client functions
│   │
│   ├── auth/
│   │   ├── AuthContext.tsx       # Auth state management
│   │   └── ProtectedRoute.tsx    # Route protection component
│   │
│   ├── pages/
│   │   ├── Login.tsx             # Login page
│   │   ├── Users.tsx             # Users list page
│   │   └── CreateUser.tsx        # Create user page
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx         # Route configuration
│   │
│   ├── types/
│   │   └── auth.ts               # TypeScript types
│   │
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind CSS
│
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── .env.local                    # Environment variables (create this)
└── package.json
```

---

## 🚀 Getting Started

### 1. Environment Setup

Create `.env.local` file in the frontend directory:

```bash
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies (Already Done)

```bash
npm install
```

Installed packages:
- ✅ `tailwindcss` - Utility-first CSS framework
- ✅ `postcss` & `autoprefixer` - CSS processing
- ✅ `axios` - HTTP client
- ✅ `react-router-dom` - Routing
- ✅ `@types/react-router-dom` - TypeScript types

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔐 Authentication Flow

### How It Works

```
1. User enters credentials on /login
   ↓
2. POST /api/auth/login
   ↓
3. Backend returns { user, token }
   ↓
4. Frontend stores in:
   - localStorage.setItem('token', token)
   - localStorage.setItem('user', JSON.stringify(user))
   ↓
5. Axios interceptor attaches token to all requests:
   Authorization: Bearer <token>
   ↓
6. User redirected to /users
```

### Auto-Login on Refresh

- AuthContext reads from localStorage on mount
- If token exists, user stays logged in
- If token is invalid, 401 interceptor clears auth and redirects to login

---

## 🛣️ Routes

| Path | Component | Protection | Allowed Roles |
|------|-----------|------------|---------------|
| `/login` | Login | Public | All |
| `/users` | Users | Protected | All authenticated |
| `/users/create` | CreateUser | Protected | ORG_OWNER, ORG_ADMIN |
| `/` | - | Redirect to /users | - |

---

## 🎨 Tailwind CSS Setup

### Configuration

**tailwind.config.js:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Custom Utility Classes (Removed)

The custom utility classes were removed to use Tailwind's default utilities directly. This keeps the CSS minimal and leverages Tailwind's full power.

---

## 📊 Pages Overview

### 1. Login Page (`/login`)

**Features:**
- Email and password inputs
- Form validation
- Error display
- Loading state
- Auto-redirect to /users on success

**Usage:**
```
Email: owner@acme.com (or any user you created)
Password: password123 (or the password you set)
```

### 2. Users Page (`/users`)

**Features:**
- List all users in organization
- Pagination (10 users per page)
- User info display (name, email, role, status, last login)
- Role-based UI:
  - "Create User" button (ORG_OWNER, ORG_ADMIN only)
  - Activate/Deactivate users (ORG_OWNER, ORG_ADMIN only)
  - Delete users (ORG_OWNER, ORG_ADMIN only)
- Organization name display
- Current user info in header
- Logout button

**Role-Based Actions:**
```typescript
const canCreateUsers = 
  currentUser?.role === 'ORG_OWNER' || 
  currentUser?.role === 'ORG_ADMIN';

// Show "Create User" button only if canCreateUsers
{canCreateUsers && (
  <button onClick={handleCreateUser}>+ Create User</button>
)}
```

### 3. Create User Page (`/users/create`)

**Features:**
- Form with validation
- Fields: email, password, firstName, lastName, role
- Role selection (ORG_MEMBER, ORG_ADMIN, ORG_OWNER)
- Password minimum 6 characters
- Error display
- Cancel button
- Auto-redirect to /users on success

**Access:**
- Only ORG_OWNER and ORG_ADMIN can access
- Others get "Access Denied" message

---

## 🔒 Security Features

### 1. JWT Token Management

**Axios Interceptor (Request):**
```typescript
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Axios Interceptor (Response):**
```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Protected Routes

**ProtectedRoute Component:**
```typescript
<ProtectedRoute allowedRoles={['ORG_OWNER', 'ORG_ADMIN']}>
  <CreateUser />
</ProtectedRoute>
```

- Checks `isAuthenticated`
- Shows loading state while checking
- Redirects to `/login` if not authenticated
- Checks role if `allowedRoles` specified
- Shows "Access Denied" if role not allowed

### 3. Role-Based UI

**Conditional Rendering:**
```typescript
// Only show create button for admins
{canCreateUsers && (
  <button>+ Create User</button>
)}

// Disable actions for current user
<button disabled={user.id === currentUser?.id}>
  Delete
</button>
```

---

## 📡 API Integration

### API Client (`auth.api.ts`)

**Auth Endpoints:**
```typescript
authApi.login(credentials)           // POST /auth/login
authApi.getProfile()                 // GET /auth/me
```

**Users Endpoints:**
```typescript
usersApi.getUsers(page, limit)       // GET /users?page=1&limit=10
usersApi.getCurrentUser()            // GET /users/me
usersApi.createUser(payload)         // POST /users
usersApi.deleteUser(userId)          // DELETE /users/:id
usersApi.toggleUserStatus(userId, isActive)  // PATCH /users/:id/status
```

### Type Safety

All API calls are fully typed:

```typescript
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

const response = await authApi.login(credentials);
// response is typed as LoginResponse
```

---

## 🎯 TypeScript Types

### User & Auth Types

```typescript
type UserRole = 'SUPER_ADMIN' | 'ORG_OWNER' | 'ORG_ADMIN' | 'ORG_MEMBER';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string | null;
  organization?: Organization;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

---

## 🧪 Testing the Frontend

### 1. Start Both Servers

**Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 2. Create Test Data (Backend)

**Create Organization:**
```bash
curl -X POST http://localhost:5000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme-corp"
  }'
```

**Register ORG_OWNER:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ORG_OWNER",
    "organizationId": "<org-id-from-above>"
  }'
```

### 3. Test Frontend

1. **Open browser:** `http://localhost:5173`
2. **Login:**
   - Email: `owner@acme.com`
   - Password: `password123`
3. **Should redirect to:** `/users`
4. **Click "Create User"** (should be visible for ORG_OWNER)
5. **Create a new user**
6. **Verify user appears in list**
7. **Test activate/deactivate**
8. **Test logout**

---

## 🎨 UI Components

### Tailwind Utility Classes Used

**Buttons:**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  Button
</button>
```

**Inputs:**
```tsx
<input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

**Cards:**
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  Card Content
</div>
```

**Tables:**
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead>
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
        Header
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        Cell
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🔧 Configuration Files

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### tsconfig.json

Already configured by Vite for React 19 + TypeScript.

---

## ✅ Features Implemented

### Authentication
- ✅ Login page with form validation
- ✅ JWT token storage in localStorage
- ✅ Automatic token attachment to requests
- ✅ Auto-logout on 401 errors
- ✅ Persistent login (survives page refresh)
- ✅ Logout functionality

### Routing
- ✅ React Router setup
- ✅ Protected routes
- ✅ Role-based route access
- ✅ Auto-redirect to /users
- ✅ 404 handling

### User Management
- ✅ List users with pagination
- ✅ Create user (ORG_OWNER, ORG_ADMIN only)
- ✅ Delete user (ORG_OWNER, ORG_ADMIN only)
- ✅ Toggle user status (ORG_OWNER, ORG_ADMIN only)
- ✅ Role-based UI rendering
- ✅ Prevent self-deletion

### UI/UX
- ✅ Tailwind CSS styling
- ✅ Responsive design
- ✅ Loading states
- ✅ Error messages
- ✅ Form validation
- ✅ Clean, minimal design

### Type Safety
- ✅ Full TypeScript coverage
- ✅ Type-safe API calls
- ✅ Type-safe routing
- ✅ Type-safe state management

---

## 🚀 Next Steps

### Immediate
1. ✅ Both servers are running
2. ✅ Create test organization and user (backend)
3. ✅ Test login flow
4. ✅ Test user management

### Future Enhancements
1. User profile editing
2. Password change
3. Organization settings
4. Dashboard with analytics
5. User search and filtering
6. Bulk user operations
7. User invitation system
8. Email verification
9. Password reset
10. Dark mode

---

## 📚 Key Files Reference

### Entry Point
- `src/main.tsx` - App initialization
- `src/App.tsx` - Root component with AuthProvider

### Authentication
- `src/auth/AuthContext.tsx` - Auth state management
- `src/auth/ProtectedRoute.tsx` - Route protection

### API
- `src/api/axios.ts` - Axios configuration
- `src/api/auth.api.ts` - API client functions

### Pages
- `src/pages/Login.tsx` - Login page
- `src/pages/Users.tsx` - Users list
- `src/pages/CreateUser.tsx` - Create user form

### Routing
- `src/routes/AppRoutes.tsx` - Route configuration

### Types
- `src/types/auth.ts` - TypeScript definitions

### Styling
- `src/index.css` - Tailwind directives
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

---

## 🎉 Success!

**Frontend is fully functional with:**
- ✅ React 19 + TypeScript + Vite
- ✅ Tailwind CSS
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Role-Based Access Control
- ✅ User Management UI
- ✅ Type-Safe API Integration

**Both servers are running:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

**Ready to use!** 🚀
