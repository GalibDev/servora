import { Router } from 'express';
import { reviewController as controller } from '../controllers/review.controller.js';
import { asyncHandler } from '../lib/async-handler.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { idParamsSchema, reviewCreateSchema, reviewUpdateSchema } from '../validation/schemas.js';

export const reviews = Router();
reviews.get('/', asyncHandler(controller.list));
reviews.get('/mine', auth, requireRole('CUSTOMER'), asyncHandler(controller.mine));
reviews.get('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.byId));
reviews.post('/', auth, requireRole('CUSTOMER'), validate(reviewCreateSchema), asyncHandler(controller.save));
reviews.patch('/:id', auth, requireRole('CUSTOMER'), validate(idParamsSchema, 'params'), validate(reviewUpdateSchema), asyncHandler(controller.update));
reviews.delete('/:id', auth, requireRole('CUSTOMER'), validate(idParamsSchema, 'params'), asyncHandler(controller.remove));
