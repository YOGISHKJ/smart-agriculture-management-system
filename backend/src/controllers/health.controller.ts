import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool';

export const getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dbStart = Date.now();
    await query('SELECT 1 AS health_check');
    const dbLatencyMs = Date.now() - dbStart;

    res.json({
      status: 'ok',
      service: 'AgriPulse Farm Management Backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: 'connected',
        type: 'PostgreSQL 16',
        latencyMs: dbLatencyMs
      }
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      service: 'AgriPulse Farm Management Backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: 'disconnected',
        error: error.message
      }
    });
  }
};
