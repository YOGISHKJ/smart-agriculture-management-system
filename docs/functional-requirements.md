# 4. Functional & Non-Functional Requirements
## Agriculture Resource and Farm Management System (AgriPulse)

---

## 1. Functional Requirements

### FR-01: Authentication & Authorization
- **FR-01.1:** System shall permit user registration with name, email, encrypted password (bcrypt), phone, and role.
- **FR-01.2:** System shall validate email formats using both application regex and PostgreSQL `CHECK` constraints.
- **FR-01.3:** System shall issue signed JWT session tokens and enforce Role-Based Access Control (RBAC) across all API routes and dashboard views.

### FR-02: Farm & Field Topography Management
- **FR-02.1:** Farmer can register multiple farms with name, location, total acreage (area > 0), soil type, and ownership type.
- **FR-02.2:** Farmer can partition farms into distinct field blocks, each having specific irrigation infrastructure (Drip, Sprinkler, Flood, Canal, Manual).
- **FR-02.3:** Cascading integrity: Deleting a farm will cascade-remove corresponding child fields and cycles in test environments.

### FR-03: Crop Master & Lifecycle Scheduling
- **FR-03.1:** System provides standard master catalog of crops (category, maturity days, water demand, optimal soil).
- **FR-03.2:** Farmer can instantiate Crop Cycles on specific fields with sowing date, expected harvest date, and target yield.
- **FR-03.3:** Status workflow progression: `PLANNED` -> `ACTIVE` -> `HARVESTED` -> `COMPLETED` / `CANCELLED`.
- **FR-03.4:** Any status change automatically triggers an entry in `crop_status_history`.

### FR-04: Farming Activities & Operations Logging
- **FR-04.1:** Farmers can record activities (Ploughing, Sowing, Weeding, Pest Control, Pruning, Harvesting) with labor hours and costs.

### FR-05: Fertilizer & Resource Inventory Control
- **FR-05.1:** System maintains central inventory of resources (Fertilizers, Seeds, Pesticides, Equipment, Fuel).
- **FR-05.2:** When fertilizer usage is logged, the system verifies sufficient stock and automatically decreases `available_quantity` via PostgreSQL Trigger.
- **FR-05.3:** Low stock levels (<= `minimum_stock`) are highlighted in inventory health views.

### FR-06: Irrigation Tracking
- **FR-06.1:** Farmers can record water volume (Liters), duration (Minutes), and irrigation method per field.
- **FR-06.2:** System computes total water consumption by crop and field.

### FR-07: Financial Expense Ledger
- **FR-07.1:** Farmers can record operational expenses categorized by Seeds, Fertilizer, Pesticides, Labour, Irrigation, Equipment, Transport.
- **FR-07.2:** Expenses can optionally be tied to specific crop cycles or general farm overheads.

### FR-08: Harvest Management & Automatic Financial Settlement
- **FR-08.1:** Farmers log harvest output (quantity, quality grade, selling price per unit, buyer name).
- **FR-08.2:** PostgreSQL Trigger automatically computes `total_revenue = quantity_kg * selling_price_per_unit`.
- **FR-08.3:** Harvest logging triggers transition of crop cycle status from `ACTIVE` to `HARVESTED`.

### FR-09: Non-Relational Agronomic Observations (MongoDB)
- **FR-09.1:** Farmers can store crop observations with polymorphic dynamic attributes tailored to the specific crop.
- **FR-09.2:** Observations support image URLs, symptom arrays, crop growth stages, and ambient weather context.

### FR-10: Agricultural Advisory & Symptom Retrieval (MongoDB)
- **FR-10.1:** Agronomists/Admins can author comprehensive advisories with symptoms, cultural practices, fertilizer advice, biological controls, and chemical measures.
- **FR-10.2:** Full-text and regex search allows farmers to query advisories by symptom description or crop name.

### FR-11: DBMS Evaluation & Live SQL/NoSQL Console
- **FR-11.1:** Admin interface provides live database connectivity health, schema visualizers, transaction simulators, trigger demonstration, view inspection, and SQL/MongoDB execution consoles.

---

## 2. Non-Functional Requirements

| Metric | Requirement Specification |
| :--- | :--- |
| **Security** | Zero plaintext credentials; bcrypt salt rounds = 10; JWT secret in env; parameterized SQL queries against SQL injection. |
| **Data Integrity** | Strict ACID compliance on financial/resource transactions; referential foreign keys with cascade/restrict rules. |
| **Performance** | Sub-100ms response time for analytical queries via indexed columns (`email`, `owner_id`, `crop_id`, `status`, `dates`). |
| **Scalability** | Dual database strategy separates transactional OLTP relational load from unstructured document reads/writes. |
| **Usability & Design** | Mobile-first responsive dashboard with high-contrast agriculture theme, glassmorphism cards, interactive charts, and accessible forms. |
