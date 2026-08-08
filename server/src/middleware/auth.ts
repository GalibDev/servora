import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/http.js';
export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new AppError(401, 'Authentication required'));
  try { req.user = jwt.verify(token, process.env.JWT_SECRET!) as typeof req.user; next(); }
  catch { next(new AppError(401, 'Invalid or expired token')); }
};
