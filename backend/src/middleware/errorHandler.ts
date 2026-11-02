import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  detail?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error Handler]:', {
    message: err.message,
    code: err.code,
    detail: err.detail,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const statusCode = err.statusCode || 500;

  // Handle unique constraint violation in PostgreSQL (code '23505')
  if (err.code === '23505') {
    res.status(409).json({
      success: false,
      error: 'Conflict: A record with this information already exists.',
      detail: err.detail
    });
    return;
  }

  // Handle foreign key constraint violation (code '23503')
  if (err.code === '23503') {
    res.status(400).json({
      success: false,
      error: 'Invalid reference: Referenced entity does not exist.',
      detail: err.detail
    });
    return;
  }

  // Handle check constraint violation (code '23514')
  if (err.code === '23514') {
    res.status(400).json({
      success: false,
      error: 'Constraint violation: Supplied values violate validation rules.',
      detail: err.detail
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};
