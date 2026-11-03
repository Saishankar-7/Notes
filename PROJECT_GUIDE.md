# Notes App — Project Implementation Guide & Architecture Document

This document provides a comprehensive roadmap for developing the **Full-Stack Notes Application with Role-Based Access Control (RBAC)** based on your specified directory structure.

---

## 1. Project Directory Structure

```text
notes-app/
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx          # Header with user info, role badge, logout
│       │   ├── NoteCard.jsx        # Individual note display card with pin/edit/delete
│       │   ├── NoteModal.jsx       # Modal dialog for creating & editing notes
│       │   └── ProtectedRoute.jsx  # Guards routes based on auth & role
│       ├── pages/
│       │   ├── Login.jsx           # User sign-in page
│       │   ├── Register.jsx        # User registration page
│       │   ├── Notes.jsx           # Notes management dashboard (User)
│       │   └── AdminDashboard.jsx  # Admin panel (user management, stats)
│       ├── services/
│       │   └── api.js              # Axios instance with JWT interceptors
│       ├── context/
│       │   └── AuthContext.jsx     # Global authentication & user state
│       ├── App.jsx                 # Route definitions and layout
│       └── main.jsx                # React DOM entry point
│
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection logic
│   ├── models/
│   │   ├── User.js                 # User schema (name, email, password, role)
│   │   └── Note.js                 # Note schema (title, content, tags, isPinned, user)
│   ├── controllers/
│   │   ├── authController.js       # Register, login, current profile logic
│   │   └── noteController.js       # CRUD operations scoped to logged-in user
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT validation and req.user attachment
│   │   └── roleMiddleware.js       # Role check (e.g. require admin)
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth routes
│   │   ├── noteRoutes.js           # /api/notes routes
│   │   └── adminRoutes.js          # /api/admin routes
│   ├── utils/
│   │   └── generateToken.js        # JWT signing utility
│   ├── .env                        # Environment configurations
│   ├── server.js                   # Express server entry point
│   └── package.json                # Backend dependencies and scripts
```

---

## 2. How the App Works (Architectural Flow)

1. **Authentication Flow**:
   - A user submits their credentials via [Login.jsx](file:///d:/Notes%20app/frontend/src/pages/Login.jsx) or [Register.jsx](file:///d:/Notes%20app/frontend/src/pages/Register.jsx).
   - [authController.js](file:///d:/Notes%20app/backend/controllers/authController.js) validates the inputs, hashes passwords with `bcryptjs`, and issues a **JSON Web Token (JWT)** signed via [generateToken.js](file:///d:/Notes%20app/backend/utils/generateToken.js).
   - The token contains the user's `id` and `role` (`'user'` or `'admin'`).
   - The client stores the token in `localStorage` and keeps user info in `AuthContext`.

2. **Authorized Requests & Note CRUD**:
   - Every outgoing API call via [api.js](file:///d:/Notes%20app/frontend/src/services/api.js) automatically injects `Authorization: Bearer <token>` in the HTTP headers using an Axios request interceptor.
   - [authMiddleware.js](file:///d:/Notes%20app/backend/middleware/authMiddleware.js) validates the token on protected routes and attaches the authenticated user object to `req.user`.
   - [noteController.js](file:///d:/Notes%20app/backend/controllers/noteController.js) queries and mutates notes scoped strictly to `user: req.user._id`, ensuring absolute data isolation between users.

3. **Role-Based Access Control (Admin Dashboard)**:
   - When accessing `/admin`, [ProtectedRoute.jsx](file:///d:/Notes%20app/frontend/src/components/ProtectedRoute.jsx) ensures the user is logged in AND has `role === 'admin'`.
   - On the backend, [roleMiddleware.js](file:///d:/Notes%20app/backend/middleware/roleMiddleware.js) verifies `req.user.role === 'admin'`. Unauthorized requests receive an HTTP `403 Forbidden` response.
   - Admins can view all users, manage accounts, and view platform metrics.

---

## 3. Step-by-Step Implementation Process

### Step 1: Backend Foundation & Server Setup
- Initialize Node.js in `backend/` and install:
  ```bash
  npm install express mongoose dotenv cors bcryptjs jsonwebtoken
  npm install -D nodemon
  ```
- Configure `.env`:
  ```env
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/notes_app
  JWT_SECRET=your_super_secret_jwt_key_here
  NODE_ENV=development
  ```
- Build [server.js](file:///d:/Notes%20app/backend/server.js) with CORS, JSON body parser, and base route mounts.
- Connect to MongoDB via [db.js](file:///d:/Notes%20app/backend/config/db.js).

### Step 2: Database Models
- **[User.js](file:///d:/Notes%20app/backend/models/User.js)**:
  - Name, email (unique), password (hashed), role (`user` | `admin`).
- **[Note.js](file:///d:/Notes%20app/backend/models/Note.js)**:
  - Title, content, category, isPinned, user (`ObjectId` referencing `User`), timestamps.

### Step 3: Security & Middleware
- Create [generateToken.js](file:///d:/Notes%20app/backend/utils/generateToken.js) to sign JWT with `process.env.JWT_SECRET`.
- Create [authMiddleware.js](file:///d:/Notes%20app/backend/middleware/authMiddleware.js) to verify the Bearer token and set `req.user`.
- Create [roleMiddleware.js](file:///d:/Notes%20app/backend/middleware/roleMiddleware.js) to enforce administrative privileges.

### Step 4: API Controllers & Route Endpoints
- **Auth Routes (`/api/auth`)**:
  - `POST /register`: Create account and return token.
  - `POST /login`: Validate credentials and return token.
  - `GET /profile`: Get current logged-in user profile.
- **Notes Routes (`/api/notes`)**:
  - `GET /`: Get all notes for current user (pinned notes first).
  - `POST /`: Create note for current user.
  - `GET /:id`, `PUT /:id`, `DELETE /:id`: Operate on note with ownership validation.
- **Admin Routes (`/api/admin`)**:
  - `GET /users`: List all registered users (Admin only).
  - `DELETE /users/:id`: Delete a user account (Admin only).
  - `GET /stats`: Retrieve system counts for users and notes (Admin only).

### Step 5: Frontend Project Initialization
- Scaffold React with Vite in `frontend/`:
  ```bash
  npm create vite@latest frontend -- --template react
  cd frontend
  npm install react-router-dom axios lucide-react
  ```
- Configure modern styling and dark/light design system in `index.css`.

### Step 6: Frontend API Client & State Management
- Create [api.js](file:///d:/Notes%20app/frontend/src/services/api.js) with Axios interceptors for automatic JWT injection and 401 error interception.
- Create `AuthContext.jsx` to manage authentication state across the application (`user`, `token`, `login`, `register`, `logout`).

### Step 7: UI Components & Protected Routing
- Build [ProtectedRoute.jsx](file:///d:/Notes%20app/frontend/src/components/ProtectedRoute.jsx) to guard `/notes` and `/admin`.
- Build [Navbar.jsx](file:///d:/Notes%20app/frontend/src/components/Navbar.jsx) with navigation links, current user name, role badge, and logout button.
- Build [NoteCard.jsx](file:///d:/Notes%20app/frontend/src/components/NoteCard.jsx) with pin toggle, edit button, delete button, and tag indicators.
- Build [NoteModal.jsx](file:///d:/Notes%20app/frontend/src/components/NoteModal.jsx) for creating and editing notes with title, content, tags, and pin options.

### Step 8: Pages Assembly
- **[Login.jsx](file:///d:/Notes%20app/frontend/src/pages/Login.jsx) & [Register.jsx](file:///d:/Notes%20app/frontend/src/pages/Register.jsx)**:
  - Form validation, password visibility toggles, loading states, error badges.
- **[Notes.jsx](file:///d:/Notes%20app/frontend/src/pages/Notes.jsx)**:
  - Search filter (title & content search).
  - Category / tag filtering buttons.
  - Pinned notes section and other notes section.
  - Create note trigger button and modal dialog.
- **[AdminDashboard.jsx](file:///d:/Notes%20app/frontend/src/pages/AdminDashboard.jsx)**:
  - Metrics cards (Total Users, Total Notes, Admins count).
  - User management table with role badges and deletion action.

### Step 9: Testing & Verification
- Test all API routes using curl / Postman or browser tests.
- Test normal user flow: Register -> Login -> Create Note -> Pin Note -> Search Note -> Edit -> Delete -> Logout.
- Test admin flow: Login as Admin -> View Admin Dashboard -> View users & statistics -> Role management.
- Test security boundaries: Verify non-admin cannot access `/api/admin` routes or Admin Dashboard UI.

---

## 4. REST API Endpoint Reference

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register new user |
| **POST** | `/api/auth/login` | Public | Authenticate user and receive JWT |
| **GET** | `/api/auth/profile` | Authenticated | Retrieve current user profile |
| **GET** | `/api/notes` | Authenticated | Fetch notes for current user |
| **POST** | `/api/notes` | Authenticated | Create a new note |
| **GET** | `/api/notes/:id` | Authenticated (Owner) | Fetch specific note |
| **PUT** | `/api/notes/:id` | Authenticated (Owner) | Update note |
| **DELETE** | `/api/notes/:id` | Authenticated (Owner) | Delete note |
| **GET** | `/api/admin/users` | Admin Only | Get list of all users |
| **DELETE** | `/api/admin/users/:id` | Admin Only | Remove a user |
| **GET** | `/api/admin/stats` | Admin Only | Get application statistics |
