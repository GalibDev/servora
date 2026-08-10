import type { Request, Response } from 'express';
import { bookingService } from '../services/booking/booking.service.js';
import { ok } from '../lib/http.js';
import { pagination, paginationMeta } from '../lib/pagination.js';

export const bookingController = {
  customer: async (req: Request, res: Response) => { const { page, limit, skip } = pagination(req); const { items, total } = await bookingService.customer(req.user!, page, limit, skip); ok(res, 'Bookings retrieved successfully', items, 200, paginationMeta(page, limit, total)); },
  incoming: async (req: Request, res: Response) => { const { page, limit, skip } = pagination(req); const { items, total } = await bookingService.incoming(req.user!, page, limit, skip); ok(res, 'Incoming bookings retrieved successfully', items, 200, paginationMeta(page, limit, total)); },
  byId: async (req: Request, res: Response) => ok(res, 'Booking retrieved successfully', await bookingService.byId(String(req.params.id), req.user!)),
  create: async (req: Request, res: Response) => ok(res, 'Booking created successfully', await bookingService.create(req.user!, req.body), 201),
  update: async (req: Request, res: Response) => ok(res, 'Booking updated successfully', await bookingService.update(String(req.params.id), req.user!, req.body)),
  remove: async (req: Request, res: Response) => ok(res, 'Booking deleted successfully', await bookingService.remove(String(req.params.id), req.user!)),
};
