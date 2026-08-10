import { Router } from 'express';
import { userController as controller } from '../controllers/user.controller.js';
import { asyncHandler } from '../lib/async-handler.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { idParamsSchema, userUpdateSchema } from '../validation/schemas.js';

export const users = Router();
users.use(auth);
users.get('/me', asyncHandler(controller.me));
users.get('/', requireRole('ADMIN'), asyncHandler(controller.list));
users.get('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.byId));
users.patch('/:id', validate(idParamsSchema, 'params'), validate(userUpdateSchema), asyncHandler(controller.update));
users.delete('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.remove));
