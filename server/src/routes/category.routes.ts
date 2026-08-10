import { Router } from 'express';
import { categoryController as controller } from '../controllers/category.controller.js';
import { asyncHandler } from '../lib/async-handler.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { categoryCreateSchema, categoryUpdateSchema, idParamsSchema } from '../validation/schemas.js';

export const categories = Router();
categories.get('/', asyncHandler(controller.list));
categories.get('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.byId));
categories.post('/', auth, requireRole('ADMIN'), validate(categoryCreateSchema), asyncHandler(controller.create));
categories.patch('/:id', auth, requireRole('ADMIN'), validate(idParamsSchema, 'params'), validate(categoryUpdateSchema), asyncHandler(controller.update));
categories.delete('/:id', auth, requireRole('ADMIN'), validate(idParamsSchema, 'params'), asyncHandler(controller.remove));
