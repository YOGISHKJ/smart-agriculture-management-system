import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/pool';

export const cropSchema = z.object({
  field_id: z.coerce.number().int().positive('Valid field ID is required'),
  name: z.string().min(1, 'Crop name is required'),
  variety: z.string().optional().default('Standard'),
  season: z.string().min(1, 'Season is required'),
  sowing_date: z.string().min(1, 'Sowing date is required'),
  expected_harvest_date: z.string().min(1, 'Expected harvest date is required'),
  seed_quantity: z.coerce.number().positive('Seed quantity must be greater than 0'),
  status: z.enum(['PLANNED', 'ACTIVE', 'HARVESTED', 'CANCELLED']).default('ACTIVE')
}).refine(data => new Date(data.expected_harvest_date) >= new Date(data.sowing_date), {
  message: 'Expected harvest date must be on or after sowing date',
  path: ['expected_harvest_date']
});

export const getCrops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { field_id, status } = req.query;

    let sql = `
      SELECT c.*, f.name AS field_name, f.location AS field_location, f.area AS field_area,
             u.name AS owner_name,
             COALESCE(w.total_water_liters, 0) AS total_water_liters,
             COALESCE(fert.total_fertilizer_kg, 0) AS total_fertilizer_kg,
             COALESCE(fert.total_fertilizer_cost, 0) AS total_fertilizer_cost
      FROM crops c
      JOIN fields f ON c.field_id = f.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN (
        SELECT crop_id, SUM(liters) AS total_water_liters
        FROM water_usage
        GROUP BY crop_id
      ) w ON w.crop_id = c.id
      LEFT JOIN (
        SELECT crop_id, SUM(quantity_kg) AS total_fertilizer_kg, SUM(cost) AS total_fertilizer_cost
        FROM fertilizer_usage
        GROUP BY crop_id
      ) fert ON fert.crop_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (role !== 'ADMIN') {
      sql += ` AND c.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (field_id) {
      sql += ` AND c.field_id = $${paramIndex++}`;
      params.push(field_id);
    }

    if (status) {
      sql += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      crops: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getCropById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let sql = `
      SELECT c.*, f.name AS field_name, f.location AS field_location, f.area AS field_area,
             u.name AS owner_name
      FROM crops c
      JOIN fields f ON c.field_id = f.id
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const params: any[] = [id];

    if (role !== 'ADMIN') {
      sql += ` AND c.user_id = $2`;
      params.push(userId);
    }

    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Crop record not found' });
      return;
    }

    res.json({
      success: true,
      crop: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createCrop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { field_id, name, variety, season, sowing_date, expected_harvest_date, seed_quantity, status } = req.body;

    // Verify field exists and belongs to user
    let fieldCheckSql = `SELECT id FROM fields WHERE id = $1`;
    const fieldParams: any[] = [field_id];
    if (role !== 'ADMIN') {
      fieldCheckSql += ` AND user_id = $2`;
      fieldParams.push(userId);
    }

    const fieldCheck = await query(fieldCheckSql, fieldParams);
    if (fieldCheck.rowCount === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid field selection. Field does not exist or does not belong to you.'
      });
      return;
    }

    const result = await query(
      `INSERT INTO crops (user_id, field_id, name, variety, season, sowing_date, expected_harvest_date, seed_quantity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, field_id, name, variety || null, season, sowing_date, expected_harvest_date, seed_quantity, status || 'ACTIVE']
    );

    res.status(201).json({
      success: true,
      message: 'Crop registered successfully',
      crop: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateCrop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;
    const { field_id, name, variety, season, sowing_date, expected_harvest_date, seed_quantity, status } = req.body;

    // Verify crop exists & belongs to user
    let cropCheckSql = `SELECT id, user_id FROM crops WHERE id = $1`;
    const cropParams: any[] = [id];
    if (role !== 'ADMIN') {
      cropCheckSql += ` AND user_id = $2`;
      cropParams.push(userId);
    }
    const cropCheck = await query(cropCheckSql, cropParams);
    if (cropCheck.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Crop not found or unauthorized' });
      return;
    }

    // If field_id changed, verify new field belongs to user
    let fieldCheckSql = `SELECT id FROM fields WHERE id = $1`;
    const fieldParams: any[] = [field_id];
    if (role !== 'ADMIN') {
      fieldCheckSql += ` AND user_id = $2`;
      fieldParams.push(userId);
    }
    const fieldCheck = await query(fieldCheckSql, fieldParams);
    if (fieldCheck.rowCount === 0) {
      res.status(400).json({ success: false, error: 'Target field does not belong to you.' });
      return;
    }

    const result = await query(
      `UPDATE crops
       SET field_id = $1, name = $2, variety = $3, season = $4, sowing_date = $5,
           expected_harvest_date = $6, seed_quantity = $7, status = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [field_id, name, variety || null, season, sowing_date, expected_harvest_date, seed_quantity, status, id]
    );

    res.json({
      success: true,
      message: 'Crop updated successfully',
      crop: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCrop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let deleteSql = `DELETE FROM crops WHERE id = $1`;
    const params: any[] = [id];
    if (role !== 'ADMIN') {
      deleteSql += ` AND user_id = $2`;
      params.push(userId);
    }

    const result = await query(deleteSql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Crop record not found or unauthorized' });
      return;
    }

    res.json({
      success: true,
      message: 'Crop and all associated usage records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
