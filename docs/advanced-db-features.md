# 9. Advanced DBMS Concepts & Implementation
## Agriculture Resource and Farm Management System (AgriPulse)

---

## 1. ACID Transactions

### Business Scenario: Atomic Fertilizer Application Workflow
When a farmer records a fertilizer application on a crop cycle:
1. **Operation A:** Record is inserted into `fertilizer_usages`.
2. **Operation B:** Warehouse stock is deducted in `resources` table.
3. **Operation C:** An accounting expense ledger entry is recorded in `expenses` table.

If any operation fails (e.g., insufficient warehouse stock or invalid farm FK), the entire transaction rolls back (`ROLLBACK`), preserving ledger integrity.

```sql
BEGIN;

-- Step 1: Insert Fertilizer Usage Record
INSERT INTO fertilizer_usages (cycle_id, resource_id, field_id, application_date, quantity_applied, cost, application_method)
VALUES (1, 2, 1, CURRENT_DATE, 3.0, 4050.00, 'Fertigation via Drip');

-- Step 2: Deduct Available Stock (Enforced via Trigger / Transaction Step)
UPDATE resources
SET available_quantity = available_quantity - 3.0,
    updated_at = CURRENT_TIMESTAMP
WHERE resource_id = 2 AND available_quantity >= 3.0;

-- Step 3: Record Corresponding Expense Ledger
INSERT INTO expenses (farm_id, cycle_id, expense_date, category, amount, payment_mode, description)
VALUES (1, 1, CURRENT_DATE, 'FERTILIZER', 4050.00, 'UPI', 'Fertilizer application: DAP on North Tomato Parcel');

COMMIT;
```

---

## 2. Database Triggers (PL/pgSQL)

| Trigger Name | Target Table | Event | Stored Procedure | Business Logic Enforced |
| :--- | :--- | :--- | :--- | :--- |
| `trg_compute_harvest_revenue` | `harvests` | BEFORE INSERT / UPDATE | `fn_compute_harvest_revenue()` | Guarantees `total_revenue = quantity_kg * selling_price_per_unit` |
| `trg_deduct_resource_on_fertilizer_usage` | `fertilizer_usages` | AFTER INSERT | `fn_deduct_resource_on_fertilizer_usage()` | Verifies stock availability and atomically subtracts quantity from `resources` |
| `trg_log_crop_status_change` | `crop_cycles` | AFTER UPDATE OF status | `fn_log_crop_status_change()` | Inserts audit trace in `crop_status_history` on any lifecycle change |
| `trg_update_cycle_on_harvest` | `harvests` | AFTER INSERT | `fn_update_cycle_on_harvest()` | Automatically updates crop cycle status to `'HARVESTED'` and records `actual_harvest_date` |

---

## 3. Relational Views

1. **`farm_performance_view`:**
   - Evaluates multi-table financial metrics: joins `farms`, `users`, `fields`, `crop_cycles`, `crops`, `expenses`, and `harvests` to produce real-time Gross Revenue, Total Expenses, and Net Estimated Profit.
2. **`monthly_expense_view`:**
   - Employs `DATE_TRUNC('month', expense_date)` to aggregate monthly expense trends by farm and category with peak transaction costs.
3. **`resource_inventory_view`:**
   - Evaluates inventory health using `CASE` statements to flag `CRITICAL_LOW`, `REORDER_REQUIRED`, and `ADEQUATE` stock levels alongside total monetary valuation.
4. **`crop_cycle_summary_view`:**
   - Summarizes total water consumed (liters), fertilizer applied, activities count, and net profit per crop cycle.

---

## 4. Indexing Architecture & Rationale

| Index Name | Table & Columns | Index Type | Optimization Rationale |
| :--- | :--- | :--- | :--- |
| `idx_users_email` | `users(email)` | B-Tree | Accelerates authentication lookup queries to sub-millisecond execution. |
| `idx_farms_owner_id` | `farms(owner_id)` | B-Tree | Speeds up filtering farms owned by the logged-in farmer. |
| `idx_fields_farm_id` | `fields(farm_id)` | B-Tree | Optimizes foreign key joins between farms and child fields. |
| `idx_crop_cycles_crop_status` | `crop_cycles(crop_id, status)` | Composite B-Tree | Accelerates dashboard queries filtering active crop cycles by crop variety. |
| `idx_activities_cycle_date` | `farming_activities(cycle_id, activity_date)` | Composite B-Tree | Optimizes activity timeline and chronological logs. |
| `idx_expenses_farm_date` | `expenses(farm_id, expense_date)` | Composite B-Tree | Accelerates monthly and yearly financial aggregation reports. |
| `idx_harvests_cycle_date` | `harvests(cycle_id, harvest_date)` | Composite B-Tree | Optimizes revenue calculations and harvest history lookups. |

---

## 5. MongoDB Aggregation Pipelines

1. **Advisory Topic & Crop Grouping Pipeline:**
   - Employs `$unwind` on keyword tags, `$group` by crop name, and `$avg` on community ratings.
2. **Dynamic Symptom Frequency Aggregation:**
   - Unwinds polymorphic symptom arrays across crop observations and groups by crop and symptom to detect emerging pest hotspots.
3. **Multi-Faceted Agricultural Intelligence (`$facet`):**
   - Executes parallel aggregations across severity levels, categories, and top-rated agronomic advisories in a single database roundtrip.
