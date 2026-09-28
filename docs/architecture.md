# 8. System Architecture & Dual-Database Strategy
## Agriculture Resource and Farm Management System (AgriPulse)

---

## 1. Architectural System Overview

AgriPulse is architected around a **Tiered Dual-Database Full-Stack Paradigm** built on Next.js 14+ (App Router), PostgreSQL 14+, and MongoDB 6+:

```
+-------------------------------------------------------------------------+
|                         PRESENTATION LAYER                              |
|   Next.js 14 Responsive UI (Tailwind CSS, Dashboard, Charts, Forms)      |
|   Mobile-First Layout | Role-Based Views (Farmer, Admin, Agri-Officer)  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       APPLICATION & API LAYER                           |
|       Next.js API Route Handlers (/api/farms, /api/advisories, etc.)    |
|   - Authentication Middleware (JWT & Bcrypt Hashing)                   |
|   - Role-Based Access Control (RBAC Guard)                             |
|   - Server-side Input Validation & Business Logic Orchestration         |
|   - Interactive DBMS Demonstration Engine (/admin/database-demo)       |
+-------------------+---------------------------------+-------------------+
                    |                                 |
         (Structured / ACID)               (Semi-Structured / Flexible)
                    |                                 |
                    v                                 v
+-----------------------------------+ +-----------------------------------+
|      PRIMARY SQL DATABASE         | |       NoSQL DOCUMENT STORE        |
|           PostgreSQL              | |             MongoDB               |
|  - Users & RBAC                   | |  - Agricultural Advisories        |
|  - Farms & Fields Hierarchy       | |  - Crop Observations (Dynamic)   |
|  - Crops & Crop Cycles            | |  - Farmer Field Journals & Notes  |
|  - Activities & Expenses Ledger   | |  - Sensor Weather Records         |
|  - Resources & Inventory          | |  - Text Search & $match, $group   |
|  - Irrigation Logs & Harvests     | |  - Multi-faceted Aggregations     |
|  - Triggers, Views, Constraints   | |  - Nested Arrays & Documents      |
+-----------------------------------+ +-----------------------------------+
```

---

## 2. In-Depth Dual-Database Strategy: Why PostgreSQL and MongoDB?

### A. The Role of PostgreSQL (Structured Relational Core)
**PostgreSQL is used for structured relational data where relationships, consistency, constraints, and transactions are important.**

1. **Relational Integrity & Foreign Keys:**
   - Agricultural management requires strict hierarchical cascading and referential guarantees. A Field cannot exist without a Farm; a Crop Cycle must link to a valid registered Crop; an Expense must resolve to a valid Farm.
2. **ACID Transactional Guarantees:**
   - Operations such as recording fertilizer application necessitate atomic execution: inserting the usage record, deducting from warehouse stock, and generating an expense voucher must succeed together or rollback completely (`BEGIN ... COMMIT / ROLLBACK`).
3. **Database-Level Integrity Constraints:**
   - Area must strictly be $>0$, amounts $\ge 0$, dates logically sequenced ($Harvest \ge Sowing$), and statuses constrained to explicit enumerated sets.
4. **Trigger Automation & Relational Views:**
   - PostgreSQL triggers automatically enforce revenue calculations and maintain status audit logs. Views (`farm_performance_view`, `monthly_expense_view`) synthesize multi-table analytics without application latency.

### B. The Role of MongoDB (Flexible Agronomic Document Store)
**MongoDB is used for flexible agricultural information where document structures may vary between different crops, observations, advisories, and farming notes.**

1. **Polymorphism in Crop Scouting & Observations:**
   - Morphological observations cannot fit a single tabular schema. Tomato scouting records leaf chlorosis, target spots, and whitefly trap counts; Paddy scouting records standing water depth, tillers per hill, and stem borer egg masses; Cotton scouting monitors boll shedding and aphids.
   - Forcing these into SQL leads to either the **EAV (Entity-Attribute-Value) anti-pattern** (which ruins query performance) or wide tables with 80% null columns. MongoDB's dynamic document structure allows each crop observation to include its unique `dynamic_attributes` naturally.
2. **Hierarchical Knowledge Base (Agricultural Advisories):**
   - Agricultural advisories are multi-dimensional documents containing arrays of diagnostic symptoms, structured recommendations (cultural, biological, chemical), preventative measures, and keyword tags.
3. **Aggregation Pipelines & Text Search:**
   - MongoDB aggregation operators (`$unwind`, `$group`, `$facet`, `$project`) enable high-speed analytics on symptom distribution and tag clusters without complex multi-join SQL overhead.

---

## 3. Security Architecture
- **Password Protection:** Passwords are never stored in plaintext; salted and hashed via `bcryptjs` with 10 rounds.
- **Session Tokens:** Stateles JWT tokens with role claims (`FARMER`, `ADMIN`, `OFFICER`).
- **SQL Injection Prevention:** Parameterized SQL queries (`$1, $2, ...`) via node-postgres (`pg`).
- **API Guarding:** Server-side role validation middleware rejects unauthorized attempts to access admin or cross-tenant farmer records.
