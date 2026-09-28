# 5. Database Design & Entity-Relationship (ER) Model
## Agriculture Resource and Farm Management System (AgriPulse)

---

## 1. Entity-Relationship (ER) Diagram (Mermaid)

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

    ROLE {
        int role_id PK
        string role_name UK
        string description
    }

    USER {
        int user_id PK
        string name
        string email UK
        string password_hash
        string phone
        int role_id FK
        boolean is_active
        timestamp created_at
    }

    FARM {
        int farm_id PK
        int owner_id FK
        string farm_name
        string location
        numeric area
        string soil_type
        string ownership_type
        string status
    }

    FIELD {
        int field_id PK
        int farm_id FK
        string field_name
        numeric area
        string soil_type
        string irrigation_type
    }

    CROP {
        int crop_id PK
        string crop_name UK
        string scientific_name
        string category
        int standard_maturity_days
        string water_requirement
        string optimal_soil
    }

    CROP_CYCLE {
        int cycle_id PK
        int field_id FK
        int crop_id FK
        date sowing_date
        date expected_harvest_date
        date actual_harvest_date
        string status
        numeric target_yield_kg
        text notes
    }

    CROP_STATUS_HISTORY {
        int history_id PK
        int cycle_id FK
        string previous_status
        string new_status
        timestamp changed_at
        text remarks
    }

    FARMING_ACTIVITY {
        int activity_id PK
        int cycle_id FK
        int field_id FK
        date activity_date
        string activity_type
        text description
        numeric labour_hours
        numeric cost
    }

    RESOURCE {
        int resource_id PK
        string resource_name
        string category
        string unit
        numeric purchase_price
        numeric available_quantity
        numeric minimum_stock
        string supplier
        date purchase_date
    }

    FERTILIZER_USAGE {
        int usage_id PK
        int cycle_id FK
        int resource_id FK
        int field_id FK
        date application_date
        numeric quantity_applied
        numeric cost
        string application_method
    }

    IRRIGATION_RECORD {
        int irrigation_id PK
        int cycle_id FK
        int field_id FK
        date irrigation_date
        numeric water_quantity_liters
        int duration_minutes
        string irrigation_method
    }

    EXPENSE {
        int expense_id PK
        int farm_id FK
        int cycle_id FK
        date expense_date
        string category
        numeric amount
        string payment_mode
        string receipt_number
        text description
    }

    HARVEST {
        int harvest_id PK
        int cycle_id FK
        date harvest_date
        numeric quantity_kg
        string unit
        string quality_grade
        numeric selling_price_per_unit
        numeric total_revenue
        string buyer_name
        text notes
    }
```

---

## 2. Cardinality Analysis & Mapping to Relational Tables

| Relationship | Entities Involved | Cardinality | Relational Implementation |
| :--- | :--- | :--- | :--- |
| **Role Assignment** | `ROLE` (1) - `USER` (M) | 1:N | `users.role_id` -> `roles.role_id` (RESTRICT) |
| **Farm Ownership** | `USER` (1) - `FARM` (M) | 1:N | `farms.owner_id` -> `users.user_id` (CASCADE) |
| **Field Partitioning** | `FARM` (1) - `FIELD` (M) | 1:N | `fields.farm_id` -> `farms.farm_id` (CASCADE) |
| **Crop Cultivation** | `FIELD` (1) - `CROP_CYCLE` (M) | 1:N | `crop_cycles.field_id` -> `fields.field_id` (RESTRICT) |
| **Crop Type** | `CROP` (1) - `CROP_CYCLE` (M) | 1:N | `crop_cycles.crop_id` -> `crops.crop_id` (RESTRICT) |
| **Status Audit** | `CROP_CYCLE` (1) - `CROP_STATUS_HISTORY` (M) | 1:N | `crop_status_history.cycle_id` -> `crop_cycles.cycle_id` (CASCADE) |
| **Activity Execution** | `CROP_CYCLE` (1) - `FARMING_ACTIVITY` (M) | 1:N | `farming_activities.cycle_id` -> `crop_cycles.cycle_id` (CASCADE) |
| **Resource Consumption** | `RESOURCE` (1) - `FERTILIZER_USAGE` (M) | 1:N | `fertilizer_usages.resource_id` -> `resources.resource_id` (RESTRICT) |
| **Irrigation Events** | `CROP_CYCLE` (1) - `IRRIGATION_RECORD` (M) | 1:N | `irrigation_records.cycle_id` -> `crop_cycles.cycle_id` (CASCADE) |
| **Farm Expenditure** | `FARM` (1) - `EXPENSE` (M) | 1:N | `expenses.farm_id` -> `farms.farm_id` (CASCADE) |
| **Harvest Yields** | `CROP_CYCLE` (1) - `HARVEST` (M) | 1:N | `harvests.cycle_id` -> `crop_cycles.cycle_id` (RESTRICT) |

---

## 3. MongoDB Document Mapping Strategy

While the above 13 relational tables handle structured operational state, MongoDB handles the non-relational agronomic layer:

1. **`crop_observations`**: Correlated by `farmer_id`, `farm_id`, and `crop` name, storing dynamic morphological and symptom observations without requiring alter-table operations when new crops or sensors are introduced.
2. **`agricultural_advisories`**: Global agronomic knowledge base accessed through multi-tag querying and symptom search.
3. **`farming_notes`**: Dynamic farmer daily logs.
4. **`weather_records`**: Embedded micro-climate time-series documents.
