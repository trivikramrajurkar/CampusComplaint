# Campus Complaint and Feedback Portal

A centralized web-based Campus Complaint and Feedback Portal that allows students to submit campus complaints, route them to their respective Class Coordinator for verification, and only after verification forward them to the Admin for assignment and resolution.

---

## Problem Statement

In a typical college campus, students face various issues related to infrastructure, classrooms, laboratories, library, cleanliness, Wi-Fi, hostel, and transport. There is no centralized, trackable system to raise and resolve these complaints. Complaints get lost in informal channels, there is no accountability, and no feedback loop exists to measure resolution quality.

---

## Objective

Build a centralized web portal where:

- Students submit complaints.
- Class Coordinators verify complaints (mandatory verification layer).
- Admin assigns complaints to departments and tracks resolution.
- Students provide feedback after resolution.

---

## MVP Scope

- Student registration and login (JWT + bcrypt).
- Student complaint submission with category, priority, location, and optional attachment.
- Class Coordinator verification / rejection layer.
- Admin department assignment and status management.
- Student feedback after resolution.
- Role-based access control enforced on both frontend and backend.
- Dashboard statistics for each role.
- Clean, responsive, academic-style UI.

Out of scope (future): email/SMS notifications, real-time chat, AI/ML, analytics, mobile app, multi-college support, payments.

---

## User Roles

| Role | Description |
|------|-------------|
| **Student** | Registers, logs in, submits complaints, views status, submits feedback after resolution. |
| **Coordinator** | Assigned to one or more classes. Verifies or rejects complaints from their classes. Adds remarks. |
| **Admin** | Views verified complaints, assigns departments, updates status (Assigned → In Progress → Resolved), adds resolution remarks. |

Only Students can self-register. Coordinators and Admin are created via Prisma seed data.

---

## Core Workflow

```
STUDENT
   ↓
Submit Complaint
   ↓
PENDING_VERIFICATION
   ↓
CLASS COORDINATOR
   ↓
VERIFY / REJECT
   ↓
If rejected → REJECTED → Student sees rejection reason
If verified → VERIFIED
   ↓
ADMIN
   ↓
Assign Department → ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
   ↓
Student views resolution
   ↓
Student submits feedback (rating 1–5 + optional comment)
```

---

## Features

- JWT authentication with bcrypt password hashing.
- Role-based authorization (Student / Coordinator / Admin).
- Complaint lifecycle: Pending Verification → Verified → Assigned → In Progress → Resolved (or Rejected).
- Coordinator verification gate before Admin involvement.
- Department assignment by Admin.
- Optional file attachment on complaints (local uploads).
- Feedback with 1–5 rating and comment (one per complaint, after resolution).
- Dashboard stats for all roles.
- Toast notifications, loading states, empty states, error states.
- Protected frontend routes with role-based redirects.

---

## System Architecture Overview

```
┌──────────────┐        REST API (Axios)        ┌──────────────────┐
│   Frontend   │  ───────────────────────────>  │     Backend      │
│  React + Vite │                               │ Node + Express   │
│  Tailwind CSS │  <───────────────────────────  │   REST API       │
│  React Router │         JSON responses        │                  │
└──────────────┘                               └────────┬─────────┘
                                                         │
                                                ┌────────▼─────────┐
                                                │   PostgreSQL      │
                                                │   (via Prisma)    │
                                                └──────────────────┘
```

- **Frontend**: React SPA with role-based dashboards, served by Vite dev server.
- **Backend**: Express REST API with controllers, services, routes, middleware.
- **Database**: PostgreSQL accessed via Prisma ORM.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT, bcrypt |
| Other | dotenv, cors, multer (file uploads) |

---

## Folder Structure

```
campus-complaint-portal/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── coordinator/
│   │   │   └── admin/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── docs/
├── .gitignore
└── README.md
```

### Team Ownership Mapping

| Member | Owns |
|--------|------|
| Member 1 | `frontend/src/pages/student/` + shared components used by student |
| Member 2 | `frontend/src/pages/coordinator/` + shared components used by coordinator |
| Member 3 | `frontend/src/pages/admin/` + shared components used by admin |
| Member 4 | `backend/` (all server code, Prisma, auth, PostgreSQL) |

---

## PostgreSQL Setup

1. Install PostgreSQL locally.
2. Create a database for the project:

```sql
CREATE DATABASE campus_complaint_portal;
```

3. Create a `.env` file in `backend/` (see Environment Variables below) with your `DATABASE_URL`.

---

## Prisma Setup

The Prisma schema is at `backend/prisma/schema.prisma`.

Generate the Prisma client:

```bash
cd backend
npx prisma generate
```

Create and apply the initial migration:

```bash
npx prisma migrate dev --name init
```

Seed the database:

```bash
npx prisma db seed
```

---

## Environment Variables

Create `backend/.env`:

```
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/campus_complaint_portal?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=5000
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

---

## Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL running locally

### Backend

```bash
cd campus-complaint-portal/backend
npm install
```

### Frontend

```bash
cd campus-complaint-portal/frontend
npm install
```

---

## Backend Startup

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

The backend runs on `http://localhost:5000`.

---

## Frontend Startup

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## Migration Commands

```bash
cd backend
npx prisma migrate dev --name <migration_name>   # create + apply
npx prisma migrate deploy                          # apply existing
npx prisma migrate status                          # check status
```

---

## Seed Commands

```bash
cd backend
npx prisma db seed
```

---

## Test Credentials

All passwords for development seed data: `password123`

### Admin
| Email | Password |
|-------|----------|
| admin@campus.edu | password123 |

### Coordinators
| Email | Password | Class |
|-------|----------|-------|
| coord.a@campus.edu | password123 | SY-CSE-A |
| coord.b@campus.edu | password123 | SY-CSE-B |
| coord.c@campus.edu | password123 | SY-CSE-C |

### Students
| Email | Password | Class |
|-------|----------|-------|
| student1@campus.edu | password123 | SY-CSE-A |
| student2@campus.edu | password123 | SY-CSE-B |
| student3@campus.edu | password123 | SY-CSE-C |

Students can also self-register via the `/register` page.

---

## API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Login (all roles) |
| GET | `/api/auth/me` | Get current user |

### Student Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Submit a complaint |
| GET | `/api/complaints/my` | List own complaints |
| GET | `/api/complaints/:id` | Get complaint details |
| POST | `/api/complaints/:id/feedback` | Submit feedback |
| GET | `/api/complaints/:id/feedback` | Get feedback for a complaint |

### Coordinator
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/coordinator/complaints` | List complaints for coordinator's classes |
| GET | `/api/coordinator/complaints/:id` | Get complaint details |
| PUT | `/api/coordinator/complaints/:id/verify` | Verify a complaint |
| PUT | `/api/coordinator/complaints/:id/reject` | Reject a complaint |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/complaints` | List verified+ complaints |
| GET | `/api/admin/complaints/:id` | Get complaint details |
| PUT | `/api/admin/complaints/:id/assign` | Assign department |
| PUT | `/api/admin/complaints/:id/status` | Update status |

---

## Future Enhancements (Not Implemented)

- Email / SMS notifications
- Real-time updates (Socket.IO)
- Advanced analytics dashboard
- Mobile application
- Multi-college support
- AI-based complaint categorization
