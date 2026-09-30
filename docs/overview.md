# Campus Complaint and Feedback Portal — Documentation

## Overview

This document provides additional technical documentation for the Campus Complaint and Feedback Portal MVP.

## Complaint Status Flow

```
PENDING_VERIFICATION → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED
        ↓
     REJECTED
```

Valid transitions:
- PENDING_VERIFICATION → VERIFIED (by Coordinator)
- PENDING_VERIFICATION → REJECTED (by Coordinator)
- VERIFIED → ASSIGNED (by Admin, with department)
- ASSIGNED → IN_PROGRESS (by Admin)
- IN_PROGRESS → RESOLVED (by Admin, with resolution remark)

Invalid transitions are rejected by the backend with HTTP 400.

## Priority Levels

LOW, MEDIUM, HIGH, CRITICAL

## Categories

Infrastructure, Classroom, Laboratory, Library, Cleanliness, Wi-Fi / Internet, Hostel, Transport, Other

## Departments (seeded)

Administration, IT, Maintenance, Library, Hostel, Security, Transport, Other

## Authentication Flow

1. Client sends credentials to `POST /api/auth/login`.
2. Server validates with bcrypt, returns JWT token + user info.
3. Client stores token in localStorage.
4. Axios interceptor attaches `Authorization: Bearer <token>` to all requests.
5. Backend `auth` middleware verifies JWT and attaches `req.user`.
6. Backend `authorize(...roles)` middleware checks role.
7. On 401, Axios interceptor clears token and redirects to login.

## File Uploads

- Uses `multer` for multipart/form-data handling.
- Files stored in `backend/uploads/`.
- `attachmentUrl` stores the relative path.
- Served statically at `http://localhost:5000/uploads/<filename>`.
- Replaceable with cloud storage later.
