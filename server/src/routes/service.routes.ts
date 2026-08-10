import { Router } from 'express';
import { serviceController as controller } from '../controllers/service.controller.js';
import { asyncHandler } from '../lib/async-handler.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { idParamsSchema, serviceCreateSchema, serviceUpdateSchema } from '../validation/schemas.js';

export const services = Router();
services.get('/', asyncHandler(controller.list));
services.get('/mine', auth, requireRole('PROVIDER', 'ADMIN'), asyncHandler(controller.managed));
services.get('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.byId));
services.post('/', auth, requireRole('PROVIDER', 'ADMIN'), validate(serviceCreateSchema), asyncHandler(controller.create));
services.patch('/:id', auth, requireRole('PROVIDER', 'ADMIN'), validate(idParamsSchema, 'params'), validate(serviceUpdateSchema), asyncHandler(controller.update));
services.delete('/:id', auth, requireRole('PROVIDER', 'ADMIN'), validate(idParamsSchema, 'params'), asyncHandler(controller.remove));
