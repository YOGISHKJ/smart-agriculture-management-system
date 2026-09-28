-- ============================================================================
-- AGRICULTURE RESOURCE AND FARM MANAGEMENT SYSTEM
-- Complex & Analytical SQL Query Suite (DBMS Level 3 Demonstration)
-- ============================================================================

-- ============================================================================
-- QUERY 1: Basic SELECT with WHERE, ORDER BY, and Column Projection
-- Concept: Data filtering and sorting
-- ============================================================================
SELECT 
    f.farm_id,
    f.farm_name,
    f.location,
    f.area AS total_acres,
    f.soil_type,
    f.status
FROM farms f
WHERE f.status = 'ACTIVE' AND f.area >= 5.0
ORDER BY f.area DESC;

-- ============================================================================
-- QUERY 2: Standard INSERT with RETURNING clause
-- Concept: Transactional insertion and result capture
-- ============================================================================
INSERT INTO farming_activities (
    cycle_id, field_id, activity_date, activity_type, description, labour_hours, cost
) VALUES (
    1, 1, CURRENT_DATE, 'SOIL_TESTING', 'Comprehensive N-P-K and pH electrical conductivity assay', 4.0, 1500.00
) RETURNING activity_id, activity_type, cost, created_at;

-- ============================================================================
-- QUERY 3: Targeted UPDATE with arithmetic calculation
-- Concept: Inventory adjustment and timestamp update
-- ============================================================================
UPDATE resources
SET available_quantity = available_quantity + 10.00,
    updated_at = CURRENT_TIMESTAMP
WHERE resource_id = 1 AND category = 'FERTILIZER';

-- ============================================================================
-- QUERY 4: Constrained DELETE
-- Concept: Safe removal of non-critical audit records
-- ============================================================================
DELETE FROM crop_status_history
WHERE changed_at < (CURRENT_DATE - INTERVAL '1 year');

-- ============================================================================
-- QUERY 5: INNER JOIN (Multi-Table Join across 4 entities)
-- Concept: Relational integrity navigation (Users -> Farms -> Fields -> Crop Cycles -> Crops)
-- ============================================================================
SELECT 
    u.name AS farmer_name,
    f.farm_name,
    fld.field_name,
    fld.irrigation_type,
    c.crop_name,
    c.category AS crop_category,
    cc.sowing_date,
    cc.expected_harvest_date,
    cc.status AS cycle_status
FROM users u
INNER JOIN farms f ON u.user_id = f.owner_id
INNER JOIN fields fld ON f.farm_id = fld.farm_id
INNER JOIN crop_cycles cc ON fld.field_id = cc.field_id
INNER JOIN crops c ON cc.crop_id = c.crop_id
WHERE cc.status IN ('ACTIVE', 'PLANNED')
ORDER BY cc.sowing_date ASC;

-- ============================================================================
-- QUERY 6: LEFT OUTER JOIN with COALESCE for Missing Harvest Data
-- Concept: Unmatched row retention with default formatting
-- ============================================================================
SELECT 
    cc.cycle_id,
    c.crop_name,
    cc.sowing_date,
    cc.status,
    COALESCE(h.quantity_kg, 0.00) AS harvest_quantity_kg,
    COALESCE(h.quality_grade, 'PENDING_HARVEST') AS quality_grade,
    COALESCE(h.total_revenue, 0.00) AS total_revenue
FROM crop_cycles cc
JOIN crops c ON cc.crop_id = c.crop_id
LEFT JOIN harvests h ON cc.cycle_id = h.cycle_id
ORDER BY cc.cycle_id ASC;

-- ============================================================================
-- QUERY 7: Aggregations (SUM, AVG, COUNT, MIN, MAX) with GROUP BY
-- Concept: Category-wise farm expense breakdown
-- ============================================================================
SELECT 
    e.category AS expense_category,
    COUNT(e.expense_id) AS total_vouchers,
    SUM(e.amount) AS aggregate_expenditure,
    ROUND(AVG(e.amount), 2) AS average_voucher_cost,
    MIN(e.amount) AS smallest_voucher,
    MAX(e.amount) AS largest_voucher
FROM expenses e
GROUP BY e.category
ORDER BY aggregate_expenditure DESC;

-- ============================================================================
-- QUERY 8: GROUP BY with HAVING Clause
-- Concept: Filter grouped aggregates (Farms spending more than ₹10,000)
-- ============================================================================
SELECT 
    f.farm_id,
    f.farm_name,
    COUNT(e.expense_id) AS expense_records_count,
    SUM(e.amount) AS total_farm_expenses
FROM farms f
JOIN expenses e ON f.farm_id = e.farm_id
GROUP BY f.farm_id, f.farm_name
HAVING SUM(e.amount) > 10000.00
ORDER BY total_farm_expenses DESC;

-- ============================================================================
-- QUERY 9: Scalar Subquery in WHERE Clause
-- Concept: Find farms whose total expense is strictly higher than the overall average farm expense
-- ============================================================================
SELECT 
    f.farm_id,
    f.farm_name,
    f.location,
    SUM(e.amount) AS farm_total_expense
FROM farms f
JOIN expenses e ON f.farm_id = e.farm_id
GROUP BY f.farm_id, f.farm_name, f.location
HAVING SUM(e.amount) > (
    SELECT AVG(farm_total)
    FROM (
        SELECT SUM(amount) AS farm_total
        FROM expenses
        GROUP BY farm_id
    ) AS subquery_avg
)
ORDER BY farm_total_expense DESC;

-- ============================================================================
-- QUERY 10: Correlated Subquery
-- Concept: Find crops whose harvest yield exceeds the average yield for their specific crop category
-- ============================================================================
SELECT 
    c.crop_id,
    c.crop_name,
    c.category,
    h.quantity_kg,
    h.harvest_date
FROM harvests h
JOIN crop_cycles cc ON h.cycle_id = cc.cycle_id
JOIN crops c ON cc.crop_id = c.crop_id
WHERE h.quantity_kg > (
    SELECT AVG(h2.quantity_kg)
    FROM harvests h2
    JOIN crop_cycles cc2 ON h2.cycle_id = cc2.cycle_id
    JOIN crops c2 ON cc2.crop_id = c2.crop_id
    WHERE c2.category = c.category
);

-- ============================================================================
-- QUERY 11: Top-Performing Crops by Total Harvest and Revenue
-- Concept: Business ranking and multi-column sort
-- ============================================================================
SELECT 
    c.crop_name,
    c.category,
    COUNT(h.harvest_id) AS total_harvest_events,
    SUM(h.quantity_kg) AS aggregate_harvest_kg,
    SUM(h.total_revenue) AS total_gross_revenue,
    ROUND(AVG(h.selling_price_per_unit), 2) AS average_price_per_kg
FROM crops c
JOIN crop_cycles cc ON c.crop_id = cc.crop_id
JOIN harvests h ON cc.cycle_id = h.cycle_id
GROUP BY c.crop_id, c.crop_name, c.category
ORDER BY total_gross_revenue DESC
LIMIT 5;

-- ============================================================================
-- QUERY 12: Farmers with Active Crop Cycles (EXISTS Subquery)
-- Concept: Set existence validation
-- ============================================================================
SELECT 
    u.user_id,
    u.name AS farmer_name,
    u.email,
    u.phone
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM farms f
    JOIN fields fld ON f.farm_id = fld.farm_id
    JOIN crop_cycles cc ON fld.field_id = cc.field_id
    WHERE f.owner_id = u.user_id AND cc.status = 'ACTIVE'
);

-- ============================================================================
-- QUERY 13: Water Usage Analytics (Date-Based Aggregation & Irrigation Type)
-- Concept: Resource consumption metrics across time
-- ============================================================================
SELECT 
    ir.irrigation_method,
    COUNT(ir.irrigation_id) AS total_watering_sessions,
    SUM(ir.water_quantity_liters) AS total_liters_delivered,
    ROUND(AVG(ir.water_quantity_liters), 2) AS avg_liters_per_session,
    SUM(ir.duration_minutes) AS total_duration_mins
FROM irrigation_records ir
GROUP BY ir.irrigation_method
ORDER BY total_liters_delivered DESC;

-- ============================================================================
-- QUERY 14: Comprehensive Profitability by Farm (Revenue - Expenses)
-- Concept: Multi-aggregate mathematical delta across disparate child tables
-- ============================================================================
SELECT 
    f.farm_id,
    f.farm_name,
    u.name AS farmer_name,
    COALESCE(exp_totals.total_expenses, 0.00) AS total_expenses,
    COALESCE(hrv_totals.total_revenue, 0.00) AS total_revenue,
    (COALESCE(hrv_totals.total_revenue, 0.00) - COALESCE(exp_totals.total_expenses, 0.00)) AS estimated_net_profit,
    CASE 
        WHEN (COALESCE(hrv_totals.total_revenue, 0.00) - COALESCE(exp_totals.total_expenses, 0.00)) > 0 THEN 'PROFITABLE'
        WHEN (COALESCE(hrv_totals.total_revenue, 0.00) - COALESCE(exp_totals.total_expenses, 0.00)) = 0 THEN 'BREAK_EVEN'
        ELSE 'LOSS_DEFICIT'
    END AS financial_health_status
FROM farms f
JOIN users u ON f.owner_id = u.user_id
LEFT JOIN (
    SELECT farm_id, SUM(amount) AS total_expenses
    FROM expenses GROUP BY farm_id
) exp_totals ON f.farm_id = exp_totals.farm_id
LEFT JOIN (
    SELECT fld.farm_id, SUM(h.total_revenue) AS total_revenue
    FROM harvests h
    JOIN crop_cycles cc ON h.cycle_id = cc.cycle_id
    JOIN fields fld ON cc.field_id = fld.field_id
    GROUP BY fld.farm_id
) hrv_totals ON f.farm_id = hrv_totals.farm_id
ORDER BY estimated_net_profit DESC;

-- ============================================================================
-- QUERY 15: Fertilizer Application Intensity & Cost Analysis per Field
-- Concept: Operational efficiency and nutrient tracking
-- ============================================================================
SELECT 
    fld.field_id,
    fld.field_name,
    r.resource_name AS fertilizer_used,
    SUM(fu.quantity_applied) AS total_quantity_applied,
    SUM(fu.cost) AS total_fertilizer_cost,
    ROUND((SUM(fu.cost) / fld.area), 2) AS fertilizer_cost_per_acre
FROM fields fld
JOIN fertilizer_usages fu ON fld.field_id = fu.field_id
JOIN resources r ON fu.resource_id = r.resource_id
GROUP BY fld.field_id, fld.field_name, fld.area, r.resource_name
ORDER BY fertilizer_cost_per_acre DESC;

-- ============================================================================
-- QUERY 16: Monthly Farm Expense Time-Series Pivot
-- Concept: Date extraction and monthly breakdown
-- ============================================================================
SELECT 
    TO_CHAR(expense_date, 'YYYY-MM') AS expense_period,
    category,
    SUM(amount) AS total_period_cost,
    COUNT(expense_id) AS transactions_count
FROM expenses
GROUP BY TO_CHAR(expense_date, 'YYYY-MM'), category
ORDER BY expense_period DESC, total_period_cost DESC;

-- ============================================================================
-- QUERY 17: Inventory Stockout Vulnerability List
-- Concept: Conditional stock threshold checking
-- ============================================================================
SELECT 
    r.resource_id,
    r.resource_name,
    r.category,
    r.available_quantity,
    r.minimum_stock,
    (r.minimum_stock - r.available_quantity) AS deficit_quantity,
    r.supplier
FROM resources r
WHERE r.available_quantity <= r.minimum_stock
ORDER BY deficit_quantity DESC;

-- ============================================================================
-- QUERY 18: Crop Cycle Labor Intensity Index
-- Concept: Aggregating labor hours and activity costs
-- ============================================================================
SELECT 
    c.crop_name,
    f.farm_name,
    COUNT(fa.activity_id) AS total_activities_logged,
    SUM(fa.labour_hours) AS total_labor_hours,
    SUM(fa.cost) AS total_activity_costs,
    ROUND(AVG(fa.labour_hours), 1) AS avg_hours_per_activity
FROM farming_activities fa
JOIN crop_cycles cc ON fa.cycle_id = cc.cycle_id
JOIN crops c ON cc.crop_id = c.crop_id
JOIN fields fld ON cc.field_id = fld.field_id
JOIN farms f ON fld.farm_id = f.farm_id
GROUP BY c.crop_name, f.farm_name
ORDER BY total_labor_hours DESC;

-- ============================================================================
-- QUERY 19: Demonstration Scenario: Ravi Kumar - Green Valley Farm Full Ledger
-- Concept: Specific demo scenario query for faculty evaluation
-- ============================================================================
SELECT 
    u.name AS farmer,
    f.farm_name,
    f.area AS farm_acres,
    c.crop_name,
    cc.status AS cycle_status,
    (SELECT SUM(amount) FROM expenses WHERE farm_id = f.farm_id) AS total_expenses,
    (SELECT SUM(quantity_applied) FROM fertilizer_usages WHERE cycle_id = cc.cycle_id) AS total_fertilizer_used_units,
    (SELECT SUM(quantity_kg) FROM harvests WHERE cycle_id = cc.cycle_id) AS total_harvest_kg,
    (SELECT SUM(total_revenue) FROM harvests WHERE cycle_id = cc.cycle_id) AS total_revenue,
    ((SELECT COALESCE(SUM(total_revenue), 0) FROM harvests WHERE cycle_id = cc.cycle_id) - 
     (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE farm_id = f.farm_id)) AS net_profit
FROM users u
JOIN farms f ON u.user_id = f.owner_id
JOIN fields fld ON f.farm_id = fld.farm_id
JOIN crop_cycles cc ON fld.field_id = cc.field_id
JOIN crops c ON cc.crop_id = c.crop_id
WHERE u.email = 'ravi.kumar@agripulse.com' AND f.farm_name = 'Green Valley Farm'
LIMIT 1;

-- ============================================================================
-- QUERY 20: UNION Operator - Comprehensive Operational Timeline
-- Concept: Union of Activities, Irrigations, and Expenses chronologically
-- ============================================================================
(
    SELECT 
        activity_date AS event_date,
        'ACTIVITY' AS event_type,
        CONCAT(activity_type, ': ', description) AS event_details,
        cost AS monetary_impact
    FROM farming_activities
    WHERE cycle_id = 1
)
UNION ALL
(
    SELECT 
        irrigation_date AS event_date,
        'IRRIGATION' AS event_type,
        CONCAT(irrigation_method, ' irrigation: ', water_quantity_liters, ' Liters, ', duration_minutes, ' mins') AS event_details,
        0.00 AS monetary_impact
    FROM irrigation_records
    WHERE cycle_id = 1
)
UNION ALL
(
    SELECT 
        expense_date AS event_date,
        'EXPENSE' AS event_type,
        CONCAT(category, ' - ', description) AS event_details,
        amount AS monetary_impact
    FROM expenses
    WHERE cycle_id = 1
)
ORDER BY event_date ASC;
