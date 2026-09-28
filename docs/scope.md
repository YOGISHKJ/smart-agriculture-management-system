# 3. Project Scope
## Agriculture Resource and Farm Management System (AgriPulse)

---

### In-Scope Capabilities
- **Authentication & Role-Based Access Control (RBAC):**
  - Farmers, Agricultural Officers, and Administrators with granular route protection and JWT session validation.
- **Relational Operational Modules (PostgreSQL):**
  - Farm & Field Management
  - Crop Master & Crop Cycle Management
  - Farming Activities Timeline
  - Fertilizer & Resource Inventory Tracking
  - Irrigation Logging & Water Volume Monitoring
  - Expense Ledger (Category, Date, Payment Mode)
  - Harvest Records & Automatic Revenue Engine
- **Non-Relational Agronomic Modules (MongoDB):**
  - Flexible Crop Observations with Polymorphic Schemas
  - Agricultural Advisories Knowledge Base with Symptom Search & Tag Filtering
  - Farming Notes and Sensor Weather Records
- **DBMS Evaluation Lab Console:**
  - Dedicated `/admin/database-demo` interface to execute, inspect, and evaluate SQL Queries, MongoDB Aggregation Pipelines, Trigger Auditing, and Transaction Execution live.
- **Modern Responsive Web Interface:**
  - Desktop, tablet, and mobile layouts with real-time analytics and visualizations.

---

### Out-of-Scope (Non-Goals)
- Machine Learning / AI-based automated plant pathology vision classification (The system performs multi-criteria keyword and symptom query matching across agronomic knowledge collections; it does not claim to run offline neural networks).
- Direct banking gateway clearance (Payment methods like UPI, Cash, and Bank Transfer are recorded for accounting ledgers; live payment gateway processing is simulated).
- Hardware sensor firmware programming (Sensor data ingest structures are modeled in JSON time-series format for weather stations).
