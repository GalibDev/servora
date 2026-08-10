import type { Request, Response } from 'express';
import { reviewService } from '../services/review/review.service.js';
import { ok } from '../lib/http.js';
import { pagination, paginationMeta } from '../lib/pagination.js';

export const reviewController = {
  list: async (req: Request, res: Response) => { const { page, limit, skip } = pagination(req); const { items, total } = await reviewService.list({ page, limit, skip, serviceId: req.query.serviceId ? String(req.query.serviceId) : undefined }); ok(res, 'Reviews retrieved successfully', items, 200, paginationMeta(page, limit, total)); },
  byId: async (req: Request, res: Response) => ok(res, 'Review retrieved successfully', await reviewService.byId(String(req.params.id))),
  save: async (req: Request, res: Response) => ok(res, 'Review saved successfully', await reviewService.save(req.user!.id, req.body), 201),
  update: async (req: Request, res: Response) => ok(res, 'Review updated successfully', await reviewService.update(String(req.params.id), req.user!.id, req.body)),
  remove: async (req: Request, res: Response) => ok(res, 'Review deleted successfully', await reviewService.remove(String(req.params.id), req.user!.id)),
};
