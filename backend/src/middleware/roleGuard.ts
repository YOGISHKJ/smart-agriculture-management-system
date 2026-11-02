import { Request, Response, NextFunction } from 'express';

export const roleGuard = (...allowedRoles: Array<'FARMER' | 'ADMIN'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. Please log in first.'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Access restricted to ${allowedRoles.join(', ')} roles.`
      });
      return;
    }

    next();
  };
};
