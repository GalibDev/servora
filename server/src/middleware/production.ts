import { randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';

export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many requests, please try again later', data: null } });
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, skipSuccessfulRequests: true, message: { success: false, message: 'Too many authentication attempts, please try again later', data: null } });
export const requestLogger = pinoHttp({
  level: process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || 'info',
  genReqId(req, res) { const id = req.headers['x-request-id'] || randomUUID(); res.setHeader('x-request-id', id); return id; },
  customLogLevel(_req, res, error) { if (error || res.statusCode >= 500) return 'error'; if (res.statusCode >= 400) return 'warn'; return 'info'; },
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
