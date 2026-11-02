-- ============================================================================
-- AGRIPULSE - Farm Management System Schema (PostgreSQL 16)
-- Target Tables: users, fields, crops, water_usage, fertilizer_usage
-- ============================================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS fertilizer_usage CASCADE;
DROP TABLE IF EXISTS water_usage CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'ADMIN')),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. FIELDS TABLE
CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    location VARCHAR(255) NOT NULL,
    area NUMERIC(10, 2) NOT NULL CHECK (area > 0),
    soil_type VARCHAR(100),
    water_source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CROPS TABLE
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_id INT NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    variety VARCHAR(100),
    season VARCHAR(50) NOT NULL,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    seed_quantity NUMERIC(10, 2) NOT NULL CHECK (seed_quantity > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNED', 'ACTIVE', 'HARVESTED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_harvest_after_sow CHECK (expected_harvest_date >= sowing_date)
);

-- 4. WATER USAGE TABLE
CREATE TABLE water_usage (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id INT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    method VARCHAR(50) NOT NULL,
    liters NUMERIC(12, 2) NOT NULL CHECK (liters > 0),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. FERTILIZER USAGE TABLE
CREATE TABLE fertilizer_usage (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id INT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(50) NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_kg > 0),
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (cost >= 0),
    method VARCHAR(60),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_fields_user_id ON fields(user_id);
CREATE INDEX idx_crops_user_id ON crops(user_id);
CREATE INDEX idx_crops_field_id ON crops(field_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_water_usage_user_id ON water_usage(user_id);
CREATE INDEX idx_water_usage_crop_id ON water_usage(crop_id);
CREATE INDEX idx_water_usage_date ON water_usage(date);
CREATE INDEX idx_fertilizer_usage_user_id ON fertilizer_usage(user_id);
CREATE INDEX idx_fertilizer_usage_crop_id ON fertilizer_usage(crop_id);
CREATE INDEX idx_fertilizer_usage_date ON fertilizer_usage(date);

-- ============================================================================
-- VIEWS FOR REPORTING & ANALYTICS
-- ============================================================================

-- View 1: Crop Resource Summary (Aggregating Water and Fertilizer usage per crop)
CREATE OR REPLACE VIEW view_crop_resource_summary AS
SELECT 
    c.id AS crop_id,
    c.user_id,
    c.name AS crop_name,
    c.variety,
    c.season,
    c.status,
    f.name AS field_name,
    f.location AS field_location,
    COALESCE(w.total_water_liters, 0) AS total_water_liters,
    COALESCE(w.water_log_count, 0) AS water_log_count,
    COALESCE(fert.total_fertilizer_kg, 0) AS total_fertilizer_kg,
    COALESCE(fert.total_fertilizer_cost, 0.00) AS total_fertilizer_cost
FROM crops c
JOIN fields f ON c.field_id = f.id
LEFT JOIN (
    SELECT 
        crop_id, 
        SUM(liters) AS total_water_liters,
        COUNT(id) AS water_log_count
    FROM water_usage 
    GROUP BY crop_id
) w ON c.id = w.crop_id
LEFT JOIN (
    SELECT 
        crop_id, 
        SUM(quantity_kg) AS total_fertilizer_kg,
        SUM(cost) AS total_fertilizer_cost
    FROM fertilizer_usage 
    GROUP BY crop_id
) fert ON c.id = fert.crop_id;

-- View 2: Field Crop Overview (Active farm fields with crop counts)
CREATE OR REPLACE VIEW view_field_crop_overview AS
SELECT 
    f.id AS field_id,
    f.user_id,
    f.name AS field_name,
    f.location,
    f.area,
    f.soil_type,
    f.water_source,
    COUNT(c.id) AS total_crops,
    COUNT(CASE WHEN c.status = 'ACTIVE' THEN 1 END) AS active_crops
FROM fields f
LEFT JOIN crops c ON f.id = c.field_id
GROUP BY f.id, f.user_id, f.name, f.location, f.area, f.soil_type, f.water_source;

-- ============================================================================
-- TRIGGERS & TRIGGER FUNCTIONS (Auto-update updated_at timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_fields_updated_at
    BEFORE UPDATE ON fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_crops_updated_at
    BEFORE UPDATE ON crops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_water_usage_updated_at
    BEFORE UPDATE ON water_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_fertilizer_usage_updated_at
    BEFORE UPDATE ON fertilizer_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
