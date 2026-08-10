import type { Request } from 'express';
import type { PaginationMeta } from './http.js';

export function pagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export const paginationMeta = (page: number, limit: number, total: number): PaginationMeta => ({ page, limit, total, totalPages: Math.ceil(total / limit) });
