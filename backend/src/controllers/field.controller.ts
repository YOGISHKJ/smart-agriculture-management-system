import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/pool';

export const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  location: z.string().min(1, 'Location is required'),
  area: z.coerce.number().positive('Area must be greater than 0'),
  soil_type: z.string().optional().default('Loam'),
  water_source: z.string().optional().default('Borewell'),
  notes: z.string().optional()
});

export const getFields = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let sql = `
      SELECT f.id, f.user_id, f.name, f.location, f.area, f.soil_type, f.water_source, f.notes, 
             f.created_at, f.updated_at,
             u.name AS owner_name,
             COUNT(DISTINCT c.id) AS total_crops,
             COUNT(DISTINCT CASE WHEN c.status = 'ACTIVE' THEN c.id END) AS active_crops
      FROM fields f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN crops c ON c.field_id = f.id
    `;
    const params: any[] = [];

    if (role !== 'ADMIN') {
      sql += ` WHERE f.user_id = $1`;
      params.push(userId);
    }

    sql += ` GROUP BY f.id, u.name ORDER BY f.created_at DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      fields: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getFieldById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let sql = `
      SELECT f.*, u.name AS owner_name
      FROM fields f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = $1
    `;
    const params: any[] = [id];

    if (role !== 'ADMIN') {
      sql += ` AND f.user_id = $2`;
      params.push(userId);
    }

    const result = await query(sql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Field not found' });
      return;
    }

    res.json({
      success: true,
      field: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, location, area, soil_type, water_source, notes } = req.body;

    const result = await query(
      `INSERT INTO fields (user_id, name, location, area, soil_type, water_source, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, name, location, area, soil_type || null, water_source || null, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      field: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;
    const { name, location, area, soil_type, water_source, notes } = req.body;

    let checkSql = `SELECT id FROM fields WHERE id = $1`;
    const checkParams: any[] = [id];
    if (role !== 'ADMIN') {
      checkSql += ` AND user_id = $2`;
      checkParams.push(userId);
    }

    const checkResult = await query(checkSql, checkParams);
    if (checkResult.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Field not found or unauthorized' });
      return;
    }

    const result = await query(
      `UPDATE fields
       SET name = $1, location = $2, area = $3, soil_type = $4, water_source = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, location, area, soil_type || null, water_source || null, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Field updated successfully',
      field: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const deleteField = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    let deleteSql = `DELETE FROM fields WHERE id = $1`;
    const params: any[] = [id];
    if (role !== 'ADMIN') {
      deleteSql += ` AND user_id = $2`;
      params.push(userId);
    }

    const result = await query(deleteSql, params);

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Field not found or unauthorized' });
      return;
    }

    res.json({
      success: true,
      message: 'Field and all associated records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
