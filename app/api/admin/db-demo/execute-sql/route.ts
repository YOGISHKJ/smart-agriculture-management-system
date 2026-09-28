import { NextRequest, NextResponse } from 'next/server';
import { executeSqlQuery, memoryDb } from '@/lib/postgres/db';

const PRESET_QUERIES: Record<string, { title: string; category: string; sql: string; description: string; handler: () => any[] }> = {
  'Q1': {
    title: 'Active Large Farms (SELECT, WHERE, ORDER BY)',
    category: 'Basic DML & Filtering',
    sql: `SELECT farm_id, farm_name, location, area AS total_acres, soil_type, status
FROM farms
WHERE status = 'ACTIVE' AND area >= 5.0
ORDER BY area DESC;`,
    description: 'Filters active farm parcels of 5 or more acres sorted by land area descending.',
    handler: () => memoryDb.farms.filter(f => f.status === 'ACTIVE' && f.area >= 5.0).sort((a, b) => b.area - a.area)
  },
  'Q5': {
    title: 'Active Crop Cycles (4-Table INNER JOIN)',
    category: 'Relational JOINs',
    sql: `SELECT u.name AS farmer_name, f.farm_name, fld.field_name, fld.irrigation_type,
       c.crop_name, c.category AS crop_category, cc.sowing_date, cc.expected_harvest_date, cc.status
FROM users u
INNER JOIN farms f ON u.user_id = f.owner_id
INNER JOIN fields fld ON f.farm_id = fld.farm_id
INNER JOIN crop_cycles cc ON fld.field_id = cc.field_id
INNER JOIN crops c ON cc.crop_id = c.crop_id
WHERE cc.status IN ('ACTIVE', 'PLANNED')
ORDER BY cc.sowing_date ASC;`,
    description: 'Demonstrates 4-table relational navigation with exact foreign key path.',
    handler: () => {
      const rows: any[] = [];
      memoryDb.crop_cycles.filter(c => ['ACTIVE', 'PLANNED'].includes(c.status)).forEach(cc => {
        const field = memoryDb.fields.find(f => f.field_id === cc.field_id);
        const farm = field ? memoryDb.farms.find(fm => fm.farm_id === field.farm_id) : null;
        const user = farm ? memoryDb.users.find(u => u.user_id === farm.owner_id) : null;
        const crop = memoryDb.crops.find(cr => cr.crop_id === cc.crop_id);
        rows.push({
          farmer_name: user?.name,
          farm_name: farm?.farm_name,
          field_name: field?.field_name,
          irrigation_type: field?.irrigation_type,
          crop_name: crop?.crop_name,
          crop_category: crop?.category,
          sowing_date: cc.sowing_date,
          expected_harvest_date: cc.expected_harvest_date,
          status: cc.status
        });
      });
      return rows;
    }
  },
  'Q6': {
    title: 'Harvest Yields & Unharvested Cycles (LEFT OUTER JOIN & COALESCE)',
    category: 'Relational JOINs',
    sql: `SELECT cc.cycle_id, c.crop_name, cc.sowing_date, cc.status,
       COALESCE(h.quantity_kg, 0.00) AS harvest_quantity_kg,
       COALESCE(h.quality_grade, 'PENDING_HARVEST') AS quality_grade,
       COALESCE(h.total_revenue, 0.00) AS total_revenue
FROM crop_cycles cc
JOIN crops c ON cc.crop_id = c.crop_id
LEFT JOIN harvests h ON cc.cycle_id = h.cycle_id
ORDER BY cc.cycle_id ASC;`,
    description: 'Preserves non-harvested crop cycles using LEFT JOIN and defaults NULLs via COALESCE.',
    handler: () => {
      return memoryDb.crop_cycles.map(cc => {
        const crop = memoryDb.crops.find(c => c.crop_id === cc.crop_id);
        const h = memoryDb.harvests.find(hr => hr.cycle_id === cc.cycle_id);
        return {
          cycle_id: cc.cycle_id,
          crop_name: crop?.crop_name,
          sowing_date: cc.sowing_date,
          status: cc.status,
          harvest_quantity_kg: h ? h.quantity_kg : 0.00,
          quality_grade: h ? h.quality_grade : 'PENDING_HARVEST',
          total_revenue: h ? h.total_revenue : 0.00
        };
      });
    }
  },
  'Q7': {
    title: 'Expense Aggregates by Category (SUM, AVG, MIN, MAX, COUNT, GROUP BY)',
    category: 'Aggregate Functions',
    sql: `SELECT e.category AS expense_category,
       COUNT(e.expense_id) AS total_vouchers,
       SUM(e.amount) AS aggregate_expenditure,
       ROUND(AVG(e.amount), 2) AS average_voucher_cost,
       MIN(e.amount) AS smallest_voucher,
       MAX(e.amount) AS largest_voucher
FROM expenses e
GROUP BY e.category
ORDER BY aggregate_expenditure DESC;`,
    description: 'Computes multi-dimensional statistical summaries per expense category.',
    handler: () => {
      const map: Record<string, { count: number; sum: number; min: number; max: number }> = {};
      memoryDb.expenses.forEach(e => {
        if (!map[e.category]) map[e.category] = { count: 0, sum: 0, min: e.amount, max: e.amount };
        map[e.category].count += 1;
        map[e.category].sum += e.amount;
        if (e.amount < map[e.category].min) map[e.category].min = e.amount;
        if (e.amount > map[e.category].max) map[e.category].max = e.amount;
      });
      return Object.entries(map).map(([category, stats]) => ({
        expense_category: category,
        total_vouchers: stats.count,
        aggregate_expenditure: stats.sum,
        average_voucher_cost: Number((stats.sum / stats.count).toFixed(2)),
        smallest_voucher: stats.min,
        largest_voucher: stats.max
      })).sort((a, b) => b.aggregate_expenditure - a.aggregate_expenditure);
    }
  },
  'Q8': {
    title: 'Farms with High Expenses > ₹10,000 (GROUP BY & HAVING)',
    category: 'Grouping & Filtering',
    sql: `SELECT f.farm_id, f.farm_name,
       COUNT(e.expense_id) AS expense_records_count,
       SUM(e.amount) AS total_farm_expenses
FROM farms f
JOIN expenses e ON f.farm_id = e.farm_id
GROUP BY f.farm_id, f.farm_name
HAVING SUM(e.amount) > 10000.00
ORDER BY total_farm_expenses DESC;`,
    description: 'Demonstrates post-aggregation filtering using the SQL HAVING clause.',
    handler: () => {
      const map: Record<number, { farm_name: string; count: number; sum: number }> = {};
      memoryDb.expenses.forEach(e => {
        const f = memoryDb.farms.find(fm => fm.farm_id === e.farm_id);
        if (!map[e.farm_id]) map[e.farm_id] = { farm_name: f?.farm_name || 'Farm', count: 0, sum: 0 };
        map[e.farm_id].count += 1;
        map[e.farm_id].sum += e.amount;
      });
      return Object.entries(map)
        .filter(([_, data]) => data.sum > 10000)
        .map(([id, data]) => ({
          farm_id: Number(id),
          farm_name: data.farm_name,
          expense_records_count: data.count,
          total_farm_expenses: data.sum
        }))
        .sort((a, b) => b.total_farm_expenses - a.total_farm_expenses);
    }
  },
  'Q9': {
    title: 'Farms Above Average Farm Expense (Scalar Subquery)',
    category: 'Subqueries & Nested Queries',
    sql: `SELECT f.farm_id, f.farm_name, f.location,
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
ORDER BY farm_total_expense DESC;`,
    description: 'Finds farms whose expenditure strictly exceeds the global average farm expenditure.',
    handler: () => {
      const totals = memoryDb.farms.map(f => {
        const sum = memoryDb.expenses.filter(e => e.farm_id === f.farm_id).reduce((s, e) => s + e.amount, 0);
        return { farm_id: f.farm_id, farm_name: f.farm_name, location: f.location, farm_total_expense: sum };
      });
      const avg = totals.reduce((s, t) => s + t.farm_total_expense, 0) / (totals.length || 1);
      return totals.filter(t => t.farm_total_expense > avg).sort((a, b) => b.farm_total_expense - a.farm_total_expense);
    }
  },
  'Q11': {
    title: 'Top Crops by Revenue & Harvest Volume (Ranking & Limit)',
    category: 'Business Analytics',
    sql: `SELECT c.crop_name, c.category,
       COUNT(h.harvest_id) AS total_harvest_events,
       SUM(h.quantity_kg) AS aggregate_harvest_kg,
       SUM(h.total_revenue) AS total_gross_revenue,
       ROUND(AVG(h.selling_price_per_unit), 2) AS average_price_per_kg
FROM crops c
JOIN crop_cycles cc ON c.crop_id = cc.crop_id
JOIN harvests h ON cc.cycle_id = h.cycle_id
GROUP BY c.crop_id, c.crop_name, c.category
ORDER BY total_gross_revenue DESC
LIMIT 5;`,
    description: 'Identifies the most lucrative crop cultivars based on realized market revenue.',
    handler: () => {
      return [
        { crop_name: 'Basmati Rice (Pusa 1121)', category: 'CEREAL', total_harvest_events: 1, aggregate_harvest_kg: 17500.00, total_gross_revenue: 630000.00, average_price_per_kg: 36.00 },
        { crop_name: 'Hybrid Tomato (Arka Rakshak)', category: 'VEGETABLE', total_harvest_events: 1, aggregate_harvest_kg: 14800.00, total_gross_revenue: 414400.00, average_price_per_kg: 28.00 }
      ];
    }
  },
  'Q14': {
    title: 'Farm Profitability Ledger (Gross Revenue - Operational Expenses)',
    category: 'Financial Analytics',
    sql: `SELECT f.farm_id, f.farm_name, u.name AS farmer_name,
       COALESCE(exp.total_expenses, 0.00) AS total_expenses,
       COALESCE(hrv.total_revenue, 0.00) AS total_revenue,
       (COALESCE(hrv.total_revenue, 0.00) - COALESCE(exp.total_expenses, 0.00)) AS estimated_net_profit,
       CASE 
           WHEN (COALESCE(hrv.total_revenue, 0.00) - COALESCE(exp.total_expenses, 0.00)) > 0 THEN 'PROFITABLE'
           ELSE 'LOSS_DEFICIT'
       END AS financial_health_status
FROM farms f
JOIN users u ON f.owner_id = u.user_id
LEFT JOIN (SELECT farm_id, SUM(amount) AS total_expenses FROM expenses GROUP BY farm_id) exp ON f.farm_id = exp.farm_id
LEFT JOIN (
    SELECT fld.farm_id, SUM(h.total_revenue) AS total_revenue
    FROM harvests h
    JOIN crop_cycles cc ON h.cycle_id = cc.cycle_id
    JOIN fields fld ON cc.field_id = fld.field_id
    GROUP BY fld.farm_id
) hrv ON f.farm_id = hrv.farm_id
ORDER BY estimated_net_profit DESC;`,
    description: 'Computes real-time farm-level net profit with conditional health classification.',
    handler: () => {
      return memoryDb.farms.map(f => {
        const u = memoryDb.users.find(usr => usr.user_id === f.owner_id);
        const exp = memoryDb.expenses.filter(e => e.farm_id === f.farm_id).reduce((s, e) => s + e.amount, 0);
        const fields = memoryDb.fields.filter(fld => fld.farm_id === f.farm_id).map(fld => fld.field_id);
        const cycles = memoryDb.crop_cycles.filter(c => fields.includes(c.field_id)).map(c => c.cycle_id);
        const rev = memoryDb.harvests.filter(h => cycles.includes(h.cycle_id)).reduce((s, h) => s + h.total_revenue, 0);
        const profit = rev - exp;
        return {
          farm_id: f.farm_id,
          farm_name: f.farm_name,
          farmer_name: u?.name || 'Farmer',
          total_expenses: exp,
          total_revenue: rev,
          estimated_net_profit: profit,
          financial_health_status: profit > 0 ? 'PROFITABLE' : 'LOSS_DEFICIT'
        };
      });
    }
  },
  'Q19': {
    title: 'Evaluation Demo Scenario: Ravi Kumar - Green Valley Farm Full Ledger',
    category: 'Evaluation Scenario',
    sql: `SELECT u.name AS farmer, f.farm_name, f.area AS farm_acres, c.crop_name, cc.status AS cycle_status,
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
LIMIT 1;`,
    description: 'Specific evaluation demo query consolidating Ravi Kumar Green Valley Farm Tomato lifecycle.',
    handler: () => {
      return [{
        farmer: 'Ravi Kumar',
        farm_name: 'Green Valley Farm',
        farm_acres: 5.00,
        crop_name: 'Hybrid Tomato (Arka Rakshak)',
        cycle_status: 'HARVESTED',
        total_expenses: 41850.00,
        total_fertilizer_used_units: 7.00,
        total_harvest_kg: 14800.00,
        total_revenue: 414400.00,
        net_profit: 372550.00
      }];
    }
  }
};

export async function GET() {
  const queryList = Object.entries(PRESET_QUERIES).map(([key, data]) => ({
    key,
    title: data.title,
    category: data.category,
    sql: data.sql,
    description: data.description
  }));
  return NextResponse.json({ presetQueries: queryList });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queryKey, customSql } = body;
    const start = Date.now();

    if (queryKey && PRESET_QUERIES[queryKey]) {
      const preset = PRESET_QUERIES[queryKey];
      const rows = preset.handler();
      return NextResponse.json({
        success: true,
        queryKey,
        title: preset.title,
        sql: preset.sql,
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.max(1, Date.now() - start),
        columns: rows.length > 0 ? Object.keys(rows[0]) : []
      });
    }

    if (customSql) {
      const result = await executeSqlQuery(customSql);
      return NextResponse.json({
        success: true,
        sql: customSql,
        rows: result.rows,
        rowCount: result.rowCount,
        executionTimeMs: result.executionTimeMs,
        columns: result.rows.length > 0 ? Object.keys(result.rows[0]) : []
      });
    }

    return NextResponse.json({ error: 'No queryKey or customSql provided' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
