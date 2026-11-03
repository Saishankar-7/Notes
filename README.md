# NotesApp — Full-Stack Notes Application with RBAC

A secure, modern, full-stack notes management application built with the **MERN** stack (MongoDB, Express.js, React 19, Node.js) and styled with **Tailwind CSS v4**. Features Role-Based Access Control (**RBAC**), real-time search, category filters, note pinning/starring, built-in templates, and an administrator management dashboard.

---

## 🌟 Key Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Multi-Role Security**: Two distinct user roles — `user` and `admin`.
- **JWT Authentication**: Secure JSON Web Token authentication with Bearer tokens stored in `localStorage` and verified via Axios interceptors.
- **Protected Routing**: Client-side route guards for standard and administrator access, paired with backend authorization middleware.
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (10 rounds).

### 📝 Notes Management
- **Full CRUD Operations**: Create, read, update, and delete personal notes with strict user-level data isolation.
- **Smart Filtering & Search**: Instant debounced search across note titles and content, alongside subject/category filters (`Work`, `Personal`, `Career, Resume`, `Study`, etc.).
- **Starred / Pinned Notes**: Pin important notes to display prominently at the top of the dashboard and in the quick-access sidebar.
- **Note Templates**: Built-in structured layouts for:
  - 📋 **Meeting Notes** (Agenda, discussion points, action items)
  - 🔬 **Study Guide / Lab** (Core concepts, formulas, summaries)
  - 🎯 **Project Plan** (Goals, milestones, risk mitigation)
  - 🧪 **Chemistry / Experiment Notes** (Reactions, observations, conclusion)
  - 📄 **Blank Note**

### 🛡️ Administrator Panel
- **System Metrics**: Real-time counter cards for total users, total notes, pinned notes, and admin accounts.
- **User Account Management**: View all registered users and their associated note counts.
- **Role Assignment**: Promote users to admins or demote admins to regular users.
- **Account Moderation**: Delete user accounts with automatic cascade deletion of all their notes (guarded by self-deletion and self-demotion protection).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router 7, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js, Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB fallback (`127.0.0.1:27017`) |
| **Dev Tools** | Nodemon, OxLint |

---

## 📁 Project Structure

```text
Notes app/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & Atlas fallback logic
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile logic
│   │   ├── noteController.js     # Notes CRUD, search, filter, pin toggle
│   │   └── adminController.js    # System stats, user moderation, role updates
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT validation & req.user attachment
│   │   └── roleMiddleware.js     # RBAC verification (adminOnly)
│   ├── models/
│   │   ├── User.js               # User schema & password hashing
│   │   └── Note.js               # Note schema with category, tags, and pin flags
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── noteRoutes.js         # /api/notes routes
│   │   └── adminRoutes.js        # /api/admin routes
│   ├── utils/
│   │   └── generateToken.js      # JWT signing utility
│   ├── .env.example              # Environment variables template
│   ├── server.js                 # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Header component
│   │   │   ├── NoteCard.jsx      # Note display card
│   │   │   ├── NoteModal.jsx     # Note editor dialog
│   │   │   ├── TemplateModal.jsx # Note templates picker
│   │   │   ├── SettingsModal.jsx # User profile & account details
│   │   │   └── ProtectedRoute.jsx# Auth & role route wrapper
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global auth provider & state
│   │   │   └── useAuth.js        # Auth hook
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Sign-in view
│   │   │   ├── Register.jsx      # Sign-up view (User / Admin toggle)
│   │   │   ├── Notes.jsx         # Main dashboard matching modern desktop UI
│   │   │   └── AdminDashboard.jsx# Admin metrics & user management
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptors
│   │   ├── App.jsx               # Client routes definition
│   │   ├── index.css             # Tailwind CSS v4 styling
│   │   └── main.jsx
│   ├── .env.example              # Frontend environment template
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account OR a local MongoDB instance running on port `27017`

### 2. Clone the Repository
```bash
git clone https://github.com/Saishankar-7/Notes.git
cd Notes
```

### 3. Backend Setup
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/notes_app?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

### 4. Frontend Setup
1. Open a new terminal, navigate to `frontend`, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create your frontend environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Verify `frontend/.env` points to your backend API:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend Vite development server:
   ```bash
   npm run dev
   # App will open at http://localhost:5173
   ```

---

## 📡 API Reference Matrix

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve logged-in user profile |

### Notes Endpoints (`/api/notes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notes` | Private | Get user notes (supports `search` & `category` queries) |
| `POST` | `/api/notes` | Private | Create a new note |
| `GET` | `/api/notes/:id` | Private (Owner) | Get single note by ID |
| `PUT` | `/api/notes/:id` | Private (Owner) | Update an existing note |
| `DELETE` | `/api/notes/:id` | Private (Owner) | Delete a note |
| `PATCH` | `/api/notes/:id/pin` | Private (Owner) | Toggle note pin/starred status |

### Admin Endpoints (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin Only | System-wide statistics (counts, distributions) |
| `GET` | `/api/admin/users` | Admin Only | List all registered users with note counts |
| `PATCH` | `/api/admin/users/:id/role` | Admin Only | Change user role (`user` &harr; `admin`) |
| `DELETE` | `/api/admin/users/:id` | Admin Only | Delete user account and cascade delete their notes |

---

## 🛡️ Security Best Practices
- **Never commit `.env` files**: All secrets, database connection strings, and JWT keys are excluded via `.gitignore`.
- **Ownership Verification**: All note updates, retrievals, and deletions enforce `{ user: req.user._id }` matching to prevent IDOR vulnerabilities.
- **Admin Self-Protection**: Admins cannot delete their own account or remove their own administrative privileges through the admin API.

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
