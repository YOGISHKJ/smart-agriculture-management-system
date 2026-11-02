import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const whereUser = role === 'ADMIN' ? '' : 'WHERE user_id = $1';
    const params = role === 'ADMIN' ? [] : [userId];

    // 1. Total Fields & Total Area
    const fieldsStat = await query(
      `SELECT COUNT(id)::int AS total_fields, COALESCE(SUM(area), 0)::float AS total_area FROM fields ${whereUser}`,
      params
    );

    // 2. Active Crops Count & Total Crops
    const cropsStat = await query(
      `SELECT 
         COUNT(id)::int AS total_crops,
         COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::int AS active_crops,
         COUNT(CASE WHEN status = 'PLANNED' THEN 1 END)::int AS planned_crops,
         COUNT(CASE WHEN status = 'HARVESTED' THEN 1 END)::int AS harvested_crops
       FROM crops ${whereUser}`,
      params
    );

    // 3. Water Usage Aggregates
    const waterStat = await query(
      `SELECT COALESCE(SUM(liters), 0)::float AS total_water, COALESCE(SUM(duration_minutes), 0)::int AS total_water_minutes
       FROM water_usage ${whereUser}`,
      params
    );

    // 4. Fertilizer Usage Aggregates
    const fertilizerStat = await query(
      `SELECT COALESCE(SUM(quantity_kg), 0)::float AS total_fertilizer, COALESCE(SUM(cost), 0)::float AS total_fertilizer_cost
       FROM fertilizer_usage ${whereUser}`,
      params
    );

    // 5. Water Usage Over Time (Chart Data)
    const waterChartSql = `
      SELECT w.date, SUM(w.liters)::float AS liters, STRING_AGG(DISTINCT c.name, ', ') AS crops
      FROM water_usage w
      JOIN crops c ON w.crop_id = c.id
      ${role === 'ADMIN' ? '' : 'WHERE w.user_id = $1'}
      GROUP BY w.date
      ORDER BY w.date ASC
      LIMIT 15
    `;
    const waterChart = await query(waterChartSql, params);

    // 6. Fertilizer Usage Per Crop (Chart Data)
    const fertilizerChartSql = `
      SELECT c.name AS crop_name, 
             COALESCE(SUM(fu.quantity_kg), 0)::float AS total_kg,
             COALESCE(SUM(fu.cost), 0)::float AS total_cost
      FROM crops c
      LEFT JOIN fertilizer_usage fu ON fu.crop_id = c.id
      ${role === 'ADMIN' ? '' : 'WHERE c.user_id = $1'}
      GROUP BY c.id, c.name
      ORDER BY total_kg DESC
      LIMIT 10
    `;
    const fertilizerChart = await query(fertilizerChartSql, params);

    // 7. Recent Logs
    const recentWaterSql = `
      SELECT w.id, w.date, w.liters, w.method, c.name AS crop_name, f.name AS field_name
      FROM water_usage w
      JOIN crops c ON w.crop_id = c.id
      JOIN fields f ON c.field_id = f.id
      ${role === 'ADMIN' ? '' : 'WHERE w.user_id = $1'}
      ORDER BY w.date DESC, w.created_at DESC
      LIMIT 5
    `;
    const recentWater = await query(recentWaterSql, params);

    const recentFertilizerSql = `
      SELECT fu.id, fu.date, fu.name AS fertilizer_name, fu.quantity_kg, fu.cost, c.name AS crop_name, f.name AS field_name
      FROM fertilizer_usage fu
      JOIN crops c ON fu.crop_id = c.id
      JOIN fields f ON c.field_id = f.id
      ${role === 'ADMIN' ? '' : 'WHERE fu.user_id = $1'}
      ORDER BY fu.date DESC, fu.created_at DESC
      LIMIT 5
    `;
    const recentFertilizer = await query(recentFertilizerSql, params);

    res.json({
      success: true,
      summary: {
        totalFields: fieldsStat.rows[0]?.total_fields || 0,
        totalArea: fieldsStat.rows[0]?.total_area || 0,
        totalCrops: cropsStat.rows[0]?.total_crops || 0,
        activeCrops: cropsStat.rows[0]?.active_crops || 0,
        plannedCrops: cropsStat.rows[0]?.planned_crops || 0,
        harvestedCrops: cropsStat.rows[0]?.harvested_crops || 0,
        totalWater: waterStat.rows[0]?.total_water || 0,
        totalWaterMinutes: waterStat.rows[0]?.total_water_minutes || 0,
        totalFertilizer: fertilizerStat.rows[0]?.total_fertilizer || 0,
        totalFertilizerCost: fertilizerStat.rows[0]?.total_fertilizer_cost || 0
      },
      charts: {
        waterUsageOverTime: waterChart.rows,
        fertilizerUsagePerCrop: fertilizerChart.rows
      },
      recentLogs: {
        water: recentWater.rows,
        fertilizer: recentFertilizer.rows
      }
    });
  } catch (error) {
    next(error);
  }
};
