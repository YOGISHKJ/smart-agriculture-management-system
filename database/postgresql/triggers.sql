-- ============================================================================
-- AGRICULTURE RESOURCE AND FARM MANAGEMENT SYSTEM
-- PostgreSQL Advanced Triggers & Stored Procedures
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TRIGGER 1: Automatically calculate Harvest Revenue before Insert/Update
-- Enforces: TOTAL REVENUE = HARVEST QUANTITY * SELLING PRICE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_compute_harvest_revenue()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_revenue := ROUND((NEW.quantity_kg * NEW.selling_price_per_unit)::NUMERIC, 2);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_harvest_revenue ON harvests;
CREATE TRIGGER trg_compute_harvest_revenue
BEFORE INSERT OR UPDATE ON harvests
FOR EACH ROW
EXECUTE FUNCTION fn_compute_harvest_revenue();

-- ----------------------------------------------------------------------------
-- TRIGGER 2: Deduct Available Resource Stock when Fertilizer is used
-- Enforces: Inventory consistency and prevents negative stock
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_deduct_resource_on_fertilizer_usage()
RETURNS TRIGGER AS $$
DECLARE
    current_stock NUMERIC(10, 2);
    res_name VARCHAR(120);
BEGIN
    -- Check available stock
    SELECT available_quantity, resource_name INTO current_stock, res_name
    FROM resources
    WHERE resource_id = NEW.resource_id
    FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Resource ID % does not exist.', NEW.resource_id;
    END IF;

    IF current_stock < NEW.quantity_applied THEN
        RAISE EXCEPTION 'Insufficient inventory for %: Requested % units, but only % available.',
            res_name, NEW.quantity_applied, current_stock;
    END IF;

    -- Update inventory
    UPDATE resources
    SET available_quantity = available_quantity - NEW.quantity_applied,
        updated_at = CURRENT_TIMESTAMP
    WHERE resource_id = NEW.resource_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_resource_on_fertilizer_usage ON fertilizer_usages;
CREATE TRIGGER trg_deduct_resource_on_fertilizer_usage
AFTER INSERT ON fertilizer_usages
FOR EACH ROW
EXECUTE FUNCTION fn_deduct_resource_on_fertilizer_usage();

-- ----------------------------------------------------------------------------
-- TRIGGER 3: Audit Crop Status Transitions
-- Enforces: Automatic historical trace of crop cycle life cycle
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_log_crop_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO crop_status_history (cycle_id, previous_status, new_status, changed_at, remarks)
        VALUES (
            NEW.cycle_id,
            OLD.status,
            NEW.status,
            CURRENT_TIMESTAMP,
            CONCAT('Status automatically transitioned from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_crop_status_change ON crop_cycles;
CREATE TRIGGER trg_log_crop_status_change
AFTER UPDATE OF status ON crop_cycles
FOR EACH ROW
EXECUTE FUNCTION fn_log_crop_status_change();

-- ----------------------------------------------------------------------------
-- TRIGGER 4: Update Crop Cycle Status upon Harvest Creation
-- Enforces: Business workflow progression from ACTIVE -> HARVESTED
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_cycle_on_harvest()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE crop_cycles
    SET status = 'HARVESTED',
        actual_harvest_date = NEW.harvest_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE cycle_id = NEW.cycle_id
      AND status = 'ACTIVE';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_cycle_on_harvest ON harvests;
CREATE TRIGGER trg_update_cycle_on_harvest
AFTER INSERT ON harvests
FOR EACH ROW
EXECUTE FUNCTION fn_update_cycle_on_harvest();
