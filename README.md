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
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

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
| cookie-parser | ^1.4.7 | Cookie handling |
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
        │   ├── BoardColumn.jsx
        │   ├── CommentBox.jsx
        │   ├── CreatePostModal.jsx
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
        │   ├── CreateProject.jsx
        │   ├── CreateTask.jsx
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── NotificationPanel.jsx
        │   ├── ProjectBoard.jsx
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

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/planify.git
cd planify

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/planify
JWT_SECRET=your-jwt-secret-at-least-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the App

```bash
# Start backend (from Backend/)
npm run dev

# Start frontend (from Frontend/)
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

---

## Features

- **Auth** — Register, login, JWT access + refresh token flow
- **Projects** — Create and manage Kanban projects with custom columns
- **Tasks** — Create, assign, prioritize, and drag-and-drop tasks between columns
- **Comments** — Real-time comments on tasks
- **Notifications** — In-app notifications via Socket.io with unread badge
- **Member Management** — Invite members to projects by email with role-based access
- **Real-Time** — All board changes sync instantly to all connected users

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login, returns token pair |
| POST | `/refresh-token` | Exchange refresh token for new access token |
| GET | `/me` | Get current user (protected) |
| PATCH | `/me` | Update profile (protected) |
| POST | `/logout` | Logout (protected) |

### Projects — `/api/projects`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all user's projects |
| POST | `/` | Create a project |
| GET | `/:id` | Get project details |
| PATCH | `/:id` | Update project |
| DELETE | `/:id` | Delete project |
| POST | `/:id/members` | Invite member by email |
| DELETE | `/:id/members/:userId` | Remove member |
| POST | `/:id/columns` | Add column |
| PATCH | `/:id/columns/:colId` | Update column |
| DELETE | `/:id/columns/:colId` | Delete column |

### Tasks — `/api/projects/:projectId/tasks`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List tasks (filterable) |
| POST | `/` | Create task |
| GET | `/:taskId` | Get task details |
| PATCH | `/:taskId` | Update task |
| PATCH | `/:taskId/move` | Move task to column |
| DELETE | `/:taskId` | Delete task |

### Comments — `/api/comments`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add comment to task |
| PATCH | `/:id` | Edit comment |
| DELETE | `/:id` | Delete comment |

### Notifications — `/api/notifications`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get notifications |
| PATCH | `/read-all` | Mark all as read |
| PATCH | `/:id/read` | Mark one as read |
| DELETE | `/:id` | Delete notification |

### Users — `/api/users`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=` | Search users by name/email |
| GET | `/:id` | Get user profile |

---

## Socket.io Events

Connect with your JWT in the handshake:

```javascript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: { token: localStorage.getItem('accessToken') }
});

// Join a project room
socket.emit('join:project', projectId);
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

Tokens are stored in `localStorage`. The API client in `utils/API.jsx` attaches the access token to every request and handles 401 responses by calling the refresh endpoint automatically.

```
Login → { accessToken (7d), refreshToken (30d) }
         ↓
Request with Bearer token
         ↓
401 TOKEN_EXPIRED → POST /auth/refresh-token → new accessToken
         ↓
Original request retried
```

---

## Data Models

**User** — `_id`, `name`, `email`, `password` (hashed), `avatar`, `color`, `initials`, `role`, `createdAt`

**Project** — `_id`, `name`, `description`, `emoji`, `color`, `status`, `visibility`, `owner`, `members[]`, `columns[]`, `activity[]`

**Task** — `_id`, `title`, `description`, `project`, `column`, `position`, `status`, `priority`, `assignees[]`, `reporter`, `dueDate`, `tags[]`, `checklist[]`, `comments[]`, `attachments[]`

**Notification** — `_id`, `recipient`, `sender`, `type`, `title`, `message`, `isRead`, `project`, `task`, `createdAt`

---

## Deployment

### Railway / Render / Heroku

1. Push your repo to GitHub
2. Connect to your platform of choice
3. Set all environment variables in the dashboard
4. Use MongoDB Atlas for the database
5. Backend start command: `node src/server.js`
6. Frontend build command: `npm run build`

### Production Checklist

- [ ] Strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ chars)
- [ ] `MONGODB_URI` points to Atlas with auth
- [ ] `CLIENT_URL` matches your deployed frontend domain
- [ ] `NODE_ENV=production`
- [ ] CORS only allows your frontend domain

---

## Troubleshooting

**MongoDB connection refused** — Make sure MongoDB is running locally (`mongod`) or that your Atlas connection string is correct.

**Socket.io polling instead of WebSocket** — If deploying behind Nginx, add these headers to your proxy config:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

**401 on every request** — The access token may be expired. Verify the refresh token interceptor in `utils/API.jsx` is working correctly.

---

<div align="center">

**Made with ⚡ by Dhruv Sharma**

</div>
