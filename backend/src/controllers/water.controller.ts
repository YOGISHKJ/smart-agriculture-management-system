import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/pool';

export const waterUsageSchema = z.object({
  crop_id: z.coerce.number().int().positive('Valid crop ID is required'),
  date: z.string().min(1, 'Date is required'),
  method: z.string().min(1, 'Method is required'),
  liters: z.coerce.number().positive('Water quantity (liters) must be greater than 0'),
  duration_minutes: z.coerce.number().int().positive('Duration (minutes) must be greater than 0'),
  notes: z.string().optional()
});

export const getWaterUsages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { crop_id } = req.query;

    let sql = `
      SELECT w.*, c.name AS crop_name, c.variety AS crop_variety,
             f.name AS field_name, f.location AS field_location,
             u.name AS owner_name
      FROM water_usage w
      JOIN crops c ON w.crop_id = c.id
      JOIN fields f ON c.field_id = f.id
      JOIN users u ON w.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (role !== 'ADMIN') {
      sql += ` AND w.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (crop_id) {
      sql += ` AND w.crop_id = $${paramIndex++}`;
      params.push(crop_id);
    }

    sql += ` ORDER BY w.date DESC, w.created_at DESC`;

    const result = await query(sql, params);

    // Also get totals per crop summary
    let summarySql = `
      SELECT c.id AS crop_id, c.name AS crop_name, SUM(w.liters) AS total_liters, SUM(w.duration_minutes) AS total_minutes, COUNT(w.id) AS log_count
      FROM water_usage w
      JOIN crops c ON w.crop_id = c.id
    `;
    const summaryParams: any[] = [];
    if (role !== 'ADMIN') {
      summarySql += ` WHERE w.user_id = $1`;
      summaryParams.push(userId);
    }
    summarySql += ` GROUP BY c.id, c.name ORDER BY total_liters DESC`;
    const summaryResult = await query(summarySql, summaryParams);

    res.json({
      success: true,
      water_usages: result.rows,
      summary_by_crop: summaryResult.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getWaterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let sql = `
      SELECT w.*, c.name AS crop_name, f.name AS field_name
      FROM water_usage w
      JOIN crops c ON w.crop_id = c.id
      JOIN fields f ON c.field_id = f.id
      WHERE w.id = $1
    `;
    const params: any[] = [id];

    if (role !== 'ADMIN') {
      sql += ` AND w.user_id = $2`;
      params.push(userId);
    }

    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Water usage record not found' });
      return;
    }

    res.json({
      success: true,
      water_usage: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createWaterUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { crop_id, date, method, liters, duration_minutes, notes } = req.body;

    // Check crop ownership
    let cropCheckSql = `SELECT id FROM crops WHERE id = $1`;
    const cropParams: any[] = [crop_id];
    if (role !== 'ADMIN') {
      cropCheckSql += ` AND user_id = $2`;
      cropParams.push(userId);
    }

    const cropCheck = await query(cropCheckSql, cropParams);
    if (cropCheck.rowCount === 0) {
      res.status(400).json({
        success: false,
        error: 'Selected crop not found or does not belong to you.'
      });
      return;
    }

    const result = await query(
      `INSERT INTO water_usage (user_id, crop_id, date, method, liters, duration_minutes, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, crop_id, date, method, liters, duration_minutes, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Water usage logged successfully',
      water_usage: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateWaterUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;
    const { crop_id, date, method, liters, duration_minutes, notes } = req.body;

    // Verify existing record
    let checkSql = `SELECT id FROM water_usage WHERE id = $1`;
    const checkParams: any[] = [id];
    if (role !== 'ADMIN') {
      checkSql += ` AND user_id = $2`;
      checkParams.push(userId);
    }
    const checkResult = await query(checkSql, checkParams);
    if (checkResult.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Water record not found or unauthorized' });
      return;
    }

    // Verify crop
    let cropCheckSql = `SELECT id FROM crops WHERE id = $1`;
    const cropParams: any[] = [crop_id];
    if (role !== 'ADMIN') {
      cropCheckSql += ` AND user_id = $2`;
      cropParams.push(userId);
    }
    const cropCheck = await query(cropCheckSql, cropParams);
    if (cropCheck.rowCount === 0) {
      res.status(400).json({ success: false, error: 'Target crop does not belong to you.' });
      return;
    }

    const result = await query(
      `UPDATE water_usage
       SET crop_id = $1, date = $2, method = $3, liters = $4, duration_minutes = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [crop_id, date, method, liters, duration_minutes, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Water usage updated successfully',
      water_usage: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWaterUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let deleteSql = `DELETE FROM water_usage WHERE id = $1`;
    const params: any[] = [id];
    if (role !== 'ADMIN') {
      deleteSql += ` AND user_id = $2`;
      params.push(userId);
    }

    const result = await query(deleteSql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Water record not found or unauthorized' });
      return;
    }

    res.json({
      success: true,
      message: 'Water usage record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
