# 10. Comprehensive Verification & Test Suite
## Agriculture Resource and Farm Management System (AgriPulse)

---

### Test Execution Matrix

| Test ID | Test Category | Test Case | Input Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Authentication | Valid Farmer Login | `ravi.kumar@agripulse.com`, `Farmer@123` | HTTP 200, JWT token returned, redirect to `/farmer/dashboard` | JWT issued with role 'FARMER', dashboard loaded | **PASSED** |
| **TC-AUTH-02** | Authentication | Invalid Password Rejection | `ravi.kumar@agripulse.com`, `WrongPass!` | HTTP 401 Unauthorized, "Invalid credentials" error | HTTP 401 error message displayed | **PASSED** |
| **TC-AUTH-03** | Authorization | Farmer Access to Admin API | JWT with role `FARMER` querying `/api/admin/users` | HTTP 403 Forbidden, Access Denied | HTTP 403 Forbidden received | **PASSED** |
| **TC-AUTH-04** | Authentication | Admin Role Login & Access | `admin@agripulse.com`, `Admin@123` | HTTP 200, redirect to `/admin/dashboard` | Admin dashboard and evaluation tools unlocked | **PASSED** |
| **TC-FARM-01** | Farm Management | Create Valid Farm | Name: "Cauvery Farm", Area: 10.5, Soil: "Alluvial" | HTTP 201 Created, Farm stored with generated `farm_id` | Farm inserted in PostgreSQL and listed in UI | **PASSED** |
| **TC-FARM-02** | Farm Management | Reject Negative/Zero Area | Area: `-4.5` acres | PostgreSQL CHECK constraint violation (`chk_farm_area_positive`), HTTP 400 | Application & DB reject input with error | **PASSED** |
| **TC-FARM-03** | Field Management | Partition Farm into Fields | Farm: 1, Name: "East Plot", Irrigation: "DRIP", Area: 2.0 | HTTP 201 Created, Field associated with Farm 1 | Field created and linked via Foreign Key | **PASSED** |
| **TC-CROP-01** | Crop Cycle | Create Crop Cycle | Sowing: `2025-05-01`, Harvest: `2025-08-15`, Crop: 1 | HTTP 201 Created, Status: `PLANNED` | Cycle scheduled with valid dates | **PASSED** |
| **TC-CROP-02** | Crop Cycle | Reject Invalid Harvest Date | Sowing: `2025-05-01`, Harvest: `2025-04-01` (Before Sowing) | PostgreSQL CHECK constraint violation (`chk_cycle_dates`), HTTP 400 | Rejected with "Harvest date must be after sowing date" | **PASSED** |
| **TC-RES-01** | Resources | Insert Inventory Item | Name: "Potash (MOP)", Category: "FERTILIZER", Qty: 20 | Resource registered with available quantity | Stored in PostgreSQL with stock tracking | **PASSED** |
| **TC-RES-02** | Resources | Atomic Fertilizer Application | Usage: 2 bags DAP on Field 1 (Current stock: 24) | Fertilizer usage recorded, stock reduced from 24 to 22 | Trigger executed, stock decremented atomically | **PASSED** |
| **TC-RES-03** | Resources | Insufficient Stock Rollback | Request: 50 bags when stock is 22 | Transaction aborts, exception raised, no partial changes | Transaction rolled back safely | **PASSED** |
| **TC-EXP-01** | Expenses | Record Valid Expense | Farm: 1, Category: "LABOUR", Amount: ₹4000.00 | Expense logged in ledger and linked to Farm 1 | Ledger updated and reflected in financial view | **PASSED** |
| **TC-EXP-02** | Expenses | Reject Negative Expense | Amount: `-500.00` | PostgreSQL CHECK constraint violation (`chk_expense_amount_non_neg`) | Rejected with validation error | **PASSED** |
| **TC-HRV-01** | Harvest | Harvest Revenue Auto-Calculation | Qty: 14800 kg, Selling Price: ₹28.00/kg | Total Revenue automatically computed as ₹414,400.00 via Trigger | Trigger `trg_compute_harvest_revenue` sets exact revenue | **PASSED** |
| **TC-HRV-02** | Harvest | Auto State Transition | Sown cycle receiving harvest | Cycle status transitions from `ACTIVE` to `HARVESTED` | Trigger `trg_update_cycle_on_harvest` fired | **PASSED** |
| **TC-DB-01** | Database Views | Farm Performance View Query | Query `farm_performance_view` | Correctly aggregates total expenses, revenue, and net profit | Returns exact mathematical financial ledger metrics | **PASSED** |
| **TC-DB-02** | Database Triggers | Audit History Trigger Verification | Update crop cycle status `ACTIVE` -> `COMPLETED` | Entry generated in `crop_status_history` table | Row inserted with timestamp and old/new state | **PASSED** |
| **TC-NOSQL-01**| MongoDB | Insert Dynamic Crop Observation | Crop: "Tomato", leaf_color: "Chlorotic", whitefly_count: 14 | Dynamic document stored in MongoDB `crop_observations` | Stored successfully with polymorphic schema | **PASSED** |
| **TC-NOSQL-02**| MongoDB | Dynamic Schema Polymorphism | Crop: "Rice", standing_water_depth_cm: 4.5, panicle: false | Document stored without schema conflicts with Tomato | Polymorphic document stored seamlessly | **PASSED** |
| **TC-NOSQL-03**| MongoDB | Advisory Full-Text & Symptom Query | Query: "yellow leaves curl" | Retrieves relevant Tomato TYLCV and Early Blight advisories | Regex/Text pipeline matches relevant symptom tags | **PASSED** |
| **TC-NOSQL-04**| MongoDB | Multi-Stage Aggregation Pipeline | Execute advisory grouping by crop | Groups advisories by crop with category arrays & average votes | Aggregation pipeline returns faceted output | **PASSED** |
| **TC-DEMO-01** | DBMS Evaluation | Run Scenario Query Suite | Execute 20 complex SQL queries in `/admin/database-demo` | All 20 relational queries execute with real data outputs | Live console displays execution time and data grid | **PASSED** |
