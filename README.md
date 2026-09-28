# 🌱 AgriPulse: Agriculture Resource and Farm Management System
### DBMS Level 3 Experiential Learning Capstone Project
**Dual-Database Full-Stack Architecture (PostgreSQL + MongoDB + Next.js 14 + TypeScript)**

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-green.svg?logo=mongodb)](https://www.mongodb.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)

---

## 1. Abstract
**AgriPulse** is a production-grade, centralized agriculture resource and farm management system engineered for DBMS Level 3 experiential learning. Departing from rudimentary CRUD applications, AgriPulse integrates a **Dual-Database Architecture**:
1. **PostgreSQL** serves as the primary relational database enforcing strict ACID compliance, entity-relationship integrity, check constraints, PL/pgSQL database triggers (automatic revenue computation & inventory deduction), materialized views, composite indexing, and complex analytical SQL queries.
2. **MongoDB** serves as the document database handling polymorphic agronomic scouting observations (varying dynamically between Tomato, Rice, Chilli, and Wheat), nested agricultural advisory knowledge bases, symptom text retrieval, and multi-stage aggregation pipelines (`$group`, `$unwind`, `$facet`).

---

## 2. Problem Statement & Motivation
Modern agricultural operations are hindered by fragmented records, opaque per-crop financial margins, unmonitored chemical inputs, and data heterogeneity:
- Core operational transactions (land titles, ledger vouchers, inventory deductions, and harvest sales) demand **strict mathematical consistency and relational foreign keys**.
- Biological observations (disease symptoms, pest trap counts, morphological growth attributes) demand **flexible document schemas** without altering relational tables or resorting to the slow Entity-Attribute-Value (EAV) anti-pattern.

AgriPulse solves this problem by pairing PostgreSQL with MongoDB into a single, unified, role-based platform.

---

## 3. Technology Stack
- **Frontend & Full-Stack Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling & UI:** Tailwind CSS, Glassmorphism design tokens, Lucide React Icons
- **Relational SQL Database:** PostgreSQL 14+ (`pg` node-postgres pool)
- **NoSQL Document Database:** MongoDB 6+ (`mongodb` native driver)
- **Security & Auth:** JSON Web Tokens (JWT), Bcrypt password hashing, RBAC Guards

---

## 4. Why Two Databases Are Used
- **PostgreSQL** is used for structured relational data where relationships, consistency, constraints, and transactions are important.
- **MongoDB** is used for flexible agricultural information where document structures may vary between different crops, observations, advisories, and farming notes.

---

## 5. User Roles & Access Control
| Role | Capabilities & Privileges |
| :--- | :--- |
| **FARMER** | Manage farms, partition fields, schedule crop cycles, log activities, execute atomic fertilizer transactions, log irrigation, post expenses, record harvests, log dynamic MongoDB observations, and search advisories. |
| **ADMIN** | Full system governance, view all farmers, manage users, catalog crops, inspect system analytics, and evaluate DBMS concepts in the **Evaluation Lab Console**. |
| **OFFICER** | Author agronomic advisories, review dynamic crop observations, and issue treatment guidelines. |

---

## 6. Entity-Relationship (ER) Diagram
```mermaid
erDiagram
    ROLE ||--o{ USER : "assigned_to"
    USER ||--o{ FARM : "owns"
    FARM ||--|{ FIELD : "contains"
    FARM ||--o{ EXPENSE : "incurs"
    FIELD ||--o{ CROP_CYCLE : "hosts"
    CROP ||--o{ CROP_CYCLE : "planted_in"
    CROP_CYCLE ||--o{ CROP_STATUS_HISTORY : "tracks_audit"
    CROP_CYCLE ||--o{ FARMING_ACTIVITY : "executes"
    CROP_CYCLE ||--o{ FERTILIZER_USAGE : "consumes"
    CROP_CYCLE ||--o{ IRRIGATION_RECORD : "receives"
    CROP_CYCLE ||--o{ EXPENSE : "allocates"
    CROP_CYCLE ||--o{ HARVEST : "yields"
    RESOURCE ||--o{ FERTILIZER_USAGE : "drawn_from"
```

---

## 7. Advanced DBMS Features Demonstrated

### A. ACID Multi-Statement Transactions
When fertilizer application is recorded:
1. Usage record is inserted in `fertilizer_usages`.
2. Available warehouse quantity is decremented in `resources` (`CHECK available_quantity >= 0`).
3. An accounting expense ledger line is created in `expenses`.
*If stock is insufficient or any step fails, `ROLLBACK` executes, preserving consistency.*

### B. PL/pgSQL Triggers
1. **`trg_compute_harvest_revenue`**: Automatically calculates `NEW.total_revenue = NEW.quantity_kg * NEW.selling_price_per_unit`.
2. **`trg_deduct_resource_on_fertilizer_usage`**: Automatically checks and deducts stock on fertilizer dosing.
3. **`trg_log_crop_status_change`**: Automatically inserts audit traces into `crop_status_history`.
4. **`trg_update_cycle_on_harvest`**: Automatically transitions crop cycle status from `ACTIVE` to `HARVESTED`.

### C. Analytical Relational Views
1. `farm_performance_view`: Farm-level total expenses, gross harvest revenue, and estimated net profit.
2. `monthly_expense_view`: Monthly time-series expense aggregation by category and peak voucher costs.
3. `resource_inventory_view`: Stock health status (`CRITICAL_LOW`, `REORDER_REQUIRED`, `ADEQUATE`) and stock valuation.
4. `crop_cycle_summary_view`: Hydrologic liters, fertilizer units, activity counts, and cycle profits.

### D. MongoDB Aggregations & Full-Text Search
- **$group & $addToSet**: Topic distribution and rating aggregations by crop.
- **$unwind**: Symptom frequency hotspot analysis across scouting documents.
- **$facet**: Multi-faceted simultaneous pipeline execution.
- **Regex & Symptom Query Engine**: Fast search across nested recommendation objects.

---

## 8. Interactive Faculty Evaluation Console (`/admin/database-demo`)
The system features a dedicated evaluation page displaying:
- Live connection health cards for PostgreSQL and MongoDB
- **SQL Queries Tab**: 1-click execution for 20+ complex relational queries (JOINs, Subqueries, Having, Aggregations, Window queries)
- **MongoDB Queries Tab**: Live aggregation pipeline runner with execution timing
- **Transactions Tab**: Interactive Commit vs. Rollback tester
- **Triggers Tab**: PL/pgSQL trigger code inspector
- **Views Tab**: Live explorer for analytical views
- **Indexes Tab**: B-Tree indexing architecture breakdown
- **Demonstration Scenario**: 1-click ledger execution for Ravi Kumar's Green Valley Farm

---

## 9. Quick Start & Setup Instructions

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- PostgreSQL (Optional for live DB; built-in resilient engine available)
- MongoDB (Optional for live DB; built-in resilient engine available)

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd agri-farm-management

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### 3. Environment Variables (`.env.local`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agri_management_db
MONGODB_URI=mongodb://localhost:27017/agri_management_nosql
MONGODB_DB_NAME=agri_management_nosql
JWT_SECRET=agri_jwt_super_secret_key_2025_experiential_learning_project_dbms
JWT_EXPIRES_IN=7d
```

### 4. Database Setup & Seeding
```bash
# Seed PostgreSQL and MongoDB schemas & sample agricultural data
npm run db:seed
```

### 5. Running the Application
```bash
# Launch Next.js Development Server
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 10. Default Demonstration Credentials
| Role | Email | Password | Landing Portal |
| :--- | :--- | :--- | :--- |
| **Farmer (Ravi Kumar)** | `ravi.kumar@agripulse.com` | `Farmer@123` | `/farmer/dashboard` |
| **Administrator** | `admin@agripulse.com` | `Admin@123` | `/admin/dashboard` |
| **Agricultural Officer** | `dr.sharma@agripulse.com` | `Officer@123` | `/farmer/advisories` |

*Note: The login page includes 1-click role buttons for instant evaluation.*

---

## 11. Project Structure
```
├── app/
│   ├── (auth) & api/         # Next.js API Routes (Auth, Farms, Cycles, Harvests, Advisories, Demo)
│   ├── farmer/               # Farmer Dashboard, Topology, Cycles, Activities, Inventory, Harvests, NoSQL Obs
│   └── admin/                # Admin Console, User Governance, Analytics, /admin/database-demo
├── database/
│   ├── postgresql/           # schema.sql, seed.sql, triggers.sql, views.sql, queries.sql
│   └── mongodb/              # seed.js, queries.js, README.md
├── docs/                     # 10 Detailed Academic Documentation Markdown Files
│   ├── problem-statement.md
│   ├── objectives.md
│   ├── scope.md
│   ├── functional-requirements.md
│   ├── database-design.md
│   ├── relational-schema.md
│   ├── data-dictionary.md
│   ├── architecture.md
│   ├── advanced-db-features.md
│   └── testing.md
├── lib/
│   ├── postgres/             # PostgreSQL connection pool, transaction engine & queries
│   ├── mongodb/              # MongoDB client, dynamic document handlers & aggregations
│   ├── auth/                 # JWT tokens & bcrypt password hashing
│   └── validation/           # Server-side input & constraint validators
└── package.json
```

---

## 12. Verification & Testing Matrix
Refer to [`/docs/testing.md`](file:///C:/Users/yogis/.gemini/antigravity-ide/scratch/agri-farm-management/docs/testing.md) for the complete 23-case verification matrix covering Authentication, Relational Integrity, ACID Rollbacks, PL/pgSQL Triggers, Views, and MongoDB Polymorphic Scouting Documents.
