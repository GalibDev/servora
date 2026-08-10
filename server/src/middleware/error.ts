import type { ErrorRequestHandler } from 'express';
import { AppError } from '../lib/http.js';
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const logger = (_req as typeof _req & { log?: { error: (details: unknown, message?: string) => void } }).log;
  if (logger) logger.error({ err }, 'Request failed'); else console.error(err);
  const status = err instanceof AppError ? err.status : 500;
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : err.message, data: null });
};
