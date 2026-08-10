import { Router } from 'express';
import { bookingController as controller } from '../controllers/booking.controller.js';
import { asyncHandler } from '../lib/async-handler.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { bookingCreateSchema, bookingUpdateSchema, idParamsSchema } from '../validation/schemas.js';

export const bookings = Router();
bookings.use(auth);
bookings.get('/provider', requireRole('PROVIDER', 'ADMIN'), asyncHandler(controller.incoming));
bookings.get('/', requireRole('CUSTOMER'), asyncHandler(controller.customer));
bookings.get('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.byId));
bookings.post('/', requireRole('CUSTOMER'), validate(bookingCreateSchema), asyncHandler(controller.create));
bookings.patch('/:id', validate(idParamsSchema, 'params'), validate(bookingUpdateSchema), asyncHandler(controller.update));
bookings.delete('/:id', validate(idParamsSchema, 'params'), asyncHandler(controller.remove));
