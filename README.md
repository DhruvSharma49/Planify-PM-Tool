<div align="center">

# ⚡ FlowSpace

### A professional, real-time collaborative project management platform

*Built with React · Express.js · Socket.io · MongoDB · JWT*

---

[![Node.js](https://img.shields.io/badge/Node.js-≥18.0-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socketdotio)](https://socket.io)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
   - [Running the App](#running-the-app)
   - [Database Seeding](#database-seeding)
6. [Architecture & Design](#-architecture--design)
   - [Backend Architecture](#backend-architecture)
   - [Database Schema](#database-schema)
   - [Authentication Flow](#authentication-flow)
   - [Real-Time Architecture](#real-time-architecture)
7. [API Reference](#-api-reference)
   - [Authentication API](#-authentication-api)
   - [Projects API](#-projects-api)
   - [Tasks API](#-tasks-api)
   - [Notifications API](#-notifications-api)
   - [Users API](#-users-api)
8. [Socket.io Events](#-socketio-events)
   - [Client to Server](#client-to-server-events)
   - [Server to Client](#server-to-client-events)
   - [Connection & Auth](#connection--authentication)
9. [Data Models](#-data-models)
10. [Security](#-security)
11. [Email Notifications](#-email-notifications)
12. [File Uploads](#-file-uploads)
13. [Frontend Integration Guide](#-frontend-integration-guide)
14. [Deployment](#-deployment)
15. [Error Handling](#-error-handling)
16. [Testing](#-testing)
17. [Contributing](#-contributing)
18. [Troubleshooting](#-troubleshooting)

---

## 🌟 Project Overview

FlowSpace is a **production-grade, full-stack project management tool** inspired by Trello and Asana. It enables teams to collaborate in real time, organize work into Kanban-style boards, assign and track tasks, leave comments, receive live notifications, and manage project membership — all from a modern, polished interface.

The platform is designed with scalability, security, and developer experience in mind. Every mutation on the backend is simultaneously broadcast to all connected project members via **Socket.io**, so every user always sees the latest state without refreshing.

### What makes FlowSpace different

- **True real-time collaboration** — every task move, edit, comment, and notification is pushed instantly to all connected clients
- **Rich task model** — tasks support assignees, priorities, due dates, tags, checklists, file attachments, subtask relationships, and a full audit activity log
- **Role-based project access** — four permission tiers (owner, admin, member, viewer) control who can do what
- **Email + in-app notifications** — users are notified via Socket.io in real time AND by email for key events like task assignment
- **Full-text search** — MongoDB text indexes power fast search across task titles, descriptions, and tags
- **Secure by default** — Helmet, rate limiting, bcrypt, JWT refresh flow, MIME-type allowlisting, and input sanitization built in

---

## ✨ Features

### User Management
- [x] Registration with welcome email
- [x] Login with JWT access + refresh token pair
- [x] Password reset via secure email token
- [x] Profile update (name, avatar, color, notification preferences)
- [x] Password change with current password verification
- [x] Soft deactivation (isActive flag)
- [x] Last-seen tracking per socket connection

### Projects
- [x] Create, read, update, delete projects
- [x] Custom emoji, color, and description per project
- [x] Visibility settings (private / team / public)
- [x] Customizable Kanban columns (add, rename, reorder, delete)
- [x] Member management with role-based permissions
- [x] Full project activity feed
- [x] Archive and complete status

### Tasks
- [x] Create, read, update, delete tasks
- [x] Drag-and-drop move between columns (real-time sync)
- [x] Priority levels: low / medium / high / urgent
- [x] Assignees (multiple users per task)
- [x] Due dates, start dates, estimated and logged hours
- [x] Tags and labels
- [x] Interactive checklist with per-item completion tracking
- [x] File attachments (images, PDFs, documents)
- [x] Subtask relationships (parent/child)
- [x] Blocked-by / blocks task relationships
- [x] Per-task activity audit log
- [x] Full-text search across title, description, and tags
- [x] Archive tasks

### Comments
- [x] Post, edit, and delete comments on tasks
- [x] File attachment per comment
- [x] Edit history tracking
- [x] Real-time comment push to all project members

### Notifications
- [x] Real-time in-app notifications via Socket.io
- [x] Email notifications (task assigned, comment added)
- [x] Mark individual or all notifications as read
- [x] Auto-delete read notifications after 30 days (MongoDB TTL)
- [x] Unread count badge

### Real-Time Collaboration
- [x] Live task board updates across all connected sessions
- [x] Typing indicators while composing comments
- [x] User presence (online/away/offline)
- [x] Socket.io rooms per project for scoped broadcasting

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js >= 18 | JavaScript server runtime |
| **Framework** | Express.js 4.18 | HTTP server and routing |
| **Real-Time** | Socket.io 4.7 | WebSocket abstraction |
| **Database** | MongoDB + Mongoose 8 | Document store and ODM |
| **Auth** | JSON Web Tokens (jsonwebtoken) | Stateless authentication |
| **Passwords** | bcryptjs | Secure password hashing |
| **Validation** | express-validator | Input validation and sanitization |
| **Email** | Nodemailer | Transactional emails |
| **File Upload** | Multer | Multipart form handling |
| **Logging** | Winston | Structured logging |
| **Security** | Helmet, express-rate-limit, CORS | HTTP hardening |
| **Dev** | Nodemon | Hot reload during development |

---

## 📁 Project Structure

```
flowspace-backend/
│
├── config/
│   └── db.js                        # MongoDB connection with reconnect logic
│
├── src/
│   ├── server.js                    # App entry: Express + Socket.io + graceful shutdown
│   │
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                  # Users, bcrypt hooks, reset token helpers
│   │   ├── Project.js               # Projects, columns (sub-docs), members, activity
│   │   ├── Task.js                  # Tasks, comments, checklist, attachments, relations
│   │   └── Notification.js          # Notifications with TTL auto-delete
│   │
│   ├── controllers/                 # Business logic (thin routes, fat controllers)
│   │   ├── authController.js        # register, login, refresh, me, changePassword,
│   │   │                            #   forgotPassword, resetPassword, logout
│   │   ├── projectController.js     # CRUD, members, columns, activity feed
│   │   ├── taskController.js        # CRUD, move, search, comments, checklist,
│   │   │                            #   attachments, full-text search
│   │   └── notificationController.js# list, markRead, markAllRead, clear, delete
│   │
│   ├── routes/                      # Express routers
│   │   ├── auth.js                  # /api/auth/*
│   │   ├── projects.js              # /api/projects/*
│   │   ├── tasks.js                 # /api/projects/:projectId/tasks/*
│   │   └── other.js                 # /api/notifications/* and /api/users/*
│   │
│   ├── middleware/
│   │   ├── auth.js                  # protect(), optionalAuth(), requireRole(),
│   │   │                            #   requireProjectAccess(), socketAuth()
│   │   ├── errorHandler.js          # asyncHandler(), AppError, global error handler
│   │   ├── upload.js                # Multer config with MIME allowlist
│   │   └── validators.js            # Reusable express-validator rule sets
│   │
│   └── utils/
│       ├── logger.js                # Winston logger (console + file transports)
│       ├── email.js                 # Nodemailer + HTML email templates
│       ├── socket.js                # Socket.io init, room helpers, notification emitter
│       └── seed.js                  # Database seeder with demo users and projects
│
├── uploads/                         # Uploaded files (auto-created)
├── logs/                            # Log files (auto-created)
├── .env.example                     # Environment variable template
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have:

| Requirement | Version | Install |
|---|---|---|
| **Node.js** | >= 18.0.0 | [nodejs.org](https://nodejs.org) |
| **npm** | >= 9.0 | Bundled with Node.js |
| **MongoDB** | >= 6.0 | [mongodb.com](https://mongodb.com) or Atlas |
| **Git** | any | [git-scm.com](https://git-scm.com) |

> **Tip:** For MongoDB, you can use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available) instead of a local installation. Just paste your connection string into `.env`.

---

### Installation

**Step 1 — Clone the repository**
```bash
git clone https://github.com/your-org/flowspace.git
cd flowspace/flowspace-backend
```

**Step 2 — Install dependencies**
```bash
npm install
```

**Step 3 — Set up environment variables**
```bash
cp .env.example .env
```
Then open `.env` in your editor and fill in the values (see [Environment Variables](#environment-variables) below).

**Step 4 — Create required directories**

These are created automatically on first run, but you can create them manually:
```bash
mkdir -p uploads logs
```

---

### Environment Variables

Copy `.env.example` to `.env` and configure each variable:

```env
# ─── Server ────────────────────────────────────────────────
NODE_ENV=development          # development | production | test
PORT=5000                     # HTTP server port

# ─── MongoDB ───────────────────────────────────────────────
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/flowspace
# MongoDB Atlas (recommended for production):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/flowspace

# ─── JWT ───────────────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-32-characters-long
JWT_EXPIRES_IN=7d             # Access token lifetime
JWT_REFRESH_SECRET=another-secret-key-for-refresh-tokens-also-32-chars
JWT_REFRESH_EXPIRES_IN=30d    # Refresh token lifetime

# ─── Client ────────────────────────────────────────────────
CLIENT_URL=http://localhost:3000   # Your frontend URL (for CORS + email links)

# ─── Email (Nodemailer) ────────────────────────────────────
# Development: use Mailtrap (https://mailtrap.io) — free tier available
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
EMAIL_FROM=noreply@flowspace.app
EMAIL_FROM_NAME=FlowSpace

# ─── File Uploads ──────────────────────────────────────────
UPLOAD_PATH=uploads            # Relative directory for uploaded files
MAX_FILE_SIZE=10485760         # 10 MB in bytes

# ─── Rate Limiting ─────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes in milliseconds
RATE_LIMIT_MAX=100             # Max requests per window per IP
```

> **Security note:** Never commit your `.env` file. It is listed in `.gitignore`.

---

### Running the App

**Development** (with hot reload via nodemon):
```bash
npm run dev
```

**Production:**
```bash
npm start
```

**Verify the server is running:**
```bash
curl http://localhost:5000/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "FlowSpace API",
  "timestamp": "2026-02-19T10:00:00.000Z",
  "uptime": 12.5,
  "env": "development"
}
```

---

### Database Seeding

Run the seeder to populate your database with demo data:

```bash
npm run seed
```

This creates:
- **4 demo users** with hashed passwords
- **3 sample projects** (Website Redesign, Mobile App v2.0, Q1 Marketing)
- **9 sample tasks** spread across projects and columns
- **Project members** and activity entries

| Name | Email | Password | Role |
|---|---|---|---|
| Alex Chen | alex@example.com | password123 | Owner |
| Maya Patel | maya@example.com | password123 | Admin |
| Jordan Lee | jordan@example.com | password123 | Member |
| Sam Rivera | sam@example.com | password123 | Member |

> **Warning:** The seeder deletes ALL existing data before inserting. Only run it on a fresh or development database.

---

## 🏛 Architecture & Design

### Backend Architecture

FlowSpace follows a **layered MVC architecture** with clean separation of concerns:

```
HTTP Request
     |
     v
  Express Router          (routes/*.js)
     |  matches path + method, applies middleware chain
     v
  Middleware Stack
  |-- CORS, Helmet, Morgan, Rate Limiter
  |-- Body parser (JSON)
  |-- protect() — JWT verification
  |-- requireProjectAccess() — role check
  +-- Validators — input sanitization
     |
     v
  Controller              (controllers/*.js)
  |-- Business logic
  |-- Database operations via Mongoose
  |-- Socket.io event emission
  +-- Email triggers (non-blocking)
     |
     v
  Mongoose Model          (models/*.js)
  |-- Schema validation
  |-- Pre-save hooks (hashing, auto-fields)
  +-- Virtual properties
     |
     v
  MongoDB Atlas / Local
```

### Database Schema

```
+-------------------------------------------------------------+
|  USER                                                        |
|  _id, name, email, password*, color, initials, avatar       |
|  role, isActive, lastSeen, notifications{}, socketIds[]     |
|  passwordResetToken, passwordResetExpires                   |
+---------------------------+---------------------------------+
                            | owner / members[]
                            v
+-------------------------------------------------------------+
|  PROJECT                                                     |
|  _id, name, description, emoji, color, status, visibility   |
|  owner -> User                                              |
|  members[] -> { user -> User, role, joinedAt }             |
|  columns[] -> { _id, title, position, color }              |
|  activity[] -> { user -> User, action, entity, meta }      |
|  dueDate, tags[], settings{}                               |
+---------------------------+---------------------------------+
                            | project / column
                            v
+-------------------------------------------------------------+
|  TASK                                                        |
|  _id, title, description, project -> Project               |
|  column -> Column._id, position, status, priority          |
|  assignees[] -> User, reporter -> User                     |
|  dueDate, startDate, completedAt, estimatedHours           |
|  tags[], labels[]                                          |
|  checklist[] -> { text, completed, completedBy, completedAt}|
|  comments[]  -> { author -> User, text, edited, attachments}|
|  attachments[] -> { uploadedBy, filename, url, mimetype }  |
|  activity[] -> { user, action, field, oldValue, newValue } |
|  parentTask -> Task, subtasks[] -> Task                    |
|  blockedBy[] -> Task, blocks[] -> Task                     |
+-------------------------------------------------------------+
                            | recipient / task / project
                            v
+-------------------------------------------------------------+
|  NOTIFICATION                                                |
|  _id, recipient -> User, sender -> User                    |
|  type, title, message, link, isRead                        |
|  project -> Project, task -> Task, meta{}                  |
|  createdAt  (TTL: auto-deleted after 30 days)              |
+-------------------------------------------------------------+
```

### Authentication Flow

```
Client                   FlowSpace API                  MongoDB
  |                            |                            |
  |  POST /api/auth/login      |                            |
  |  { email, password }       |                            |
  |--------------------------->|                            |
  |                            |  findOne({ email })        |
  |                            |--------------------------->|
  |                            |<---------------------------|
  |                            |  bcrypt.compare()          |
  |                            |  generateTokenPair()       |
  |<---------------------------|                            |
  |  { accessToken (7d),       |                            |
  |    refreshToken (30d) }    |                            |
  |                            |                            |
  |  GET /api/projects         |                            |
  |  Authorization:            |                            |
  |  Bearer <accessToken>      |                            |
  |--------------------------->|                            |
  |                            |  jwt.verify()              |
  |                            |  User.findById()           |
  |                            |--------------------------->|
  |<---------------------------|<---------------------------|
  |  { projects: [...] }       |                            |
  |                            |                            |
  |  POST /api/auth/           |                            |
  |    refresh-token           |                            |
  |  { refreshToken }          |                            |
  |--------------------------->|                            |
  |                            |  jwt.verify(refreshSecret) |
  |<---------------------------|                            |
  |  { accessToken (new) }     |                            |
```

**Token storage recommendation for the frontend:**
- Store `accessToken` in memory (React state / Zustand)
- Store `refreshToken` in an `httpOnly` cookie or `localStorage`
- Intercept 401 responses to trigger a token refresh automatically

### Real-Time Architecture

```
+--------------------------------------------------------------+
|                    Socket.io Server                          |
|                                                              |
|  Namespace: /  (default)                                     |
|                                                              |
|  Rooms:                                                      |
|  +-- user:<userId>        personal notifications            |
|  +-- project:<projectId>  project-wide events               |
|                                                              |
|  Middleware: socketAuth() -- verifies JWT on connect        |
+-----------------------------+--------------------------------+
                              |
         +--------------------+--------------------+
         |                    |                    |
    +----+----+          +----+----+          +----+----+
    |  Alex   |          |  Maya   |          | Jordan  |
    | Browser |          | Browser |          | Browser |
    |         |          |         |          |         |
    | rooms:  |          | rooms:  |          | rooms:  |
    | project |          | project |          | project |
    |  :p1    |          |  :p1    |          |  :p1    |
    +---------+          +---------+          +---------+

When Alex moves a task in project p1:
  1. PATCH /api/projects/p1/tasks/t1/move  ->  Controller
  2. Controller saves to MongoDB
  3. emitToProject(io, 'p1', 'task:moved', task)
  4. Maya and Jordan both receive 'task:moved' instantly
  5. Their boards update without a page refresh
```

---

## 📡 API Reference

All API endpoints are prefixed with `/api`. All protected endpoints (marked with a lock) require an `Authorization: Bearer <accessToken>` header.

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    { "field": "email", "message": "Valid email required" }
  ]
}
```

**HTTP Status Codes used:**

| Code | Meaning |
|---|---|
| 200 | OK — successful GET, PATCH, DELETE |
| 201 | Created — successful POST |
| 400 | Bad Request — invalid input |
| 401 | Unauthorized — missing/expired token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 409 | Conflict — duplicate (e.g. email already exists) |
| 415 | Unsupported Media Type — invalid file type |
| 422 | Unprocessable Entity — validation failed |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error |

---

### 🔐 Authentication API

Base path: `/api/auth`

---

#### `POST /api/auth/register`

Create a new account. Sends a welcome email asynchronously.

**Request body:**
```json
{
  "name": "Alex Chen",
  "email": "alex@example.com",
  "password": "mypassword123"
}
```

**Validation rules:**
- `name`: 2–60 characters, required
- `email`: valid email format, unique, required
- `password`: minimum 6 characters, required

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "_id": "64abc123def456",
      "name": "Alex Chen",
      "email": "alex@example.com",
      "color": "#6c63ff",
      "initials": "AC",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error responses:**
- `409` — Email already in use
- `422` — Validation failed

---

#### `POST /api/auth/login`

Authenticate with email and password.

**Request body:**
```json
{
  "email": "alex@example.com",
  "password": "mypassword123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": {
      "_id": "64abc123def456",
      "name": "Alex Chen",
      "email": "alex@example.com",
      "color": "#6c63ff",
      "initials": "AC",
      "role": "user",
      "avatar": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error responses:**
- `401` — Invalid email or password
- `403` — Account deactivated

---

#### `POST /api/auth/refresh-token`

Exchange a valid refresh token for a new access token.

**Request body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### `GET /api/auth/me` (Protected)

Get the currently authenticated user's profile.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64abc123def456",
      "name": "Alex Chen",
      "email": "alex@example.com",
      "color": "#6c63ff",
      "initials": "AC",
      "role": "user",
      "avatar": "/uploads/avatar-uuid.jpg",
      "lastSeen": "2026-02-19T10:30:00.000Z",
      "notifications": {
        "taskAssigned": true,
        "taskCommented": true,
        "taskMoved": true,
        "projectInvite": true
      },
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

---

#### `PATCH /api/auth/me` (Protected)

Update user profile. Use `multipart/form-data` to include an avatar file.

**Request body (JSON or form-data):**
```json
{
  "name": "Alexander Chen",
  "color": "#22d3a5",
  "notifications": {
    "taskAssigned": true,
    "taskCommented": false
  }
}
```

Or with file upload (multipart/form-data):
```
name=Alexander Chen
avatar=<file>
```

**Response `200`:** Updated user object.

---

#### `PATCH /api/auth/change-password` (Protected)

Change password. Returns new token pair to keep session active.

**Request body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepass123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

#### `POST /api/auth/forgot-password`

Trigger a password reset email. Always returns 200 to prevent email enumeration.

**Request body:**
```json
{ "email": "alex@example.com" }
```

**Response `200`:**
```json
{
  "success": true,
  "message": "If that email exists, a reset link has been sent."
}
```

---

#### `PATCH /api/auth/reset-password/:token`

Reset password using the token from the email link. Token expires after 1 hour.

**URL param:** `:token` — the raw token from the reset email link

**Request body:**
```json
{
  "password": "mynewpassword123",
  "confirmPassword": "mynewpassword123"
}
```

**Response `200`:** New token pair (logs the user in automatically).

---

#### `POST /api/auth/logout` (Protected)

Signal logout. For stateless JWT, token invalidation happens client-side.

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

### 📁 Projects API

Base path: `/api/projects` — All routes require authentication.

#### Role Hierarchy

```
owner -----> admin -----> member -----> viewer
  |            |            |            |
  +- delete    +- update    +- create    +- read
     project      project      tasks        only
                  add/remove   add
                  members      comments
```

---

#### `GET /api/projects`

Get all projects where the user is owner or member.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "64abc123",
        "name": "Website Redesign",
        "description": "Complete overhaul of marketing site",
        "emoji": "🎨",
        "color": "#6c63ff",
        "status": "active",
        "visibility": "team",
        "owner": { "_id": "...", "name": "Alex Chen", "initials": "AC", "color": "#6c63ff" },
        "members": [
          { "user": { "_id": "...", "name": "Maya Patel" }, "role": "admin", "joinedAt": "..." }
        ],
        "columns": [
          { "_id": "col1", "title": "To Do", "position": 0, "color": "#6c63ff" },
          { "_id": "col2", "title": "In Progress", "position": 1, "color": "#22d3a5" }
        ],
        "memberCount": 3,
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-02-19T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### `POST /api/projects`

Create a new project. Creator is automatically set as owner.

**Request body:**
```json
{
  "name": "My New Project",
  "description": "Optional project description",
  "emoji": "🚀",
  "color": "#6c63ff",
  "visibility": "team"
}
```

| Field | Type | Required | Options |
|---|---|---|---|
| `name` | string | Yes | 1–100 chars |
| `description` | string | No | max 500 chars |
| `emoji` | string | No | any emoji character |
| `color` | string | No | hex color, e.g. `#6c63ff` |
| `visibility` | string | No | `private`, `team`, `public` |

**Response `201`:** Full project object with default columns (To Do, In Progress, In Review, Done).

---

#### `GET /api/projects/:projectId` (viewer+)

Get a single project with full details.

**Response `200`:** Full project with populated members, columns, and last 50 activity entries.

---

#### `PATCH /api/projects/:projectId` (admin+)

Update project settings. Include only the fields you want to change.

**Request body (any subset):**
```json
{
  "name": "Updated Name",
  "description": "New description",
  "emoji": "🛠️",
  "color": "#22d3a5",
  "status": "completed",
  "visibility": "private",
  "dueDate": "2026-06-01",
  "tags": ["q1", "design"],
  "settings": {
    "allowMemberInvite": false,
    "defaultTaskPriority": "high"
  }
}
```

**Response `200`:** Updated project. Broadcasts `project:updated` to all project members via Socket.io.

---

#### `DELETE /api/projects/:projectId` (owner only)

Permanently delete a project and all its tasks.

**Response `200`:** `{ "success": true, "message": "Project deleted." }`

Broadcasts `project:deleted` to all project members before deletion.

---

#### `GET /api/projects/:projectId/activity` (viewer+)

Get the project's activity feed (last 50 entries, newest first).

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "activity": [
      {
        "_id": "...",
        "user": { "name": "Alex Chen", "initials": "AC", "color": "#6c63ff" },
        "action": "moved \"Design homepage\" to \"In Review\"",
        "entity": "task",
        "entityId": "...",
        "entityName": "Design homepage",
        "createdAt": "2026-02-19T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### `POST /api/projects/:projectId/members` (admin+)

Invite a user to the project by email address.

**Request body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**`role` options:** `member` (default), `admin`, `viewer`

**Response `200`:** Updated project with populated members.

Side effects:
- Broadcasts `project:member-added` Socket.io event
- Creates an in-app `project_invite` notification for the new member

**Error responses:**
- `404` — No user found with that email
- `409` — User is already a member

---

#### `DELETE /api/projects/:projectId/members/:userId` (admin+)

Remove a member from the project.

**Response `200`:** `{ "success": true, "message": "Member removed." }`

---

#### `POST /api/projects/:projectId/columns` (admin+)

Add a new column to the board.

**Request body:**
```json
{
  "title": "Blocked",
  "color": "#f43f5e"
}
```

**Response `200`:** `{ "success": true, "data": { "columns": [ ] } }`

---

#### `PATCH /api/projects/:projectId/columns/:columnId` (admin+)

Edit a column's title, color, or position.

**Request body (any subset):**
```json
{
  "title": "Done",
  "color": "#22d3a5",
  "position": 3
}
```

---

#### `DELETE /api/projects/:projectId/columns/:columnId` (admin+)

Delete a column. Tasks in the deleted column are automatically moved to the first remaining column. If no other columns exist, tasks are deleted.

---

### ✅ Tasks API

Base path: `/api/projects/:projectId/tasks`

All routes require authentication and at least **viewer** access to the project.

---

#### `GET /api/projects/:projectId/tasks`

List tasks in a project with optional filters. Results are sorted by position, then creation date.

**Query params:**

| Param | Type | Description | Example |
|---|---|---|---|
| `columnId` | string | Filter by column | `?columnId=64abc...` |
| `priority` | string | Filter by priority | `?priority=high` |
| `assignee` | string | Filter by assignee userId | `?assignee=64def...` |
| `tag` | string | Filter by tag | `?tag=design` |
| `search` | string | Full-text search | `?search=homepage` |
| `page` | number | Pagination page (default: 1) | `?page=2` |
| `limit` | number | Results per page (default: 100) | `?limit=20` |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "tasks": [ ],
    "total": 42,
    "page": 1,
    "pages": 3
  }
}
```

---

#### `POST /api/projects/:projectId/tasks` (member+)

Create a new task.

**Request body:**
```json
{
  "title": "Design new homepage",
  "description": "Create mockups for the hero, features, and CTA sections",
  "columnId": "64col1id...",
  "priority": "high",
  "assignees": ["64user1id...", "64user2id..."],
  "dueDate": "2026-03-15",
  "startDate": "2026-02-20",
  "tags": ["design", "ui", "frontend"],
  "estimatedHours": 12
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | 1–200 characters |
| `description` | string | No | max 5000 characters |
| `columnId` | string | Yes | Must be a column ID in this project |
| `priority` | string | No | `low`, `medium` (default), `high`, `urgent` |
| `assignees` | string[] | No | Array of user ObjectIds |
| `dueDate` | ISO date | No | `YYYY-MM-DD` or full ISO string |
| `tags` | string[] | No | Lowercased, trimmed automatically |
| `estimatedHours` | number | No | Positive number |

**Response `201`:** Full task with populated assignees and reporter.

Side effects:
- Broadcasts `task:created` to all project room members
- Creates `task_assigned` notifications for all assignees
- Sends assignment emails (non-blocking)

---

#### `GET /api/projects/:projectId/tasks/search`

Full-text search across task titles, descriptions, and tags using MongoDB text indexes. Results sorted by relevance score.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `q` | string | Search query (at least one filter required) |
| `priority` | string | Filter by priority level |
| `assignee` | string | Filter by user ObjectId |
| `tag` | string | Exact tag match |
| `status` | string | `todo`, `in_progress`, `in_review`, `done` |
| `dueBefore` | ISO date | Tasks due before this date |
| `dueAfter` | ISO date | Tasks due after this date |

**Response `200`:** `{ "data": { "tasks": [ ], "total": 12 } }`

---

#### `GET /api/projects/:projectId/tasks/:taskId`

Get a single task with complete details including comments, checklist, attachments, activity log, and related task references.

**Response `200`:** Full task object (see Data Models section for complete shape).

---

#### `PATCH /api/projects/:projectId/tasks/:taskId` (member+)

Update any task field. The activity log is automatically updated for each changed field.

**Request body (any subset):**
```json
{
  "title": "Updated title",
  "description": "New description",
  "priority": "urgent",
  "dueDate": "2026-03-20",
  "assignees": ["64user1...", "64user3..."],
  "tags": ["design", "urgent"],
  "estimatedHours": 16,
  "loggedHours": 5
}
```

Side effects:
- Broadcasts `task:updated` to the project room
- Creates `task_assigned` notifications for newly added assignees

---

#### `PATCH /api/projects/:projectId/tasks/:taskId/move` (member+)

Move a task to a different column (Kanban drag-and-drop). Automatically syncs the `status` field based on column position.

**Request body:**
```json
{
  "columnId": "64col2id...",
  "position": 0
}
```

**Response `200`:** Updated task.

Side effects:
- Broadcasts `task:moved` with `fromColumnId` and `toColumnId`
- Creates `task_moved` notifications for assignees
- Updates task `status` based on column position (col 0=todo, 1=in_progress, 2=in_review, 3=done)
- Sets `completedAt` timestamp if moved to done column

---

#### `DELETE /api/projects/:projectId/tasks/:taskId` (member+)

Permanently delete a task.

**Response `200`:** `{ "success": true, "message": "Task deleted." }`

Broadcasts `task:deleted` to the project room.

---

#### `POST /api/projects/:projectId/tasks/:taskId/comments` (member+)

Add a comment to a task. Optionally attach a single file using `multipart/form-data`.

**Request body (JSON):**
```json
{ "text": "This looks great! Moving to review." }
```

**Request body (multipart/form-data with attachment):**
```
text=My comment with file
attachment=<file>
```

**Response `201`:** The new comment with populated author.

Side effects:
- Broadcasts `task:comment-added` to the project room
- Creates `task_commented` notifications for task assignees
- Sends comment notification emails (non-blocking)

---

#### `PATCH /api/projects/:projectId/tasks/:taskId/comments/:commentId` (member+)

Edit your own comment. Admins and owners can edit any comment. Sets `edited: true` and records `editedAt`.

**Request body:**
```json
{ "text": "Updated comment text" }
```

Broadcasts `task:comment-edited` to the project room.

---

#### `DELETE /api/projects/:projectId/tasks/:taskId/comments/:commentId` (member+)

Delete a comment. Users can only delete their own comments. Admins and owners can delete any comment.

Broadcasts `task:comment-deleted` to the project room.

---

#### `POST /api/projects/:projectId/tasks/:taskId/checklist` (member+)

Add a checklist item to a task.

**Request body:**
```json
{ "text": "Write unit tests" }
```

**Response `201`:** `{ "data": { "checklist": [ ] } }`

---

#### `PATCH /api/projects/:projectId/tasks/:taskId/checklist/:itemId` (member+)

Toggle a checklist item's completion state. Records which user completed it and when.

**Response `200`:** `{ "data": { "checklist": [ ] } }`

---

#### `POST /api/projects/:projectId/tasks/:taskId/attachments` (member+)

Upload a file attachment to a task. Use `multipart/form-data` with field name `file`.

**Allowed file types:**
- Images: `jpg`, `png`, `gif`, `webp`
- Documents: `pdf`, `doc`, `docx`, `xls`, `xlsx`
- Text: `txt`, `csv`
- Archives: `zip`

**Max size:** 10 MB (configurable via `MAX_FILE_SIZE` env var)

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "attachment": {
      "_id": "...",
      "originalName": "design-spec.pdf",
      "url": "/uploads/a1b2c3d4.pdf",
      "mimetype": "application/pdf",
      "size": 512000,
      "uploadedBy": "...",
      "uploadedAt": "2026-02-19T10:00:00.000Z"
    }
  }
}
```

Broadcasts `task:attachment-added` to the project room.

---

### 🔔 Notifications API

Base path: `/api/notifications` — All routes require authentication.

---

#### `GET /api/notifications`

Get paginated notification list for the current user.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 30) |
| `unreadOnly` | boolean | Pass `true` to show only unread notifications |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "...",
        "type": "task_assigned",
        "title": "You were assigned a task",
        "message": "Alex Chen assigned you to \"Design homepage\"",
        "link": "/projects/64proj.../tasks/64task...",
        "isRead": false,
        "sender": { "name": "Alex Chen", "initials": "AC", "color": "#6c63ff" },
        "project": { "name": "Website Redesign", "emoji": "🎨" },
        "task": { "title": "Design homepage" },
        "createdAt": "2026-02-19T10:00:00.000Z"
      }
    ],
    "total": 14,
    "unreadCount": 5,
    "page": 1
  }
}
```

**Notification types:**

| Type | When it fires |
|---|---|
| `task_assigned` | You are assigned to a task |
| `task_unassigned` | You are removed from a task |
| `task_commented` | Someone comments on your task |
| `task_moved` | Your task is moved to a new column |
| `task_completed` | A task you are assigned to is completed |
| `task_due_soon` | Task is due within 48 hours |
| `task_overdue` | Task is past its due date |
| `project_invite` | You are added to a project |
| `project_update` | Project settings are changed |
| `mention` | You are mentioned in a comment |

---

#### `PATCH /api/notifications/read-all`

Mark all of the current user's notifications as read.

**Response `200`:** `{ "message": "X notifications marked as read." }`

---

#### `PATCH /api/notifications/:id/read`

Mark a single notification as read.

---

#### `DELETE /api/notifications/:id`

Delete a single notification.

---

#### `DELETE /api/notifications`

Clear (delete) all notifications for the current user.

---

### 👥 Users API

Base path: `/api/users` — All routes require authentication.

---

#### `GET /api/users/search?q=query`

Search for users by name or email. Used for inviting members to projects or assigning tasks.

**Query params:**
- `q` — search string (minimum 2 characters required)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "Maya Patel",
        "email": "maya@example.com",
        "initials": "MP",
        "color": "#22d3a5",
        "avatar": null
      }
    ]
  }
}
```

Returns up to 10 results.

---

#### `GET /api/users/:userId`

Get a user's public profile.

**Response `200`:** Name, email, initials, color, avatar, lastSeen, role.

---

## 🔌 Socket.io Events

### Connection & Authentication

Connect with your JWT access token in the handshake `auth` field:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('accessToken')
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  // Join rooms for each of the user's projects
  myProjects.forEach(p => socket.emit('join:project', p._id));
});

socket.on('connect_error', (err) => {
  console.error('Connection failed:', err.message);
  // Handle expired token
  if (err.message === 'Invalid token') {
    refreshAccessToken().then(newToken => {
      socket.auth.token = newToken;
      socket.connect();
    });
  }
});
```

---

### Client to Server Events

Events your frontend sends to the server:

| Event | Payload | Description |
|---|---|---|
| `join:project` | `projectId: string` | Subscribe to all events in a project room |
| `leave:project` | `projectId: string` | Unsubscribe from a project room |
| `typing:start` | `{ taskId, projectId }` | Broadcast typing indicator to project room |
| `typing:stop` | `{ taskId, projectId }` | Broadcast that typing has stopped |
| `presence:update` | `{ projectId, status }` | Share your presence status |

```javascript
// Typing indicator with debounce
let typingTimer;
commentInput.addEventListener('input', () => {
  socket.emit('typing:start', { taskId, projectId });
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('typing:stop', { taskId, projectId });
  }, 2000);
});

// Presence status
document.addEventListener('visibilitychange', () => {
  socket.emit('presence:update', {
    projectId,
    status: document.hidden ? 'away' : 'online'
  });
});
```

---

### Server to Client Events

Events the server pushes to your frontend:

#### Task Events

| Event | Payload | Description |
|---|---|---|
| `task:created` | `{ task, columnId }` | A new task was added to a column |
| `task:updated` | `Task` | Task fields were modified |
| `task:moved` | `{ task, fromColumnId, toColumnId }` | Task changed columns |
| `task:deleted` | `{ taskId, columnId }` | Task was permanently deleted |
| `task:comment-added` | `{ taskId, comment }` | New comment was posted |
| `task:comment-edited` | `{ taskId, comment }` | Existing comment was edited |
| `task:comment-deleted` | `{ taskId, commentId }` | Comment was removed |
| `task:checklist-updated` | `{ taskId, checklist }` | Checklist item was toggled |
| `task:attachment-added` | `{ taskId, attachment }` | File was attached to task |

#### Project Events

| Event | Payload | Description |
|---|---|---|
| `project:created` | `Project` | A new project was created |
| `project:updated` | `Project` | Project settings were changed |
| `project:deleted` | `{ projectId }` | Project was permanently deleted |
| `project:member-added` | `{ project, newMember }` | A new member joined |
| `project:member-removed` | `{ projectId, userId }` | A member was removed |

#### Column Events

| Event | Payload | Description |
|---|---|---|
| `column:added` | `{ projectId, columns }` | New column was created |
| `column:updated` | `{ projectId, columns }` | Column was renamed or recolored |
| `column:deleted` | `{ projectId, columnId }` | Column was removed |

#### Notification and Presence Events

| Event | Payload | Description |
|---|---|---|
| `notification:new` | `Notification` | A new notification for the current user |
| `user:typing` | `{ taskId, user: { _id, name, initials, color } }` | A user started typing |
| `user:stopped-typing` | `{ taskId, userId }` | A user stopped typing |
| `presence:changed` | `{ userId, status, name }` | A user's presence status changed |

```javascript
// Handle all board events
socket.on('task:created', ({ task, columnId }) => {
  boardStore.addTask(columnId, task);
});

socket.on('task:moved', ({ task, fromColumnId, toColumnId }) => {
  boardStore.moveTask(task._id, fromColumnId, toColumnId, task);
});

socket.on('task:updated', (task) => {
  boardStore.updateTask(task._id, task);
});

socket.on('task:deleted', ({ taskId, columnId }) => {
  boardStore.removeTask(columnId, taskId);
});

socket.on('task:comment-added', ({ taskId, comment }) => {
  if (openTaskModal?.id === taskId) {
    commentList.prepend(comment);
  }
});

// Handle notifications
socket.on('notification:new', (notification) => {
  notificationStore.prepend(notification);
  showToast(notification.message);
  incrementBadgeCount();
});

// Typing indicators
socket.on('user:typing', ({ taskId, user }) => {
  if (taskId === currentTaskId) {
    setTypingUsers(prev => ({ ...prev, [user._id]: user }));
  }
});

socket.on('user:stopped-typing', ({ taskId, userId }) => {
  setTypingUsers(prev => {
    const next = { ...prev };
    delete next[userId];
    return next;
  });
});
```

---

## 🗄️ Data Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String,               // 2–60 chars, required
  email: String,              // unique, lowercase, indexed
  password: String,           // bcrypt hashed, never returned in queries
  avatar: String,             // URL to uploaded avatar
  color: String,              // hex color for UI (#6c63ff)
  initials: String,           // auto-generated from name (e.g. "AC")
  role: 'user' | 'admin',
  isActive: Boolean,
  lastSeen: Date,
  socketIds: [String],        // currently connected socket IDs
  notifications: {
    taskAssigned: Boolean,
    taskCommented: Boolean,
    taskMoved: Boolean,
    projectInvite: Boolean,
  },
  passwordResetToken: String, // SHA256 hash stored, raw sent in email
  passwordResetExpires: Date, // 1 hour from generation
  emailVerificationToken: String,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

### Project Model

```javascript
{
  _id: ObjectId,
  name: String,               // max 100 chars, required
  description: String,        // max 500 chars
  emoji: String,
  color: String,
  status: 'active' | 'archived' | 'completed',
  visibility: 'private' | 'team' | 'public',
  owner: ObjectId,            // ref: User
  members: [{
    user: ObjectId,           // ref: User
    role: 'owner' | 'admin' | 'member' | 'viewer',
    joinedAt: Date,
  }],
  columns: [{
    _id: ObjectId,
    title: String,
    position: Number,
    color: String,
  }],
  activity: [{
    _id: ObjectId,
    user: ObjectId,
    action: String,
    entity: 'task' | 'column' | 'project',
    entityId: ObjectId,
    entityName: String,
    meta: Mixed,
    createdAt: Date,
  }],
  dueDate: Date,
  tags: [String],
  settings: {
    allowMemberInvite: Boolean,
    defaultTaskPriority: String,
  },
  createdAt: Date,
  updatedAt: Date,
}
```

### Task Model

```javascript
{
  _id: ObjectId,
  title: String,              // max 200 chars, required
  description: String,        // max 5000 chars
  project: ObjectId,          // ref: Project, indexed
  column: ObjectId,           // column subdoc _id within project
  position: Number,           // sort order within column
  status: 'todo' | 'in_progress' | 'in_review' | 'done',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  assignees: [ObjectId],      // ref: User, indexed
  reporter: ObjectId,         // ref: User (who created this task)
  dueDate: Date,
  startDate: Date,
  completedAt: Date,          // set automatically when status = done
  estimatedHours: Number,
  loggedHours: Number,
  tags: [String],             // indexed for filtering
  labels: [{ name: String, color: String }],
  checklist: [{
    _id: ObjectId,
    text: String,
    completed: Boolean,
    completedBy: ObjectId,
    completedAt: Date,
  }],
  comments: [{
    _id: ObjectId,
    author: ObjectId,         // ref: User
    text: String,             // max 2000 chars
    edited: Boolean,
    editedAt: Date,
    reactions: [{ emoji: String, users: [ObjectId] }],
    attachments: [AttachmentSubdoc],
    createdAt: Date,
    updatedAt: Date,
  }],
  attachments: [{
    _id: ObjectId,
    uploadedBy: ObjectId,
    filename: String,         // UUID-based filename on disk
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: Date,
  }],
  activity: [{
    _id: ObjectId,
    user: ObjectId,
    action: String,
    field: String,
    oldValue: Mixed,
    newValue: Mixed,
    createdAt: Date,
  }],
  parentTask: ObjectId,       // ref: Task
  subtasks: [ObjectId],
  blockedBy: [ObjectId],
  blocks: [ObjectId],
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date,
  // Virtuals computed at query time:
  // checklistProgress: { total, done, pct }
  // isOverdue: Boolean
}
```

### Notification Model

```javascript
{
  _id: ObjectId,
  recipient: ObjectId,        // ref: User, indexed
  sender: ObjectId,           // ref: User
  type: String,               // see notification type list
  title: String,
  message: String,
  link: String,               // frontend route for navigation
  isRead: Boolean,
  project: ObjectId,          // ref: Project
  task: ObjectId,             // ref: Task
  meta: Mixed,
  createdAt: Date,            // TTL index — auto-deleted after 30 days
}
```

**MongoDB Indexes:**
```
User:         email (unique), createdAt
Project:      owner, members.user, status, createdAt
Task:         project+column+position, assignees, status, priority,
              dueDate, tags, title+description+tags (text)
Notification: recipient+isRead+createdAt, createdAt (TTL 30d)
```

---

## 🔒 Security

### Authentication & Authorization

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs, salt rounds = 12 |
| Access tokens | JWT HS256, configurable TTL (default 7 days) |
| Refresh tokens | Separate secret and longer TTL (default 30 days) |
| Token verification | `protect()` middleware on every protected route |
| Role-based access | `requireProjectAccess(minRole)` per route |
| Socket auth | `socketAuth()` middleware verifies JWT on WS connect |
| Password reset | Crypto random token, SHA256-hashed in DB, 1hr expiry |
| Email enumeration | Forgot-password always returns HTTP 200 |

### HTTP Security

| Feature | Implementation |
|---|---|
| Security headers | `helmet()` — CSP, HSTS, X-Frame-Options, etc. |
| CORS | Configurable origin allowlist via `CLIENT_URL` |
| Rate limiting | Global: 100 req/15min; Auth routes: 20 req/15min |
| Request body size | Limited to 10MB |
| Input validation | `express-validator` on all request bodies |
| Input sanitization | Emails normalized, strings trimmed |

### File Upload Security

| Feature | Implementation |
|---|---|
| MIME type check | Allowlist of safe types only (images, PDFs, office docs) |
| File size limit | 10MB maximum per file, configurable |
| File count limit | 5 files per multipart request |
| Filename | UUID-based random name, no user input used |
| Storage path | Isolated `uploads/` directory |

---

## 📧 Email Notifications

FlowSpace sends HTML emails using Nodemailer for the following events:

| Event | Function | Trigger |
|---|---|---|
| Welcome | `sendWelcomeEmail()` | New user registration |
| Password reset | `sendPasswordResetEmail()` | POST /forgot-password |
| Task assigned | `sendTaskAssignedEmail()` | Task created with assignees |
| New comment | `sendCommentNotificationEmail()` | Comment posted on task |

All emails use a dark-themed HTML template matching the FlowSpace brand. Email sending is **non-blocking** — failures are logged to `logs/error.log` but do not affect API responses.

### Configuring SMTP

**Development with Mailtrap:**
1. Create a free account at [mailtrap.io](https://mailtrap.io)
2. Go to Email Testing > Inboxes > SMTP Settings
3. Copy your credentials to `.env`
4. All sent emails appear in Mailtrap's virtual inbox

**Production SMTP options:**
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key

# Gmail with App Password (enable 2FA first)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASS=your_mailgun_smtp_password
```

---

## 📎 File Uploads

Files are stored on local disk in the `uploads/` directory and served statically at `/uploads/<filename>`. Filenames are UUIDs to prevent conflicts and information leakage.

### Allowed MIME types
```
image/jpeg, image/jpg, image/png, image/gif, image/webp
application/pdf
application/msword (.doc)
application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
application/vnd.ms-excel (.xls)
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
text/plain, text/csv
application/zip
```

### Switching to AWS S3 (recommended for production)

Install the S3 adapter:
```bash
npm install multer-s3 @aws-sdk/client-s3
```

Replace `diskStorage` in `src/middleware/upload.js`:
```javascript
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION });

const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `uploads/${uuidv4()}${ext}`);
  },
});
```

Add these environment variables:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=your-bucket-name
```

---

## 🌐 Frontend Integration Guide

### 1. API Client with Axios and Auto-Refresh

```javascript
// src/lib/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh access token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 &&
        err.response?.data?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
          { refreshToken }
        );
        const { accessToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
```

### 2. Socket.io Client Setup

```javascript
// src/lib/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (accessToken) => {
  if (socket?.connected) return socket;

  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { socket?.disconnect(); socket = null; };
```

### 3. React Custom Hook

```javascript
// src/hooks/useBoard.js
import { useEffect, useCallback } from 'react';
import { getSocket } from '../lib/socket';

export const useBoard = (projectId, dispatch) => {
  const socket = getSocket();

  const handleTaskCreated = useCallback(({ task, columnId }) => {
    dispatch({ type: 'TASK_CREATED', payload: { task, columnId } });
  }, [dispatch]);

  const handleTaskMoved = useCallback(({ task, fromColumnId, toColumnId }) => {
    dispatch({ type: 'TASK_MOVED', payload: { task, fromColumnId, toColumnId } });
  }, [dispatch]);

  const handleTaskUpdated = useCallback((task) => {
    dispatch({ type: 'TASK_UPDATED', payload: task });
  }, [dispatch]);

  const handleTaskDeleted = useCallback(({ taskId, columnId }) => {
    dispatch({ type: 'TASK_DELETED', payload: { taskId, columnId } });
  }, [dispatch]);

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('join:project', projectId);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.emit('leave:project', projectId);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, projectId, handleTaskCreated, handleTaskMoved, handleTaskUpdated, handleTaskDeleted]);
};
```

### 4. Complete Auth Flow

```javascript
// src/store/authStore.js
import { create } from 'zustand';
import api from '../lib/apiClient';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    connectSocket(accessToken);
    set({ user, isAuthenticated: true });
    return user;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },

  loadCurrentUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      connectSocket(token);
      set({ user: data.data.user, isAuthenticated: true });
    } catch (_) {
      localStorage.removeItem('accessToken');
    }
  },
}));
```

---

## 🚢 Deployment

### Option A — VPS with PM2 + Nginx

**1. Install PM2:**
```bash
npm install -g pm2
```

**2. Create `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'flowspace-api',
    script: './src/server.js',
    instances: 'max',       // one per CPU core
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
  }],
};
```

**3. Start and configure auto-restart:**
```bash
NODE_ENV=production pm2 start ecosystem.config.js --env production
pm2 save       # persist across reboots
pm2 startup    # generate startup script
```

**4. Nginx configuration with WebSocket support:**
```nginx
server {
    listen 80;
    server_name api.flowspace.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.flowspace.app;

    ssl_certificate     /etc/letsencrypt/live/api.flowspace.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.flowspace.app/privkey.pem;

    # File uploads
    client_max_body_size 15M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;

        # Required for Socket.io WebSocket upgrade
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 86400;  # 24h for long-lived WebSocket connections
    }
}
```

> The `Upgrade` and `Connection` headers are critical — without them, Socket.io will fall back to HTTP long-polling.

---

### Option B — Docker Compose

**`Dockerfile`:**
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS production
COPY . .
RUN mkdir -p uploads logs
EXPOSE 5000
USER node
CMD ["node", "src/server.js"]
```

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://mongo:27017/flowspace
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CLIENT_URL: ${CLIENT_URL}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      EMAIL_FROM: ${EMAIL_FROM}
    volumes:
      - uploads_data:/app/uploads
      - logs_data:/app/logs
    depends_on:
      mongo:
        condition: service_healthy
    restart: unless-stopped

  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  uploads_data:
  logs_data:
  mongo_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Seed the database
docker-compose exec api npm run seed
```

---

### Option C — Cloud Platforms (Railway / Render / Heroku)

1. Connect your GitHub repository to the platform
2. Set all environment variables in the dashboard (see `.env.example`)
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Use **MongoDB Atlas** (not `mongodb://localhost`) for the database
6. Ensure WebSocket support is enabled (Railway and Render support this natively)

---

### Production Checklist

- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong, unique, 32+ characters
- [ ] `MONGODB_URI` points to MongoDB Atlas with authentication
- [ ] SMTP is configured for real email delivery (not Mailtrap)
- [ ] `CLIENT_URL` matches your actual frontend domain exactly
- [ ] Nginx has WebSocket upgrade headers configured
- [ ] SSL/TLS certificate is installed (use Let's Encrypt via Certbot)
- [ ] File uploads are backed by S3 (not local disk)
- [ ] PM2 or Docker is used for process management
- [ ] Log rotation is configured
- [ ] MongoDB backups are enabled (Atlas provides automated backups)
- [ ] Rate limiting values are tuned for your traffic

---

## ⚠️ Error Handling

All errors are centralized in `src/middleware/errorHandler.js`.

### Using AppError

Throw structured errors anywhere in a controller:

```javascript
const { AppError } = require('../middleware/errorHandler');

// 404 Not Found
throw new AppError('Task not found.', 404);

// 403 Forbidden
throw new AppError('You do not have permission to delete this task.', 403);

// 409 Conflict
throw new AppError('A project with this name already exists.', 409);
```

### Using asyncHandler

Eliminates repetitive try/catch blocks in every controller function:

```javascript
const { asyncHandler } = require('../middleware/errorHandler');

// Without asyncHandler (verbose):
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

// With asyncHandler (clean):
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  res.json({ success: true, data: { task } });
  // Any error automatically forwarded to global handler
});
```

### Automatic Error Type Handling

The global handler automatically converts Mongoose and JWT errors to appropriate HTTP responses:

| Error Type | HTTP Code | Example |
|---|---|---|
| `ValidationError` (Mongoose) | 422 | Required field missing |
| `MongoServerError code 11000` | 409 | Duplicate email |
| `CastError` (Mongoose) | 400 | Invalid ObjectId in URL |
| `express-validator` errors | 422 | Validation rule failure |
| `TokenExpiredError` (JWT) | 401 | Access token expired |
| `JsonWebTokenError` (JWT) | 401 | Malformed token |
| `AppError` | Custom | Developer-defined |
| Unhandled errors | 500 | Unexpected crash |

---

## 🧪 Testing

### Setup

```bash
npm install --save-dev jest supertest dotenv-cli
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "dotenv -e .env.test -- jest --forceExit",
    "test:watch": "dotenv -e .env.test -- jest --watch",
    "test:coverage": "dotenv -e .env.test -- jest --coverage --forceExit"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

Create `.env.test`:
```env
NODE_ENV=test
PORT=5001
MONGODB_URI=mongodb://localhost:27017/flowspace_test
JWT_SECRET=test-jwt-secret-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-32-chars
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:3000
```

### Example Tests

```javascript
// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const User = require('../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('creates a user and returns token pair', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe('test@test.com');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('rejects duplicate email with 409', async () => {
    await User.create({ name: 'Existing', email: 'dup@test.com', password: 'pass123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Another', email: 'dup@test.com', password: 'pass123' });

    expect(res.status).toBe(409);
  });

  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // missing name and password

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Test User', email: 'login@test.com', password: 'password123' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with clear, atomic commits
4. Add or update tests for new functionality
5. Verify the test suite passes: `npm test`
6. Push your branch and open a Pull Request

**Commit message convention:**
```
feat:  add S3 file upload support
fix:   resolve token refresh race condition
docs:  add Socket.io event reference table
test:  add coverage for task move endpoint
chore: upgrade mongoose to 8.4
```

---

## 🔧 Troubleshooting

### MongoDB connection refused
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Start it
sudo systemctl start mongod

# macOS with Homebrew
brew services start mongodb-community
```

### `TokenExpiredError` on every request
The frontend is using an expired access token. Make sure the Axios interceptor is calling `POST /api/auth/refresh-token` on every 401 response with `code: TOKEN_EXPIRED` and updating the stored token.

### Socket.io falls back to polling (not WebSocket)
Check that your Nginx config includes these two headers in the `location` block:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```
Without these, Nginx closes the WebSocket upgrade handshake and Socket.io falls back to HTTP long-polling.

### Emails not being delivered
1. Check `logs/error.log` for SMTP errors
2. Verify credentials in `.env` — SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT
3. For development, check your Mailtrap inbox
4. Email failures are non-fatal and won't break API responses

### File upload returns 415 Unsupported Media Type
The uploaded file's MIME type is not in the allowlist in `src/middleware/upload.js`. Either add the type to the allowlist or convert the file to a supported format before uploading.

### `MongoServerError: E11000 duplicate key`
A unique-constrained field (typically `email`) already exists in the database. The API returns a `409 Conflict` with a readable message. This is expected behavior — handle it in your frontend with an appropriate error message.

### Rate limit hit (429 Too Many Requests)
The default limit is 100 requests per 15 minutes per IP. During development you can increase this in `.env`:
```env
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=900000
```

---

<div align="center">

**Made with ⚡ by the FlowSpace Team**

*Built with Node.js · Express · Socket.io · MongoDB · JWT*

If you find this project useful, please consider giving it a star!

</div>
