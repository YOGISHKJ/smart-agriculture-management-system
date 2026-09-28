-- ============================================================================
-- AGRICULTURE RESOURCE AND FARM MANAGEMENT SYSTEM (AgriPulse)
-- Relational Database DDL Schema (PostgreSQL 14+)
-- Course: DBMS Level 3 Experiential Learning Project
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS crop_cycle_summary_view CASCADE;
DROP VIEW IF EXISTS resource_inventory_view CASCADE;
DROP VIEW IF EXISTS monthly_expense_view CASCADE;
DROP VIEW IF EXISTS farm_performance_view CASCADE;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS harvests CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS irrigation_records CASCADE;
DROP TABLE IF EXISTS fertilizer_usages CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS farming_activities CASCADE;
DROP TABLE IF EXISTS crop_status_history CASCADE;
DROP TABLE IF EXISTS crop_cycles CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. USERS TABLE
-- Demonstrates: PK, FK, UNIQUE, NOT NULL, DEFAULT, CHECK
-- ============================================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================================================
-- 3. FARMS TABLE
-- Demonstrates: PK, FK (Cascading), Positive Area Check, Soil Type
-- ============================================================================
CREATE TABLE farms (
    farm_id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    farm_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    area NUMERIC(10, 2) NOT NULL,
    soil_type VARCHAR(80) NOT NULL,
    ownership_type VARCHAR(50) NOT NULL DEFAULT 'OWNED',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_farm_area_positive CHECK (area > 0),
    CONSTRAINT chk_farm_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'LEASED', 'FALLOW'))
);

-- ============================================================================
-- 4. FIELDS TABLE
-- Demonstrates: 1-to-many relationship with Farm, Check constraints
-- ============================================================================
CREATE TABLE fields (
    field_id SERIAL PRIMARY KEY,
    farm_id INT NOT NULL REFERENCES farms(farm_id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    area NUMERIC(10, 2) NOT NULL,
    soil_type VARCHAR(80),
    irrigation_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_field_area_positive CHECK (area > 0),
    CONSTRAINT chk_field_irrigation_type CHECK (irrigation_type IN ('DRIP', 'SPRINKLER', 'FLOOD', 'CANAL', 'MANUAL', 'RAINFED'))
);

-- ============================================================================
-- 5. CROPS MASTER TABLE
-- ============================================================================
CREATE TABLE crops (
    crop_id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(150),
    category VARCHAR(50) NOT NULL,
    standard_maturity_days INT NOT NULL,
    water_requirement VARCHAR(50),
    optimal_soil VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_crop_category CHECK (category IN ('CEREAL', 'PULSE', 'VEGETABLE', 'FRUIT', 'CASH_CROP', 'OILSEED', 'HORTICULTURE')),
    CONSTRAINT chk_maturity_positive CHECK (standard_maturity_days > 0)
);

-- ============================================================================
-- 6. CROP CYCLES TABLE
-- Demonstrates: Multi-table FKs, Date comparison CHECK, State Management
-- ============================================================================
CREATE TABLE crop_cycles (
    cycle_id SERIAL PRIMARY KEY,
    field_id INT NOT NULL REFERENCES fields(field_id) ON DELETE RESTRICT,
    crop_id INT NOT NULL REFERENCES crops(crop_id) ON DELETE RESTRICT,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
    target_yield_kg NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cycle_dates CHECK (expected_harvest_date >= sowing_date),
    CONSTRAINT chk_cycle_actual_date CHECK (actual_harvest_date IS NULL OR actual_harvest_date >= sowing_date),
    CONSTRAINT chk_cycle_status CHECK (status IN ('PLANNED', 'ACTIVE', 'HARVESTED', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_cycle_yield_positive CHECK (target_yield_kg IS NULL OR target_yield_kg >= 0)
);

-- ============================================================================
-- 7. CROP STATUS AUDIT HISTORY
-- Demonstrates: Audit logging, relational event tracking
-- ============================================================================
CREATE TABLE crop_status_history (
    history_id SERIAL PRIMARY KEY,
    cycle_id INT NOT NULL REFERENCES crop_cycles(cycle_id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);

-- ============================================================================
-- 8. FARMING ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE farming_activities (
    activity_id SERIAL PRIMARY KEY,
    cycle_id INT NOT NULL REFERENCES crop_cycles(cycle_id) ON DELETE CASCADE,
    field_id INT NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    labour_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_activity_type CHECK (activity_type IN ('PLOUGHING', 'SOWING', 'FERTILIZER_APPLICATION', 'IRRIGATION', 'PEST_CONTROL', 'WEED_CONTROL', 'HARVESTING', 'PRUNING', 'SOIL_TESTING', 'OTHER')),
    CONSTRAINT chk_labour_hours_non_neg CHECK (labour_hours >= 0),
    CONSTRAINT chk_activity_cost_non_neg CHECK (cost >= 0)
);

-- ============================================================================
-- 9. RESOURCES & INVENTORY TABLE
-- ============================================================================
CREATE TABLE resources (
    resource_id SERIAL PRIMARY KEY,
    resource_name VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    purchase_price NUMERIC(10, 2) NOT NULL,
    available_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    minimum_stock NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier VARCHAR(150),
    purchase_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_resource_category CHECK (category IN ('FERTILIZER', 'PESTICIDE', 'SEED', 'EQUIPMENT', 'FUEL', 'PACKAGING', 'OTHER')),
    CONSTRAINT chk_resource_price_non_neg CHECK (purchase_price >= 0),
    CONSTRAINT chk_resource_quantity_non_neg CHECK (available_quantity >= 0),
    CONSTRAINT chk_resource_min_stock_non_neg CHECK (minimum_stock >= 0)
);

-- ============================================================================
-- 10. FERTILIZER USAGE TABLE
-- Demonstrates: Operational tracking tied to resource consumption & inventory
-- ============================================================================
CREATE TABLE fertilizer_usages (
    usage_id SERIAL PRIMARY KEY,
    cycle_id INT NOT NULL REFERENCES crop_cycles(cycle_id) ON DELETE CASCADE,
    resource_id INT NOT NULL REFERENCES resources(resource_id) ON DELETE RESTRICT,
    field_id INT NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    application_date DATE NOT NULL,
    quantity_applied NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL,
    application_method VARCHAR(60),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fertilizer_qty_pos CHECK (quantity_applied > 0),
    CONSTRAINT chk_fertilizer_cost_non_neg CHECK (cost >= 0)
);

-- ============================================================================
-- 11. IRRIGATION RECORDS TABLE
-- ============================================================================
CREATE TABLE irrigation_records (
    irrigation_id SERIAL PRIMARY KEY,
    cycle_id INT NOT NULL REFERENCES crop_cycles(cycle_id) ON DELETE CASCADE,
    field_id INT NOT NULL REFERENCES fields(field_id) ON DELETE CASCADE,
    irrigation_date DATE NOT NULL,
    water_quantity_liters NUMERIC(12, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    irrigation_method VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_irrigation_water_pos CHECK (water_quantity_liters > 0),
    CONSTRAINT chk_irrigation_duration_pos CHECK (duration_minutes > 0),
    CONSTRAINT chk_irrigation_method CHECK (irrigation_method IN ('DRIP', 'SPRINKLER', 'FLOOD', 'CANAL', 'MANUAL'))
);

-- ============================================================================
-- 12. EXPENSES TABLE
-- ============================================================================
CREATE TABLE expenses (
    expense_id SERIAL PRIMARY KEY,
    farm_id INT NOT NULL REFERENCES farms(farm_id) ON DELETE CASCADE,
    cycle_id INT REFERENCES crop_cycles(cycle_id) ON DELETE SET NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(30) NOT NULL DEFAULT 'CASH',
    receipt_number VARCHAR(80),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_expense_category CHECK (category IN ('SEEDS', 'FERTILIZER', 'PESTICIDES', 'LABOUR', 'IRRIGATION', 'EQUIPMENT', 'TRANSPORTATION', 'MAINTENANCE', 'OTHER')),
    CONSTRAINT chk_expense_amount_non_neg CHECK (amount >= 0),
    CONSTRAINT chk_payment_mode CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT'))
);

-- ============================================================================
-- 13. HARVESTS TABLE
-- Demonstrates: Revenue computation, Quality categorization, Harvest tracking
-- ============================================================================
CREATE TABLE harvests (
    harvest_id SERIAL PRIMARY KEY,
    cycle_id INT NOT NULL REFERENCES crop_cycles(cycle_id) ON DELETE RESTRICT,
    harvest_date DATE NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'KG',
    quality_grade VARCHAR(30) NOT NULL,
    selling_price_per_unit NUMERIC(10, 2) NOT NULL,
    total_revenue NUMERIC(12, 2) NOT NULL,
    buyer_name VARCHAR(120),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_harvest_quantity_pos CHECK (quantity_kg > 0),
    CONSTRAINT chk_harvest_price_non_neg CHECK (selling_price_per_unit >= 0),
    CONSTRAINT chk_harvest_revenue_non_neg CHECK (total_revenue >= 0),
    CONSTRAINT chk_harvest_grade CHECK (quality_grade IN ('GRADE_A', 'GRADE_B', 'GRADE_C', 'EXPORT_QUALITY', 'STANDARD'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
-- Index 1: Fast user email lookup for authentication
CREATE INDEX idx_users_email ON users(email);

-- Index 2: Farm filtering by owner
CREATE INDEX idx_farms_owner_id ON farms(owner_id);

-- Index 3: Field lookups by farm
CREATE INDEX idx_fields_farm_id ON fields(farm_id);

-- Index 4: Crop cycle lookups by crop and status
CREATE INDEX idx_crop_cycles_crop_status ON crop_cycles(crop_id, status);

-- Index 5: Crop cycle lookups by field
CREATE INDEX idx_crop_cycles_field_id ON crop_cycles(field_id);

-- Index 6: Farming activities timeline queries
CREATE INDEX idx_activities_cycle_date ON farming_activities(cycle_id, activity_date);

-- Index 7: Expense analysis index (farm, date, category)
CREATE INDEX idx_expenses_farm_date ON expenses(farm_id, expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Index 8: Harvest analytics index
CREATE INDEX idx_harvests_cycle_date ON harvests(cycle_id, harvest_date);

-- Index 9: Resource inventory tracking
CREATE INDEX idx_resources_category ON resources(category);

-- Index 10: Irrigation monitoring
CREATE INDEX idx_irrigation_cycle_date ON irrigation_records(cycle_id, irrigation_date);
