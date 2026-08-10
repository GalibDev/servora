import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { AppError } from '../lib/http.js';

export const requireRole = (...roles: Role[]) => (req: Request, _res: Response, next: NextFunction) => roles.includes(req.user!.role) ? next() : next(new AppError(403, 'You do not have permission to perform this action'));
