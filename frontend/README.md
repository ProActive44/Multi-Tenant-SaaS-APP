# Frontend - Multi-Tenant SaaS

Modern, responsive frontend for the Multi-Tenant SaaS application built with React, TypeScript, and Vite.

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthContext)
- **API Client**: Axios with Interceptors
- **Routing**: React Router DOM v6

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/             # Axios setup & API endpoints
│   ├── auth/            # Auth Context & Providers
│   ├── components/      # Reusable UI components (Layout, ProtectedRoute)
│   ├── pages/           # Page components
│   │   ├── tasks/       # Task management pages
│   │   ├── super-admin/ # Super Admin pages
│   │   └── ...          # Auth & User pages
│   ├── routes/          # App Routes configuration
│   ├── types/           # TypeScript interfaces
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
└── index.html           # HTML template
```

## 🎯 Features Implemented

### Authentication
- **Dual Login Portals:** Separate login pages for Super Admins (`/super-admin/login`) and Organization Users (`/login`).
- **Secure Auth:** JWT storage in localStorage with automatic header injection.
- **Protected Routes:** Role-based route guards (`ProtectedRoute`).

### Super Admin Portal
- **Dashboard:** Overview of system status.
- **Organization Management:** Create, List, Enable/Disable Organizations.
- **Admin Provisioning:** Create initial Org Admins.

### Organization Portal
- **Dashboard:** Task and User overview.
- **Task Management:**
  - Create, Edit, Delete Tasks.
  - Multi-user assignment.
  - Status workflow (Open -> In Progress -> Completed).
  - Priority levels and Due Dates.
- **User Management:**
  - Add/Remove users.
  - Role assignment (Admin, Member).
- **RBAC UI:**
  - Elements conditionally rendered based on permissions (e.g., "Create Task" button hidden for Members).
  - Form fields disabled for unauthorized actions.

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

Runs on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🔌 API Integration

The frontend connects to the backend API via Axios.

### Environment Variables

Create `.env` file:
```env
VITE_API_URL="http://localhost:5000/api"
```

## 🔐 Security

- **Token Management:** Automatic token attachment via Axios interceptors.
- **Session Handling:** Auto-logout on 401 Unauthorized responses.
- **Role Validation:** Frontend checks match backend RBAC for seamless UX.

---

**Built with React + TypeScript + Tailwind CSS**
