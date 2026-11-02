import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/pool';

export const fertilizerUsageSchema = z.object({
  crop_id: z.coerce.number().int().positive('Valid crop ID is required'),
  date: z.string().min(1, 'Date is required'),
  name: z.string().min(1, 'Fertilizer name is required'),
  type: z.string().min(1, 'Fertilizer type is required'),
  quantity_kg: z.coerce.number().positive('Quantity (kg) must be greater than 0'),
  cost: z.coerce.number().nonnegative('Cost cannot be negative').default(0),
  method: z.string().optional().default('Soil Application'),
  notes: z.string().optional()
});

export const getFertilizerUsages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { crop_id } = req.query;

    let sql = `
      SELECT fu.*, c.name AS crop_name, c.variety AS crop_variety,
             fld.name AS field_name, fld.location AS field_location,
             u.name AS owner_name
      FROM fertilizer_usage fu
      JOIN crops c ON fu.crop_id = c.id
      JOIN fields fld ON c.field_id = fld.id
      JOIN users u ON fu.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (role !== 'ADMIN') {
      sql += ` AND fu.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (crop_id) {
      sql += ` AND fu.crop_id = $${paramIndex++}`;
      params.push(crop_id);
    }

    sql += ` ORDER BY fu.date DESC, fu.created_at DESC`;

    const result = await query(sql, params);

    // Summary totals per crop
    let summarySql = `
      SELECT c.id AS crop_id, c.name AS crop_name, SUM(fu.quantity_kg) AS total_kg, SUM(fu.cost) AS total_cost, COUNT(fu.id) AS log_count
      FROM fertilizer_usage fu
      JOIN crops c ON fu.crop_id = c.id
    `;
    const summaryParams: any[] = [];
    if (role !== 'ADMIN') {
      summarySql += ` WHERE fu.user_id = $1`;
      summaryParams.push(userId);
    }
    summarySql += ` GROUP BY c.id, c.name ORDER BY total_kg DESC`;
    const summaryResult = await query(summarySql, summaryParams);

    res.json({
      success: true,
      fertilizer_usages: result.rows,
      summary_by_crop: summaryResult.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getFertilizerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let sql = `
      SELECT fu.*, c.name AS crop_name, fld.name AS field_name
      FROM fertilizer_usage fu
      JOIN crops c ON fu.crop_id = c.id
      JOIN fields fld ON c.field_id = fld.id
      WHERE fu.id = $1
    `;
    const params: any[] = [id];

    if (role !== 'ADMIN') {
      sql += ` AND fu.user_id = $2`;
      params.push(userId);
    }

    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Fertilizer usage record not found' });
      return;
    }

    res.json({
      success: true,
      fertilizer_usage: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createFertilizerUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { crop_id, date, name, type, quantity_kg, cost, method, notes } = req.body;

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
      `INSERT INTO fertilizer_usage (user_id, crop_id, date, name, type, quantity_kg, cost, method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, crop_id, date, name, type, quantity_kg, cost || 0, method || null, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Fertilizer usage logged successfully',
      fertilizer_usage: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateFertilizerUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;
    const { crop_id, date, name, type, quantity_kg, cost, method, notes } = req.body;

    // Verify existing record
    let checkSql = `SELECT id FROM fertilizer_usage WHERE id = $1`;
    const checkParams: any[] = [id];
    if (role !== 'ADMIN') {
      checkSql += ` AND user_id = $2`;
      checkParams.push(userId);
    }
    const checkResult = await query(checkSql, checkParams);
    if (checkResult.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Fertilizer record not found or unauthorized' });
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
      `UPDATE fertilizer_usage
       SET crop_id = $1, date = $2, name = $3, type = $4, quantity_kg = $5, cost = $6, method = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [crop_id, date, name, type, quantity_kg, cost || 0, method || null, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Fertilizer usage updated successfully',
      fertilizer_usage: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFertilizerUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let deleteSql = `DELETE FROM fertilizer_usage WHERE id = $1`;
    const params: any[] = [id];
    if (role !== 'ADMIN') {
      deleteSql += ` AND user_id = $2`;
      params.push(userId);
    }

    const result = await query(deleteSql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Fertilizer record not found or unauthorized' });
      return;
    }

    res.json({
      success: true,
      message: 'Fertilizer usage record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
