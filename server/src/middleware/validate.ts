import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../lib/http.js';

export const validate = (schema: ZodType, target: 'body' | 'params' = 'body') => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req[target]);
  if (!result.success) {
    const message = result.error.issues.map(issue => `${issue.path.join('.') || target}: ${issue.message}`).join('; ');
    return next(new AppError(400, message));
  }
  req[target] = result.data;
  next();
};
