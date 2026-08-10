import type { Request, Response } from 'express';
import { categoryService } from '../services/category/category.service.js';
import { ok } from '../lib/http.js';
import { pagination, paginationMeta } from '../lib/pagination.js';

export const categoryController = {
  list: async (req: Request, res: Response) => { const { page, limit, skip } = pagination(req); const { items, total } = await categoryService.list(limit, skip); ok(res, 'Categories retrieved successfully', items, 200, paginationMeta(page, limit, total)); },
  byId: async (req: Request, res: Response) => ok(res, 'Category retrieved successfully', await categoryService.byId(String(req.params.id))),
  create: async (req: Request, res: Response) => ok(res, 'Category created successfully', await categoryService.create(req.body), 201),
  update: async (req: Request, res: Response) => ok(res, 'Category updated successfully', await categoryService.update(String(req.params.id), req.body)),
  remove: async (req: Request, res: Response) => ok(res, 'Category deleted successfully', await categoryService.remove(String(req.params.id))),
};
