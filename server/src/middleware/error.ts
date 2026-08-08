import type { ErrorRequestHandler } from 'express';
import { AppError } from '../lib/http.js';
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof AppError ? err.status : 500;
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : err.message, data: null });
};
