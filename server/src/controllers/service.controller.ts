import type { Request, Response } from 'express';
import { serviceService } from '../services/service/service.service.js';
import { ok } from '../lib/http.js';
import { pagination, paginationMeta } from '../lib/pagination.js';

export const serviceController = {
  list: async (req: Request, res: Response) => { const { page, limit, skip } = pagination(req); const { items, total } = await serviceService.list({ page, limit, skip, categoryId: req.query.categoryId ? String(req.query.categoryId) : undefined, search: req.query.search ? String(req.query.search) : undefined }); ok(res, 'Services retrieved successfully', items, 200, paginationMeta(page, limit, total)); },
  managed: async (req: Request, res: Response) => { const { page, limit, skip } = pagination(req); const { items, total } = await serviceService.managed(req.user!, page, limit, skip); ok(res, 'Managed services retrieved successfully', items, 200, paginationMeta(page, limit, total)); },
  byId: async (req: Request, res: Response) => ok(res, 'Service retrieved successfully', await serviceService.byId(String(req.params.id))),
  create: async (req: Request, res: Response) => ok(res, 'Service created successfully', await serviceService.create(req.body, req.user!), 201),
  update: async (req: Request, res: Response) => ok(res, 'Service updated successfully', await serviceService.update(String(req.params.id), req.body, req.user!)),
  remove: async (req: Request, res: Response) => ok(res, 'Service deleted successfully', await serviceService.remove(String(req.params.id), req.user!)),
};
