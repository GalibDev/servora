import type { Response } from 'express';
export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };
export const ok = (res: Response, message: string, data: unknown, status = 200, meta?: PaginationMeta) => res.status(status).json({ success: true, message, data, ...(meta ? { meta } : {}) });
export class AppError extends Error { constructor(public status: number, message: string) { super(message); } }
