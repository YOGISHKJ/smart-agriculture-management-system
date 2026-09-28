-- ============================================================================
-- AGRICULTURE RESOURCE AND FARM MANAGEMENT SYSTEM
-- PostgreSQL Seed Script (Realistic Agricultural Data)
-- ============================================================================

-- 1. Insert Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System Administrator with full access to manage users, crops, resources, advisories, and system analytics'),
(2, 'FARMER', 'Registered farm owner capable of managing farms, fields, crop cycles, activities, expenses, and harvests'),
(3, 'OFFICER', 'Agricultural Extension Officer providing agronomic advisories, inspecting observations, and issuing guidelines')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Insert Users
-- Passwords below are bcrypt hashes for:
-- Admin: Admin@123
-- Farmer: Farmer@123
-- Officer: Officer@123
INSERT INTO users (user_id, name, email, password_hash, phone, role_id, is_active) VALUES
(1, 'System Administrator', 'admin@agripulse.com', '$2a$10$wFqK1l81Fj89hZ6gZ7oBbeU6z5nK4G0hZ4JvT7nN0y8B1P.4k1ncy', '+91 9845012345', 1, TRUE),
(2, 'Ravi Kumar', 'ravi.kumar@agripulse.com', '$2a$10$wFqK1l81Fj89hZ6gZ7oBbeU6z5nK4G0hZ4JvT7nN0y8B1P.4k1ncy', '+91 9876543210', 2, TRUE),
(3, 'Sunita Devi', 'sunita.devi@agripulse.com', '$2a$10$wFqK1l81Fj89hZ6gZ7oBbeU6z5nK4G0hZ4JvT7nN0y8B1P.4k1ncy', '+91 9812345678', 2, TRUE),
(4, 'Dr. Rajesh Sharma', 'dr.sharma@agripulse.com', '$2a$10$wFqK1l81Fj89hZ6gZ7oBbeU6z5nK4G0hZ4JvT7nN0y8B1P.4k1ncy', '+91 9890123456', 3, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Farms
INSERT INTO farms (farm_id, owner_id, farm_name, location, area, soil_type, ownership_type, status) VALUES
(1, 2, 'Green Valley Farm', 'Kolar Agricultural Zone, Karnataka', 5.00, 'Red Sandy Loam', 'OWNED', 'ACTIVE'),
(2, 3, 'Sunrise Organic Estate', 'Mysuru Organic Belt, Karnataka', 8.50, 'Black Alluvial Clay', 'OWNED', 'ACTIVE'),
(3, 2, 'Cauvery Delta Agro Fields', 'Mandya Irrigation Basin, Karnataka', 12.00, 'Clay Loam', 'LEASED', 'ACTIVE')
ON CONFLICT (farm_id) DO NOTHING;

-- 4. Insert Fields
INSERT INTO fields (field_id, farm_id, field_name, area, soil_type, irrigation_type) VALUES
(1, 1, 'North Tomato Parcel', 2.50, 'Red Sandy Loam', 'DRIP'),
(2, 1, 'South Polyhouse Block', 2.50, 'Red Sandy Loam', 'SPRINKLER'),
(3, 2, 'Sunrise Paddy Basin', 5.00, 'Black Alluvial Clay', 'FLOOD'),
(4, 2, 'Sunrise Pulse Ridge', 3.50, 'Clay Loam', 'DRIP'),
(5, 3, 'Delta Sugarcane Sector A', 8.00, 'Clay Loam', 'CANAL'),
(6, 3, 'Delta Wheat Plot B', 4.00, 'Clay Loam', 'SPRINKLER')
ON CONFLICT (field_id) DO NOTHING;

-- 5. Insert Crops Master Data
INSERT INTO crops (crop_id, crop_name, scientific_name, category, standard_maturity_days, water_requirement, optimal_soil) VALUES
(1, 'Hybrid Tomato (Arka Rakshak)', 'Solanum lycopersicum', 'VEGETABLE', 90, 'MEDIUM', 'Well-drained sandy loam pH 6.0-7.0'),
(2, 'Basmati Rice (Pusa 1121)', 'Oryza sativa', 'CEREAL', 130, 'HIGH', 'Heavy clay alluvial soil'),
(3, 'Durum Wheat (HD 4728)', 'Triticum durum', 'CEREAL', 115, 'MEDIUM', 'Fertile clay loam'),
(4, 'Sugarcane (Co 86032)', 'Saccharum officinarum', 'CASH_CROP', 360, 'HIGH', 'Deep rich loamy soil'),
(5, 'Green Chilli (G4 Hybrid)', 'Capsicum annuum', 'VEGETABLE', 120, 'MEDIUM', 'Well-aerated sandy loam'),
(6, 'Bengal Gram / Chickpea (JG 11)', 'Cicer arietinum', 'PULSE', 100, 'LOW', 'Loamy to clay loam dry soil'),
(7, 'BT Cotton (Bollgard II)', 'Gossypium hirsutum', 'CASH_CROP', 160, 'MEDIUM', 'Deep black cotton soil'),
(8, 'Potato (Kufri Jyoti)', 'Solanum tuberosum', 'VEGETABLE', 85, 'MEDIUM', 'Loose, friable sandy loam'),
(9, 'Soybean (JS 335)', 'Glycine max', 'OILSEED', 95, 'LOW', 'Well-drained fertile loam'),
(10, 'Sweet Corn (Sugar 75)', 'Zea mays', 'CEREAL', 75, 'MEDIUM', 'Well-drained loam pH 5.8-6.8')
ON CONFLICT (crop_id) DO NOTHING;

-- 6. Insert Crop Cycles
INSERT INTO crop_cycles (cycle_id, field_id, crop_id, sowing_date, expected_harvest_date, actual_harvest_date, status, target_yield_kg, notes) VALUES
(1, 1, 1, '2025-01-10', '2025-04-15', '2025-04-12', 'HARVESTED', 15000.00, 'High yield test cycle with integrated drip fertigation protocol'),
(2, 2, 5, '2025-02-01', '2025-06-30', NULL, 'ACTIVE', 4500.00, 'Green chilli nursery transplanting with micro-sprinkler misting'),
(3, 3, 2, '2024-11-15', '2025-03-25', '2025-03-20', 'COMPLETED', 18000.00, 'Basmati aromatic paddy with System of Rice Intensification (SRI)'),
(4, 4, 6, '2025-01-20', '2025-05-15', NULL, 'ACTIVE', 3200.00, 'Chickpea intercropped with border coriander rows for IPM'),
(5, 5, 4, '2024-10-01', '2025-10-01', NULL, 'ACTIVE', 65000.00, 'Sugarcane ratoon trial with trash mulching moisture conservation')
ON CONFLICT (cycle_id) DO NOTHING;

-- 7. Insert Resources & Farm Inventory
INSERT INTO resources (resource_id, resource_name, category, unit, purchase_price, available_quantity, minimum_stock, supplier, purchase_date) VALUES
(1, 'Neem Coated Urea (46% N)', 'FERTILIZER', '50KG_BAG', 350.00, 42.00, 10.00, 'IFFCO Agri Supply Hub', '2025-01-05'),
(2, 'DAP (Di-Ammonium Phosphate 18:46:0)', 'FERTILIZER', '50KG_BAG', 1350.00, 24.00, 8.00, 'Coromandel International', '2025-01-05'),
(3, 'MOP (Muriate of Potash 0:0:60)', 'FERTILIZER', '50KG_BAG', 1200.00, 20.00, 6.00, 'KRIBHCO Farm Solutions', '2025-01-08'),
(4, 'Water Soluble NPK (19:19:19)', 'FERTILIZER', '25KG_BAG', 950.00, 14.00, 5.00, 'Mahadhan Crop Care', '2025-01-12'),
(5, 'Organic Neem Seed Cake Fertilizer', 'FERTILIZER', '25KG_BAG', 480.00, 50.00, 15.00, 'Green Earth Organics', '2025-01-04'),
(6, 'Hybrid Arka Rakshak Tomato F1 Seeds', 'SEED', '100G_PACKET', 650.00, 12.00, 4.00, 'IIHR Seed Distribution Centre', '2025-01-02'),
(7, 'Neem Baan 10000 PPM Bio-Pesticide', 'PESTICIDE', 'LITRE', 550.00, 28.00, 8.00, 'Multiplex Bio Solutions', '2025-01-15'),
(8, 'Drip Inline Emitting Lateral Pipe 16mm', 'EQUIPMENT', '100M_ROLL', 2200.00, 8.00, 2.00, 'Jain Irrigation Systems', '2025-01-03'),
(9, 'Trichoderma Viride Bio-Fungicide', 'PESTICIDE', 'KG', 280.00, 18.00, 5.00, 'Karnataka Agro Industries', '2025-01-10'),
(10, 'Agricultural Diesel for Pump & Tractor', 'FUEL', 'LITRE', 90.00, 150.00, 40.00, 'Indian Oil Rural Outlet', '2025-01-05')
ON CONFLICT (resource_id) DO NOTHING;

-- 8. Insert Fertilizer Usage
INSERT INTO fertilizer_usages (usage_id, cycle_id, resource_id, field_id, application_date, quantity_applied, cost, application_method, notes) VALUES
(1, 1, 2, 1, '2025-01-12', 3.00, 4050.00, 'Basal Soil Application', 'Applied during field bed preparation for root development'),
(2, 1, 4, 1, '2025-02-05', 2.00, 1900.00, 'Fertigation via Drip', 'Vegetative growth booster fertigation cycle 1'),
(3, 1, 3, 1, '2025-03-01', 2.00, 2400.00, 'Fertigation via Drip', 'Potash booster during tomato fruit set and sizing'),
(4, 2, 1, 2, '2025-02-15', 2.00, 700.00, 'Side Dressing', 'Chilli vegetative phase nitrogen boost'),
(5, 3, 1, 3, '2024-12-05', 4.00, 1400.00, 'Broadcasting', 'Tillering stage nitrogen split application for Basmati paddy')
ON CONFLICT (usage_id) DO NOTHING;

-- 9. Insert Irrigation Records
INSERT INTO irrigation_records (irrigation_id, cycle_id, field_id, irrigation_date, water_quantity_liters, duration_minutes, irrigation_method, notes) VALUES
(1, 1, 1, '2025-01-15', 4500.00, 120, 'DRIP', 'Initial seedling establishment moisture cycle'),
(2, 1, 1, '2025-02-02', 6200.00, 150, 'DRIP', 'Flowering stage regulated deficit irrigation'),
(3, 1, 1, '2025-02-20', 7500.00, 180, 'DRIP', 'Fruit swelling stage critical moisture supply'),
(4, 1, 1, '2025-03-10', 6800.00, 160, 'DRIP', 'Ripening stage controlled watering'),
(5, 2, 2, '2025-02-10', 3800.00, 90, 'SPRINKLER', 'Polyhouse micro-climate humidity maintenance'),
(6, 3, 3, '2024-11-20', 25000.00, 360, 'FLOOD', 'Initial standing water layer creation for SRI paddy'),
(7, 3, 3, '2024-12-18', 22000.00, 300, 'FLOOD', 'Paddy panicle initiation water management')
ON CONFLICT (irrigation_id) DO NOTHING;

-- 10. Insert Farming Activities
INSERT INTO farming_activities (activity_id, cycle_id, field_id, activity_date, activity_type, description, labour_hours, cost) VALUES
(1, 1, 1, '2025-01-08', 'PLOUGHING', 'Deep summer ploughing and rotavator bed formation', 12.00, 4800.00),
(2, 1, 1, '2025-01-10', 'SOWING', 'Transplanting 25-day old Arka Rakshak tomato seedlings with spacing', 18.00, 5400.00),
(3, 1, 1, '2025-01-25', 'WEED_CONTROL', 'Manual hand weeding and silver mulching adjustment', 16.00, 4000.00),
(4, 1, 1, '2025-02-14', 'PEST_CONTROL', 'Preventive spray of Neem Baan 10000 ppm against whiteflies', 6.00, 1800.00),
(5, 1, 1, '2025-03-05', 'PRUNING', 'Staking with bamboo poles, trellising twine, and lateral sucker pruning', 20.00, 6000.00),
(6, 1, 1, '2025-04-12', 'HARVESTING', 'First and second bulk harvest picking and sorting into plastic crates', 32.00, 9600.00),
(7, 2, 2, '2025-02-01', 'SOWING', 'Green chilli hybrid seedling transplantation under sprinkler block', 14.00, 4200.00),
(8, 3, 3, '2024-11-15', 'SOWING', 'Machine mechanical transplanting of Basmati paddy seedlings', 16.00, 6500.00),
(9, 3, 3, '2025-03-20', 'HARVESTING', 'Combined harvester operation and paddy bagging', 24.00, 14500.00)
ON CONFLICT (activity_id) DO NOTHING;

-- 11. Insert Expenses
INSERT INTO expenses (expense_id, farm_id, cycle_id, expense_date, category, amount, payment_mode, receipt_number, description) VALUES
(1, 1, 1, '2025-01-02', 'SEEDS', 3900.00, 'UPI', 'REC-2025-001', 'Purchase of 6 packets of Arka Rakshak F1 Tomato certified seeds'),
(2, 1, 1, '2025-01-08', 'EQUIPMENT', 4800.00, 'CASH', 'REC-2025-002', 'Tractor hiring charges for deep chisel ploughing & bed shaping'),
(3, 1, 1, '2025-01-12', 'FERTILIZER', 4050.00, 'UPI', 'REC-2025-003', 'Basal dose DAP application cost'),
(4, 1, 1, '2025-01-25', 'LABOUR', 4000.00, 'CASH', 'REC-2025-004', 'Skilled labour wages for weed removal and mulch fastening'),
(5, 1, 1, '2025-02-05', 'FERTILIZER', 1900.00, 'UPI', 'REC-2025-005', 'NPK 19-19-19 water soluble fertilizer for drip system'),
(6, 1, 1, '2025-02-14', 'PESTICIDES', 1800.00, 'UPI', 'REC-2025-006', 'Bio-pesticide neem formulation spray cost and labour'),
(7, 1, 1, '2025-03-01', 'FERTILIZER', 2400.00, 'UPI', 'REC-2025-007', 'Potash MOP application for tomato fruit hardening'),
(8, 1, 1, '2025-03-05', 'EQUIPMENT', 6000.00, 'CASH', 'REC-2025-008', 'Bamboo staking poles and horticultural trellising thread'),
(9, 1, 1, '2025-04-12', 'LABOUR', 9600.00, 'CASH', 'REC-2025-009', 'Harvesting, grading, and crate packaging labour'),
(10, 1, 1, '2025-04-12', 'TRANSPORTATION', 3500.00, 'UPI', 'REC-2025-010', 'Mini-truck logistics to Bangalore APMC Wholesale Market'),
(11, 2, 3, '2024-11-15', 'SEEDS', 4200.00, 'BANK_TRANSFER', 'REC-2024-089', 'Basmati Pusa 1121 certified foundation seeds'),
(12, 2, 3, '2025-03-20', 'EQUIPMENT', 14500.00, 'BANK_TRANSFER', 'REC-2025-033', 'Combined paddy harvester rental and operator fees')
ON CONFLICT (expense_id) DO NOTHING;

-- 12. Insert Harvest Records
INSERT INTO harvests (harvest_id, cycle_id, harvest_date, quantity_kg, unit, quality_grade, selling_price_per_unit, total_revenue, buyer_name, notes) VALUES
(1, 1, '2025-04-12', 14800.00, 'KG', 'GRADE_A', 28.00, 414400.00, 'Bangalore Horticulture Wholesale Traders', 'Grade-A firm red tomatoes sold at APMC market Yard 4'),
(2, 3, '2025-03-20', 17500.00, 'KG', 'EXPORT_QUALITY', 36.00, 630000.00, 'Royal Grain Export Corporation', 'Premium Grade Basmati Paddy with optimal 12% grain moisture')
ON CONFLICT (harvest_id) DO NOTHING;

-- Reset sequences for auto-increment integrity in PostgreSQL
SELECT setval('roles_role_id_seq', (SELECT MAX(role_id) FROM roles));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('farms_farm_id_seq', (SELECT MAX(farm_id) FROM farms));
SELECT setval('fields_field_id_seq', (SELECT MAX(field_id) FROM fields));
SELECT setval('crops_crop_id_seq', (SELECT MAX(crop_id) FROM crops));
SELECT setval('crop_cycles_cycle_id_seq', (SELECT MAX(cycle_id) FROM crop_cycles));
SELECT setval('resources_resource_id_seq', (SELECT MAX(resource_id) FROM resources));
SELECT setval('fertilizer_usages_usage_id_seq', (SELECT MAX(usage_id) FROM fertilizer_usages));
SELECT setval('irrigation_records_irrigation_id_seq', (SELECT MAX(irrigation_id) FROM irrigation_records));
SELECT setval('farming_activities_activity_id_seq', (SELECT MAX(activity_id) FROM farming_activities));
SELECT setval('expenses_expense_id_seq', (SELECT MAX(expense_id) FROM expenses));
SELECT setval('harvests_harvest_id_seq', (SELECT MAX(harvest_id) FROM harvests));
