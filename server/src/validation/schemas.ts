import { z } from 'zod';

export const idParamsSchema = z.object({ id: z.string().min(1) });
export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.email().toLowerCase(), password: z.string().min(8).max(128) });
export const loginSchema = z.object({ email: z.email().toLowerCase(), password: z.string().min(1).max(128) });

export const categoryCreateSchema = z.object({ name: z.string().trim().min(2).max(80), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), icon: z.string().max(12).optional(), description: z.string().trim().max(500).optional() });
export const categoryUpdateSchema = categoryCreateSchema.partial().refine(value => Object.keys(value).length > 0, 'At least one field is required');

export const serviceCreateSchema = z.object({ title: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(2000), price: z.coerce.number().positive().max(100000), duration: z.coerce.number().int().min(15).max(1440), image: z.url().optional().or(z.literal('')), status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).default('DRAFT'), categoryId: z.string().min(1), providerId: z.string().min(1).optional() });
export const serviceUpdateSchema = serviceCreateSchema.partial().refine(value => Object.keys(value).length > 0, 'At least one field is required');

export const reviewCreateSchema = z.object({ serviceId: z.string().min(1), rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().max(1000).optional() });
export const reviewUpdateSchema = reviewCreateSchema.omit({ serviceId: true }).partial().refine(value => Object.keys(value).length > 0, 'At least one field is required');

export const bookingCreateSchema = z.object({ serviceId: z.string().min(1), scheduledAt: z.iso.datetime(), address: z.string().trim().min(5).max(300), note: z.string().trim().max(1000).optional() });
export const bookingUpdateSchema = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(), scheduledAt: z.iso.datetime().optional(), address: z.string().trim().min(5).max(300).optional(), note: z.string().trim().max(1000).optional() }).refine(value => Object.keys(value).length > 0, 'At least one field is required');

export const userUpdateSchema = z.object({ name: z.string().trim().min(2).max(80).optional(), avatar: z.url().optional().or(z.literal('')), role: z.enum(['CUSTOMER', 'PROVIDER', 'ADMIN']).optional() }).refine(value => Object.keys(value).length > 0, 'At least one field is required');
