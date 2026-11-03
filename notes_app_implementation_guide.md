# Notes App — Full-Stack Implementation Guide & Development Roadmap

This document outlines the complete architectural blueprint, technical strategy, and step-by-step implementation process for building the **Full-Stack Notes Application** with Role-Based Access Control (RBAC).

---

## 1. System Architecture & High-Level Flow

The application follows a decoupled client-server architecture utilizing the **MERN** stack (MongoDB, Express.js, React, Node.js).

```mermaid
graph TD
    subgraph Frontend ["Frontend (React + Vite)"]
        UI[User Interface & Pages]
        AuthCtx[Auth Context & State]
        AxiosInst[Axios API Client + Interceptor]
        UI --> AuthCtx
        AuthCtx --> AxiosInst
    end

    subgraph Backend ["Backend (Node.js + Express)"]
        Server[Express Server (server.js)]
        AuthMid[authMiddleware (JWT Verify)]
        RoleMid[roleMiddleware (Admin Check)]
        AuthCtrl[authController]
        NoteCtrl[noteController]
        AdminCtrl[adminController / routes]

        Server --> AuthMid
        AuthMid --> NoteCtrl
        AuthMid --> RoleMid
        RoleMid --> AdminCtrl
        Server --> AuthCtrl
    end

    subgraph Database ["Database (MongoDB)"]
        UserCol[(Users Collection)]
        NoteCol[(Notes Collection)]
        AuthCtrl --> UserCol
        NoteCtrl --> NoteCol
        AdminCtrl --> UserCol
        AdminCtrl --> NoteCol
    end

    AxiosInst -->|HTTP Requests + Bearer Token| Server
```

---

## 2. Project Directory Structure Mapping

Here is how each file and directory fits into the overall architecture:

```text
notes-app/
│
├── frontend/
│   └── src/
│       ├── components/          # Reusable UI widgets (Navbar, NoteCard, NoteModal, ProtectedRoute)
│       ├── pages/
│       │   ├── Login.jsx        # Authentication: User sign-in
│       │   ├── Register.jsx     # Authentication: User sign-up
│       │   ├── Notes.jsx        # Personal dashboard: CRUD, search, tags, pin notes
│       │   └── AdminDashboard.jsx # Admin panel: User management, platform analytics
│       ├── services/
│       │   └── api.js           # Centralized Axios instance with JWT interceptors
│       ├── context/             # AuthContext for session management & user state
│       ├── App.jsx              # Application router, layout wrapper, protected routes
│       └── main.jsx             # React entry point
│
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection handler via Mongoose
│   ├── models/
│   │   ├── User.js              # User schema (name, email, password, role)
│   │   └── Note.js              # Note schema (title, content, tags, isPinned, user ref)
│   ├── controllers/
│   │   ├── authController.js    # Logic for registration, login, profile retrieval
│   │   └── noteController.js    # Logic for notes CRUD with user-specific isolation
│   ├── middleware/
│   │   ├── authMiddleware.js    # Decodes JWT and attaches req.user
│   │   └── roleMiddleware.js    # Enforces role permissions (e.g. role === 'admin')
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth routes
│   │   ├── noteRoutes.js        # /api/notes routes (protected)
│   │   └── adminRoutes.js       # /api/admin routes (admin only)
│   ├── utils/
│   │   └── generateToken.js     # Signs JSON Web Tokens with secret and expiration
│   ├── .env                     # Secrets, MongoDB URI, PORT, JWT_SECRET
│   ├── server.js                # Express app entry point, middleware, routes mount
│   └── package.json             # Backend dependencies and scripts
```

---

## 3. Step-by-Step Implementation Roadmap

### Phase 1: Environment & Scaffolding
1. **Initialize Root Structure**:
   - Create `backend/` and `frontend/` folders.
   - Set up `.gitignore` for `node_modules`, `.env`, and build outputs.
2. **Backend Setup**:
   - Initialize `backend/package.json` with `npm init -y`.
   - Install production dependencies: `express`, `mongoose`, `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`.
   - Install development dependencies: `nodemon`.
   - Add scripts: `"start": "node server.js"`, `"dev": "nodemon server.js"`.
3. **Frontend Setup**:
   - Initialize React with Vite: `npm create vite@latest frontend -- --template react`.
   - Install dependencies: `react-router-dom`, `axios`, `lucide-react` (for icons).

---

### Phase 2: Database Configuration & Data Models
1. **MongoDB Connection ([db.js](file:///d:/Notes%20app/backend/config/db.js))**:
   - Connect to MongoDB using `mongoose.connect(process.env.MONGO_URI)`.
   - Implement error handling with graceful process exit on failure.
2. **User Model ([User.js](file:///d:/Notes%20app/backend/models/User.js))**:
   - Fields: `name` (String, required), `email` (String, unique, required), `password` (String, required), `role` (String, enum: `['user', 'admin']`, default: `'user'`).
   - Timestamps: `createdAt`, `updatedAt`.
   - Pre-save hook or controller-level hashing using `bcryptjs`.
3. **Note Model ([Note.js](file:///d:/Notes%20app/backend/models/Note.js))**:
   - Fields: `title` (String, required), `content` (String, required), `category` / `tags` ([String]), `isPinned` (Boolean, default `false`), `user` (Mongoose Schema ObjectId referencing `'User'`).
   - Timestamps: `createdAt`, `updatedAt`.

---

### Phase 3: Security, Tokens & Middleware
1. **Token Generator ([generateToken.js](file:///d:/Notes%20app/backend/utils/generateToken.js))**:
   - Sign JWT containing payload `{ id: user._id, role: user.role }`.
   - Expiration standard: `30d` or `7d`.
2. **Authentication Middleware ([authMiddleware.js](file:///d:/Notes%20app/backend/middleware/authMiddleware.js))**:
   - Extracts token from `Authorization: Bearer <token>` header.
   - Verifies token with `jwt.verify(token, process.env.JWT_SECRET)`.
   - Fetches user from DB (`User.findById(decoded.id).select('-password')`) and attaches to `req.user`.
   - Handles expired or invalid tokens with HTTP `401 Unauthorized`.
3. **Role Authorization Middleware ([roleMiddleware.js](file:///d:/Notes%20app/backend/middleware/roleMiddleware.js))**:
   - Verifies if `req.user.role === 'admin'`.
   - Returns HTTP `403 Forbidden` if the user is unauthorized.

---

### Phase 4: Backend Controllers & Routes
1. **Authentication Controller & Routes ([authController.js](file:///d:/Notes%20app/backend/controllers/authController.js) & [authRoutes.js](file:///d:/Notes%20app/backend/routes/authRoutes.js))**:
   - `POST /api/auth/register`: Validates user inputs, checks existing email, hashes password, saves user, returns user details + JWT.
   - `POST /api/auth/login`: Checks email and compares password with `bcrypt.compare`, returns user details + JWT.
   - `GET /api/auth/profile`: Protected route returning the current user's profile info.
2. **Note Controller & Routes ([noteController.js](file:///d:/Notes%20app/backend/controllers/noteController.js) & [noteRoutes.js](file:///d:/Notes%20app/backend/routes/noteRoutes.js))**:
   - `GET /api/notes`: Retrieves all notes where `user: req.user._id` (sorted by pinned notes first, then latest updated).
   - `POST /api/notes`: Creates a note tied to `req.user._id`.
   - `GET /api/notes/:id`: Retrieves a single note (verifying ownership).
   - `PUT /api/notes/:id`: Updates a note (verifying ownership).
   - `DELETE /api/notes/:id`: Deletes a note (verifying ownership).
3. **Admin Controller & Routes ([adminRoutes.js](file:///d:/Notes%20app/backend/routes/adminRoutes.js))**:
   - `GET /api/admin/users`: Protected by `authMiddleware` + `roleMiddleware('admin')` — lists all registered users.
   - `DELETE /api/admin/users/:id`: Allows admins to remove an account.
   - `GET /api/admin/stats`: Returns analytics (total users, total notes, active users).

---

### Phase 5: Frontend API Client & State Architecture
1. **API Client Setup ([api.js](file:///d:/Notes%20app/frontend/src/services/api.js))**:
   - Create Axios instance with `baseURL: 'http://localhost:5000/api'`.
   - Request interceptor: Automatically attaches `Authorization: Bearer <token>` from `localStorage`.
   - Response interceptor: Catches 401 errors and handles token expiration / auto-logout.
2. **Authentication State / Context**:
   - `AuthContext`: Tracks `user`, `token`, `isAuthenticated`, `isAdmin`, `loading`.
   - Methods: `login(email, password)`, `register(name, email, password)`, `logout()`.

---

### Phase 6: Pages & UI Implementation
1. **Routing & Protection ([App.jsx](file:///d:/Notes%20app/frontend/src/App.jsx))**:
   - Public Routes: `/login`, `/register`.
   - User Protected Routes: `/notes` (Redirects to `/login` if not authenticated).
   - Admin Protected Routes: `/admin` (Redirects to `/notes` or `/login` if not admin).
2. **Authentication Views ([Login.jsx](file:///d:/Notes%20app/frontend/src/pages/Login.jsx) & [Register.jsx](file:///d:/Notes%20app/frontend/src/pages/Register.jsx))**:
   - Sleek glassmorphism / modern dark-mode aesthetic.
   - Form state management, validation feedback, loading spinners, and error alerts.
3. **Notes Dashboard ([Notes.jsx](file:///d:/Notes%20app/frontend/src/pages/Notes.jsx))**:
   - Note creation and edit modal / inline editor.
   - Interactive search bar (search by keyword across title and content).
   - Filter by category/tags and toggle for pinned notes.
   - Responsive grid layout with smooth card transitions.
4. **Admin Dashboard ([AdminDashboard.jsx](file:///d:/Notes%20app/frontend/src/pages/AdminDashboard.jsx))**:
   - Overview metrics cards: Total Users, Total Notes, Admin Accounts.
   - User table with role badges, joined date, and action controls (delete user, change role).

---

## 4. API Specification Matrix

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/profile` | Authenticated | Get current user profile |
| `GET` | `/api/notes` | Authenticated (User) | Get all notes belonging to logged-in user |
| `POST` | `/api/notes` | Authenticated (User) | Create new note |
| `GET` | `/api/notes/:id` | Authenticated (Owner) | Get single note by ID |
| `PUT` | `/api/notes/:id` | Authenticated (Owner) | Update existing note |
| `DELETE` | `/api/notes/:id` | Authenticated (Owner) | Delete existing note |
| `GET` | `/api/admin/users` | Admin Only | View list of all system users |
| `DELETE` | `/api/admin/users/:id` | Admin Only | Delete a user account |
| `GET` | `/api/admin/stats` | Admin Only | Retrieve system-wide statistics |

---

## 5. Security & Best Practices Checklist

- [x] **Password Protection**: Passwords salted and hashed with `bcryptjs` (salt rounds: 10).
- [x] **Data Isolation**: Notes queries enforce `{ user: req.user._id }` so users cannot access each other's data.
- [x] **Token Safety**: JWT signed with high-entropy secret; payload contains only non-sensitive identifiers.
- [x] **Protected Routes**: Frontend guards against unauthorized views; Backend enforces verification on every endpoint.
- [x] **Sanitization & Error Handling**: Graceful error responses without leaking stack traces in production.
