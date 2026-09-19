# LMS Platform

A production-oriented Learning Management System built on the MERN stack. It will support three roles (Admin, Mentor, Student) and a course structure of Course → Module → Topic → Concept → Resources, with all content stored in MongoDB rather than hardcoded in the frontend.

**Current status:** Phase 1 (project foundation). Authentication, RBAC, and LMS features are not implemented yet.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, REST API
- **Database:** MongoDB with Mongoose
- **Security basics:** Helmet, CORS allowlist, environment-based configuration

## Project Structure

```
lms-platform/
├── client/                 # React application (Vite)
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom hooks
│       ├── layouts/        # Page layouts
│       ├── pages/          # Route-level pages
│       ├── routes/         # Route definitions
│       ├── services/       # Axios instance and API service modules
│       └── utils/          # Helpers
└── server/                 # Express API
    └── src/
        ├── config/         # Env validation, database, CORS
        ├── controllers/    # Request handlers
        ├── middleware/     # Logging, 404, error handling
        ├── models/         # Mongoose models
        ├── routes/         # Route definitions
        ├── services/       # Business logic
        └── utils/          # ApiError, response helpers
```

## Prerequisites

- Node.js 22 LTS (or 20.19+) and npm
- Git
- A MongoDB database: a local instance, Docker, or a MongoDB Atlas cluster

## Installation

```bash
git clone <repository-url> lms-platform
cd lms-platform

cd server && npm install
cd ../client && npm install
```

## Environment Setup

Create a `.env` file in both `server/` and `client/` from the provided examples.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows Command Prompt, use `copy` instead of `cp`.

**`server/.env`**

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port the API listens on |
| `MONGODB_URI` | MongoDB connection string (required) |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma-separated |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, including `/api` |

Never commit `.env` files. Only `.env.example` files are tracked.

## Development Commands

Run each in its own terminal.

| Location | Command | Purpose |
|---|---|---|
| `server/` | `npm run dev` | Start the API with auto-restart |
| `server/` | `npm start` | Start the API (production) |
| `client/` | `npm run dev` | Start the Vite dev server (http://localhost:5173) |
| `client/` | `npm run build` | Create a production build in `client/dist` |
| `client/` | `npm run preview` | Preview the production build locally |

## API

### Health check

```
GET /api/health
```

Response `200 OK`:

```json
{
  "success": true,
  "message": "LMS API is running"
}
```

### Error format

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Route not found: GET /api/nope" }
}
```