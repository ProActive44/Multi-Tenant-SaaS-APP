# Frontend - Multi-Tenant SaaS

Modern, responsive frontend for the Multi-Tenant SaaS application built with React, TypeScript, and Vite.

## 🚀 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (ready for Tailwind or styled-components)
- **State Management**: React Context (ready for Redux/Zustand)
- **API Client**: Fetch/Axios (to be configured)
- **Routing**: React Router (to be added)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── context/         # React Context providers
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── index.html           # HTML template
```

## 🎯 Features (Planned)

- [ ] Authentication UI (Login/Register)
- [ ] Organization Dashboard
- [ ] User Management
- [ ] Role-based UI rendering
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Form validation
- [ ] Error boundaries
- [ ] Loading states

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

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## 🔌 API Integration

The frontend will connect to the backend API at:
- **Development**: `http://localhost:5000/api`
- **Production**: Configure via environment variables

### Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎨 Design System (To Be Implemented)

- Modern, clean UI
- Consistent color palette
- Responsive breakpoints
- Reusable components
- Accessibility (WCAG 2.1)

## 📦 Recommended Packages

Consider adding:
- `react-router-dom` - Routing
- `axios` - HTTP client
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@tanstack/react-query` - Data fetching
- `tailwindcss` - Utility-first CSS (optional)

## 🔐 Authentication Flow

1. User logs in → Backend returns JWT
2. Store JWT in localStorage/sessionStorage
3. Include JWT in API requests
4. Redirect to dashboard
5. Extract organization context from JWT

## 📝 Next Steps

1. Set up routing (React Router)
2. Create authentication pages
3. Build organization dashboard
4. Implement API service layer
5. Add form validation
6. Create reusable components

---

**Built with React + TypeScript + Vite**
