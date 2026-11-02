# AgriPulse - Agriculture & Farm Management System

AgriPulse is a modern, full-stack precision farm management system designed for farmers and agricultural administrators to manage land parcels, track crop cultivation cycles, monitor water irrigation schedules, and audit fertilizer applications with cost analysis.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons (Port 3000)
- **Backend:** Node.js, Express, TypeScript, pg (PostgreSQL Pool), Zod Validation, JWT, Bcrypt (Port 5000)
- **Database:** PostgreSQL 16 (Docker Compose with automated schema and seed provisioning) (Port 5432)

---

## 📁 Project Structure

```
agri-farm-management/
├── frontend/            # Next.js 14 Web Application (UI only, port 3000)
│   ├── app/             # App Router pages (/login, /register, /farmer/*)
│   ├── lib/             # API client (lib/api.ts) with JWT interceptors
│   ├── package.json
│   └── .env.example
├── backend/             # Express & TypeScript REST API (port 5000)
│   ├── src/
│   │   ├── controllers/ # Auth, Fields, Crops, Water, Fertilizer, Dashboard, Health
│   │   ├── routes/      # REST API route handlers (/api/*)
│   │   ├── middleware/  # JWT auth, role guard, error handler, Zod validator
│   │   ├── db/          # PostgreSQL connection pool
│   │   ├── config/      # Environment configuration
│   │   └── server.ts    # Express server entrypoint
│   ├── package.json
│   └── .env.example
├── database/            # Database schema, seed & container configuration
│   ├── schema.sql       # DDL schema (users, fields, crops, water_usage, fertilizer_usage)
│   ├── seed.sql         # Seed data with demo farmer & admin
│   ├── docker-compose.yml # PostgreSQL 16 container definition
│   └── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Running the Project

### 1. Database (PostgreSQL 16)

Navigate to the `database` directory and start the PostgreSQL container:

```bash
cd database
docker compose up -d
```

> **Note:** Docker will automatically initialize and execute `schema.sql` followed by `seed.sql` on first start.
> Default connection: `postgresql://postgres:postgrespassword@localhost:5432/agripulse_db`

---

### 2. Backend (Express REST API)

In a separate terminal, start the backend server:

```bash
cd backend
npm install
npm run dev
```

The backend REST API will start on **http://localhost:5000/api**.

---

### 3. Frontend (Next.js 14)

In a separate terminal, start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend web interface will start on **http://localhost:3000**.

---

## 🔑 Demo Login Credentials

The database is pre-seeded with the following demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Farmer** | `farmer@agripulse.com` | `Farmer@123` |
| **Admin** | `admin@agripulse.com` | `Admin@123` |

---

## 📡 REST API Summary

- `POST /api/auth/login` - Authenticate user & receive JWT token
- `POST /api/auth/register` - Register a new farmer account
- `GET /api/auth/me` - Retrieve current user profile
- `GET, POST, PUT, DELETE /api/fields` - Manage farm field parcels
- `GET, POST, PUT, DELETE /api/crops` - Manage crop cycles & sowing details
- `GET, POST, PUT, DELETE /api/water` - Log and monitor irrigation water usage
- `GET, POST, PUT, DELETE /api/fertilizer` - Log and track fertilizer applications & costs
- `GET /api/dashboard/summary` - Live KPI metrics, totals, and Recharts graph data
- `GET /api/health` - Backend and database health status
