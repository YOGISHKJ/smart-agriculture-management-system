-- ============================================================================
-- AGRIPULSE - Database Seed Data (PostgreSQL 16)
-- Demo Credentials:
-- Farmer: farmer@agripulse.com / Farmer@123
-- Admin:  admin@agripulse.com  / Admin@123
-- ============================================================================

-- 1. Insert Users
-- Passwords below are bcrypt hashes:
-- Farmer@123 -> $2a$10$rRsX0qpVl1wAKIEgK53.4O8KyQvepyX.Lb7oDukWj/FvxFba.l85u
-- Admin@123  -> $2a$10$jbO6zR8IJQkjknhKaScNy.jIJt7rT1BQObXlM7py0QWGjmMz5M1/6
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
(1, 'Ravi Kumar', 'farmer@agripulse.com', '$2a$10$rRsX0qpVl1wAKIEgK53.4O8KyQvepyX.Lb7oDukWj/FvxFba.l85u', 'FARMER', '+91 9876543210'),
(2, 'System Administrator', 'admin@agripulse.com', '$2a$10$jbO6zR8IJQkjknhKaScNy.jIJt7rT1BQObXlM7py0QWGjmMz5M1/6', 'ADMIN', '+91 9845012345')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Fields (Assigned to Farmer: user_id = 1)
INSERT INTO fields (id, user_id, name, location, area, soil_type, water_source, notes) VALUES
(1, 1, 'North Tomato Parcel', 'Plot 4A, Green Valley', 3.50, 'Red Sandy Loam', 'Borewell & Drip Line', 'Equipped with inline automated drip fertigation.'),
(2, 1, 'South Greenhouse Block', 'Sector 2, Green Valley', 2.00, 'Clay Loam', 'Canal Irrigation', 'Polyhouse protected cultivation parcel for vegetables.'),
(3, 1, 'East Grain Acreage', 'Upper Basin, Green Valley', 5.00, 'Black Alluvial Clay', 'River Lift & Rainwater Pond', 'Open fertile field designated for cereal crops.')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Crops (Assigned to Farmer: user_id = 1)
INSERT INTO crops (id, user_id, field_id, name, variety, season, sowing_date, expected_harvest_date, seed_quantity, status) VALUES
(1, 1, 1, 'Hybrid Tomato', 'Arka Rakshak F1', 'Rabi', '2026-01-10', '2026-04-15', 5.00, 'ACTIVE'),
(2, 1, 2, 'Green Chilli', 'G4 Super Hot', 'Zaid', '2026-02-01', '2026-06-20', 3.50, 'ACTIVE'),
(3, 1, 3, 'Durum Wheat', 'HD 4728 Pusa Malvi', 'Rabi', '2025-11-15', '2026-03-25', 120.00, 'HARVESTED'),
(4, 1, 2, 'Sweet Corn', 'Sugar 75 Hybrid', 'Kharif', '2026-03-01', '2026-05-25', 15.00, 'PLANNED')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Water Usage
INSERT INTO water_usage (id, user_id, crop_id, date, method, liters, duration_minutes, notes) VALUES
(1, 1, 1, '2026-02-01', 'DRIP', 3500.00, 120, 'Vegetative stage drip cycle with mulch retention'),
(2, 1, 1, '2026-02-10', 'DRIP', 4200.00, 140, 'Pre-flowering regular drip cycle'),
(3, 1, 1, '2026-02-20', 'DRIP', 5000.00, 160, 'Peak fruit setting moisture supply'),
(4, 1, 2, '2026-02-05', 'SPRINKLER', 2800.00, 90, 'Chilli nursery bed misting'),
(5, 1, 2, '2026-02-18', 'SPRINKLER', 3200.00, 100, 'Micro-sprinkler ambient cooling cycle'),
(6, 1, 3, '2025-12-05', 'FLOOD', 18000.00, 300, 'First flood watering at crown root initiation'),
(7, 1, 3, '2026-01-15', 'FLOOD', 15000.00, 240, 'Tillering stage flood irrigation cycle')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Fertilizer Usage
INSERT INTO fertilizer_usage (id, user_id, crop_id, date, name, type, quantity_kg, cost, method, notes) VALUES
(1, 1, 1, '2026-01-15', 'Neem Coated Urea (46% N)', 'CHEMICAL', 50.00, 350.00, 'Fertigation', 'Split dose 1 for vegetative canopy growth'),
(2, 1, 1, '2026-02-05', 'NPK 19:19:19 Soluble', 'CHEMICAL', 25.00, 950.00, 'Fertigation', 'Balanced booster through drip line'),
(3, 1, 1, '2026-02-22', 'Organic Vermicompost', 'ORGANIC', 150.00, 1200.00, 'Soil Application', 'Basal ring application around tomato root zones'),
(4, 1, 2, '2026-02-10', 'Di-Ammonium Phosphate (DAP)', 'CHEMICAL', 30.00, 810.00, 'Soil Application', 'Root development booster for green chillies'),
(5, 1, 2, '2026-02-25', 'Seaweed Extract Bio-stimulant', 'BIO_FERTILIZER', 10.00, 650.00, 'Foliar Spray', 'Micronutrient foliar spray for flowering vigour'),
(6, 1, 3, '2025-11-20', 'Single Super Phosphate (SSP)', 'CHEMICAL', 75.00, 1125.00, 'Broadcasting', 'Basal dressing before sowing wheat'),
(7, 1, 3, '2026-01-05', 'Muriate of Potash (MOP)', 'CHEMICAL', 40.00, 960.00, 'Broadcasting', 'Grain filling enhancement application')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to prevent PK collision on subsequent inserts
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('fields_id_seq', (SELECT COALESCE(MAX(id), 1) FROM fields));
SELECT setval('crops_id_seq', (SELECT COALESCE(MAX(id), 1) FROM crops));
SELECT setval('water_usage_id_seq', (SELECT COALESCE(MAX(id), 1) FROM water_usage));
SELECT setval('fertilizer_usage_id_seq', (SELECT COALESCE(MAX(id), 1) FROM fertilizer_usage));
