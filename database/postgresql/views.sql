-- ============================================================================
-- AGRICULTURE RESOURCE AND FARM MANAGEMENT SYSTEM
-- PostgreSQL Database Views for Analytics and Reporting
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VIEW 1: Farm Performance & Financial Yield Analysis
-- Demonstrates: Multi-table JOINs, Aggregations, COALESCE, Calculated Fields
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW farm_performance_view AS
SELECT 
    u.user_id AS farmer_id,
    u.name AS farmer_name,
    f.farm_id,
    f.farm_name,
    f.location,
    f.area AS total_farm_area_acres,
    c.crop_id,
    c.crop_name,
    cc.cycle_id,
    cc.status AS cycle_status,
    cc.sowing_date,
    COALESCE(SUM(DISTINCT e.amount), 0.00) AS total_expenses,
    COALESCE(SUM(DISTINCT h.quantity_kg), 0.00) AS total_harvest_kg,
    COALESCE(SUM(DISTINCT h.total_revenue), 0.00) AS total_revenue,
    (COALESCE(SUM(DISTINCT h.total_revenue), 0.00) - COALESCE(SUM(DISTINCT e.amount), 0.00)) AS estimated_net_profit
FROM farms f
JOIN users u ON f.owner_id = u.user_id
JOIN fields fld ON f.farm_id = fld.farm_id
JOIN crop_cycles cc ON fld.field_id = cc.field_id
JOIN crops c ON cc.crop_id = c.crop_id
LEFT JOIN expenses e ON f.farm_id = e.farm_id AND (e.cycle_id = cc.cycle_id OR e.cycle_id IS NULL)
LEFT JOIN harvests h ON cc.cycle_id = h.cycle_id
GROUP BY 
    u.user_id, u.name, f.farm_id, f.farm_name, f.location, f.area,
    c.crop_id, c.crop_name, cc.cycle_id, cc.status, cc.sowing_date;

-- ----------------------------------------------------------------------------
-- VIEW 2: Monthly Farm Expense Analytics
-- Demonstrates: Date truncation, Grouping by time dimensions, Aggregates
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW monthly_expense_view AS
SELECT 
    f.farm_id,
    f.farm_name,
    DATE_TRUNC('month', e.expense_date)::DATE AS expense_month,
    TO_CHAR(e.expense_date, 'Mon YYYY') AS formatted_month,
    e.category,
    COUNT(e.expense_id) AS transaction_count,
    SUM(e.amount) AS total_monthly_amount,
    AVG(e.amount) AS average_transaction_cost,
    MAX(e.amount) AS peak_expense
FROM expenses e
JOIN farms f ON e.farm_id = f.farm_id
GROUP BY 
    f.farm_id, f.farm_name, DATE_TRUNC('month', e.expense_date), TO_CHAR(e.expense_date, 'Mon YYYY'), e.category;

-- ----------------------------------------------------------------------------
-- VIEW 3: Resource Inventory & Reorder Health Monitor
-- Demonstrates: CASE statements, Inventory evaluation, Conditional flags
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW resource_inventory_view AS
SELECT 
    r.resource_id,
    r.resource_name,
    r.category,
    r.unit,
    r.available_quantity,
    r.minimum_stock,
    r.purchase_price,
    ROUND((r.available_quantity * r.purchase_price), 2) AS total_stock_valuation,
    r.supplier,
    CASE 
        WHEN r.available_quantity <= (r.minimum_stock * 0.5) THEN 'CRITICAL_LOW'
        WHEN r.available_quantity <= r.minimum_stock THEN 'REORDER_REQUIRED'
        WHEN r.available_quantity > (r.minimum_stock * 3) THEN 'OVERSTOCKED'
        ELSE 'ADEQUATE'
    END AS inventory_health_status,
    COALESCE(fu.total_applied, 0.00) AS historical_quantity_used
FROM resources r
LEFT JOIN (
    SELECT resource_id, SUM(quantity_applied) AS total_applied
    FROM fertilizer_usages
    GROUP BY resource_id
) fu ON r.resource_id = fu.resource_id;

-- ----------------------------------------------------------------------------
-- VIEW 4: Crop Cycle Lifecycle & Resource Consumption Summary
-- Demonstrates: Complex subquery joins, Operational metrics roll-up
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW crop_cycle_summary_view AS
SELECT 
    cc.cycle_id,
    f.farm_name,
    fld.field_name,
    c.crop_name,
    c.category AS crop_category,
    cc.sowing_date,
    cc.expected_harvest_date,
    cc.actual_harvest_date,
    cc.status AS cycle_status,
    cc.target_yield_kg,
    COALESCE(ir.total_water_liters, 0) AS total_water_consumed_liters,
    COALESCE(ir.irrigation_count, 0) AS total_irrigation_events,
    COALESCE(fu.total_fertilizer_kg, 0) AS total_fertilizer_applied_units,
    COALESCE(fa.total_activities, 0) AS total_farming_activities,
    COALESCE(h.total_harvest_kg, 0) AS actual_harvest_kg,
    COALESCE(h.total_revenue, 0.00) AS total_harvest_revenue,
    COALESCE(exp.cycle_expenses, 0.00) AS total_cycle_expenses,
    (COALESCE(h.total_revenue, 0.00) - COALESCE(exp.cycle_expenses, 0.00)) AS cycle_net_profit
FROM crop_cycles cc
JOIN fields fld ON cc.field_id = fld.field_id
JOIN farms f ON fld.farm_id = f.farm_id
JOIN crops c ON cc.crop_id = c.crop_id
LEFT JOIN (
    SELECT cycle_id, SUM(water_quantity_liters) AS total_water_liters, COUNT(irrigation_id) AS irrigation_count
    FROM irrigation_records GROUP BY cycle_id
) ir ON cc.cycle_id = ir.cycle_id
LEFT JOIN (
    SELECT cycle_id, SUM(quantity_applied) AS total_fertilizer_kg
    FROM fertilizer_usages GROUP BY cycle_id
) fu ON cc.cycle_id = fu.cycle_id
LEFT JOIN (
    SELECT cycle_id, COUNT(activity_id) AS total_activities
    FROM farming_activities GROUP BY cycle_id
) fa ON cc.cycle_id = fa.cycle_id
LEFT JOIN (
    SELECT cycle_id, SUM(quantity_kg) AS total_harvest_kg, SUM(total_revenue) AS total_revenue
    FROM harvests GROUP BY cycle_id
) h ON cc.cycle_id = h.cycle_id
LEFT JOIN (
    SELECT cycle_id, SUM(amount) AS cycle_expenses
    FROM expenses WHERE cycle_id IS NOT NULL GROUP BY cycle_id
) exp ON cc.cycle_id = exp.cycle_id;
