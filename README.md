<div align="center">

# ⚡ Planify

### A real-time collaborative project management platform

*Built with React 19 · Express.js · Socket.io · MongoDB · JWT*

---

[![Node.js](https://img.shields.io/badge/Node.js-≥18.0-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socketdotio)](https://socket.io)

</div>

---

## Overview

Planify is a full-stack project management tool with real-time collaboration. Teams can organize work into Kanban boards, assign tasks, leave comments, and receive live notifications — all synced instantly via Socket.io without page refreshes.

---

## Tech Stack

**Backend**

| Package | Version | Purpose |
|---|---|---|
| Express | ^5.2.1 | HTTP server and routing |
| Mongoose | ^9.1.5 | MongoDB ODM |
| Socket.io | ^4.8.3 | Real-time WebSocket events |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| bcrypt | ^6.0.0 | Password hashing |
| cors | ^2.8.6 | Cross-origin requests |
| cookie-parser | ^1.4.7 | Cookie handling (auth token storage) |
| dotenv | ^17.2.3 | Environment variables |

**Frontend**

| Package | Version | Purpose |
|---|---|---|
| React | ^19.2.0 | UI framework |
| React Router DOM | ^7.13.0 | Client-side routing |
| Axios | ^1.13.2 | HTTP client |
| Socket.io Client | ^4.8.3 | Real-time connection |
| @hello-pangea/dnd | ^18.0.1 | Drag-and-drop Kanban |
| Tailwind CSS | ^4.2.0 | Styling |
| date-fns | ^4.1.0 | Date formatting |
| react-icons | ^5.5.0 | Icon library |

---

## Project Structure

```
project-management/
├── Backend/
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── comment.controller.js
│       │   ├── project.controller.js
│       │   ├── taskcontroller.js
│       │   └── user.controller.js
│       ├── DataBase/
│       │   └── connection.db.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── errorHandler.middleware.js
│       ├── models/
│       │   ├── comment.js
│       │   ├── projects.model.js
│       │   ├── task.model.js
│       │   └── user.model.js
│       ├── routes/
│       │   ├── auth.route.js
│       │   ├── comments.route.js
│       │   ├── notification.route.js
│       │   ├── projects.route.js
│       │   ├── task.route.js
│       │   └── user.route.js
│       ├── server.js
│       └── socket.js
│
└── Frontend/
    └── src/
        ├── components/
        │   ├── AuthWrapper.jsx
        │   ├── Avatar.jsx
        │   ├── Badge.jsx
        │   ├── CommentBox.jsx
        │   ├── CreatePostModal.jsx
        │   ├── CreateProject.jsx
        │   ├── CreateTask.jsx
        │   ├── InviteMemberModal.jsx
        │   ├── Layout.jsx
        │   ├── LoadingSpinner.jsx
        │   ├── Modal.jsx
        │   ├── projectcard.jsx
        │   ├── TaskCard.jsx
        │   └── TaskDetailModal.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── NotificationContext.jsx
        ├── pages/
        │   ├── ArrivedTasks.jsx
        │   |── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── NotificationPanel.jsx
        │   ├── Projectdetails.jsx
        │   ├── ProjectPage.jsx
        │   └── Register.jsx
        ├── utils/
        │   ├── API.jsx
        │   └── socket.jsx
        ├── App.jsx
        └── main.jsx
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
PORT=
MONGODB_URI=mongodb://localhost:27017/planify
JWT_SECRET=your-jwt-secret-at-least-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=""
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=""
VITE_Backend_URL=""
```

### Running the App

```bash
# Start backend (from Backend/)
npm run dev

# Start frontend (from Frontend/)
npm run dev
```

---

## Features

- **Auth** — Register, login, fully cookie-based JWT auth (no tokens in localStorage)
- **Projects** — Create and manage Kanban projects with custom columns
- **Tasks** — Create, assign, prioritize, and drag-and-drop tasks between columns
- **Comments** — Real-time comments on tasks
- **Notifications** — In-app notifications via Socket.io with unread badge
- **Member Management** — Invite members to projects, accept/reject invites, leave projects
- **Real-Time** — All board changes sync instantly to all connected users

---

## API Reference

All endpoints are prefixed with `/api`. Authentication is handled via cookies sent automatically with every request (withCredentials: true).

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account — sets auth cookie |
| POST | `/login` | Login — sets auth cookie, returns user object |
| POST | `/refresh` | Refreshes session using cookie |
| POST | `/logout` | Clears the auth cookie |
| GET | `/me` | Get current user (requires valid cookie) |

### Projects — `/api/projects`

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all projects the user belongs to |
| POST | `/` | Create a new project |
| GET | `/:id` | Get a single project |
| PUT | `/:id` | Update project details |
| DELETE | `/:id` | Delete project |
| POST | `/:id/invite` | Invite a member by email |
| DELETE | `/:id/members/:userId` | Remove a member |
| POST | `/:id/accept-invite` | Accept a project invitation |
| POST | `/:id/reject-invite` | Reject a project invitation |
| POST | `/:id/leave` | Leave a project |

### Tasks — `/api/tasks`

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/arrived` | Get tasks assigned to the current user |
| GET | `/project/:projectId` | Get all tasks in a project |
| POST | `/project/:projectId` | Create a task in a project |
| GET | `/:id` | Get a single task |
| PUT | `/:id` | Update a task |
| PATCH | `/:id/move` | Move task to a different column |
| DELETE | `/:id` | Delete a task |

### Comments — `/api/comments`

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/task/:taskId` | Get all comments on a task |
| POST | `/task/:taskId` | Add a comment to a task |
| PUT | `/:id` | Edit a comment |
| DELETE | `/:id` | Delete a comment |

### Notifications — `/api/notifications`

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get current user's notifications |
| PATCH | `/read-all` | Mark all notifications as read |
| PATCH | `/:id/read` | Mark a single notification as read |

### Users — `/api/users`

All routes require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=` | Search users by name or email |
| PUT | `/profile` | Update current user's profile |

---

## Socket.io

The socket connects automatically using `withCredentials: true` — no token is passed manually. The server authenticates the socket via the cookie sent on connection.

```javascript
// utils/socket.jsx
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_Backend_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

**Client → Server**

| Event | Payload |
|---|---|
| `join:project` | `projectId` |
| `leave:project` | `projectId` |
| `typing:start` | `{ taskId, projectId }` |
| `typing:stop` | `{ taskId, projectId }` |

**Server → Client**

| Event | Description |
|---|---|
| `task:created` | New task added |
| `task:updated` | Task fields changed |
| `task:moved` | Task moved to a different column |
| `task:deleted` | Task removed |
| `task:comment-added` | New comment posted |
| `project:updated` | Project settings changed |
| `project:member-added` | New member joined |
| `notification:new` | New notification for current user |
| `user:typing` | A user is typing in a task |

---

## Authentication Flow

Planify uses a fully cookie-based auth strategy. No tokens are stored in `localStorage` or React state — the browser sends the cookie automatically on every request and socket connection.

```
Register / Login
      ↓
Server sets JWT as a cookie
      ↓
AuthContext calls GET /auth/me on app load
      ↓
User object stored in React state (not the token)
      ↓
Every API request sends cookie automatically (withCredentials: true)
      ↓
Cookie expired → POST /auth/refresh → new cookie set by server
```


---

## Data Models

**User** — `_id`, `name`, `email`, `password` (hashed), `avatar`, `color`, `initials`, `role`, `createdAt`

**Project** — `_id`, `name`, `description`, `emoji`, `color`, `status`, `visibility`, `owner`, `members[]`, `columns[]`, `activity[]`

**Task** — `_id`, `title`, `description`, `project`, `column`, `position`, `status`, `priority`, `assignees[]`, `reporter`, `dueDate`, `tags[]`, `checklist[]`, `comments[]`

**Notification** — `_id`, `recipient`, `sender`, `type`, `title`, `message`, `isRead`, `project`, `task`, `createdAt`

---

## Troubleshooting

**Cookie not being sent** — Make sure Axios is initialized with `withCredentials: true` and the backend CORS config has `credentials: true` with `origin` set to your exact frontend URL (not `*`).

**`GET /auth/me` returns 401 on page refresh** — The cookie may have expired or wasn't set. Check the `Set-Cookie` header in the login response using browser DevTools → Network tab.

**Socket.io polling instead of WebSocket** — If deploying behind Nginx, add these headers to your proxy config:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

**MongoDB connection refused** — Make sure MongoDB is running locally (`mongod`) or that your Atlas connection string is correct.

---

<div align="center">

**Made with ⚡ by Dhruv Sharma**

</div>