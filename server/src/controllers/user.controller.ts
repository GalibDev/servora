import type { Request, Response } from 'express';
import { userService } from '../services/user/user.service.js';
import { ok } from '../lib/http.js';
import { pagination, paginationMeta } from '../lib/pagination.js';

export const userController = {
  me: async (req: Request, res: Response) => ok(res, 'Profile retrieved successfully', await userService.me(req.user!.id)),
  list: async (req: Request, res: Response) => { const { page, limit, skip } = pagination(req); const { items, total } = await userService.list(page, limit, skip); ok(res, 'Users retrieved successfully', items, 200, paginationMeta(page, limit, total)); },
  byId: async (req: Request, res: Response) => ok(res, 'User retrieved successfully', await userService.byId(String(req.params.id), req.user!)),
  update: async (req: Request, res: Response) => ok(res, 'User updated successfully', await userService.update(String(req.params.id), req.user!, req.body)),
  remove: async (req: Request, res: Response) => ok(res, 'User deleted successfully', await userService.remove(String(req.params.id), req.user!)),
};
