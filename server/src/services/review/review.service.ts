import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/http.js';

export const reviewService = {
  async mine(userId: string, page: number, limit: number, skip: number) { const where = { userId, isDeleted: false }; const [items, total] = await prisma.$transaction([prisma.review.findMany({ where, include: { service: { select: { id: true, title: true, image: true } } }, orderBy: { updatedAt: 'desc' }, skip, take: limit }), prisma.review.count({ where })]); return { items, total }; },
  async list(options: { page: number; limit: number; skip: number; serviceId?: string }) { const where = { isDeleted: false, status: 'PUBLISHED' as const, ...(options.serviceId ? { serviceId: options.serviceId } : {}) }; const [items, total] = await prisma.$transaction([prisma.review.findMany({ where, include: { user: { select: { id: true, name: true, avatar: true } }, service: { select: { id: true, title: true } } }, orderBy: { createdAt: 'desc' }, skip: options.skip, take: options.limit }), prisma.review.count({ where })]); return { items, total }; },
  async byId(id: string) { const data = await prisma.review.findFirst({ where: { id, isDeleted: false, status: 'PUBLISHED' } }); if (!data) throw new AppError(404, 'Review not found'); return data; },
  save(userId: string, input: { serviceId: string; rating: number; comment?: string }) { return prisma.review.upsert({ where: { userId_serviceId: { userId, serviceId: input.serviceId } }, update: { rating: input.rating, comment: input.comment, isDeleted: false }, create: { ...input, userId } }); },
  update(id: string, userId: string, input: { rating?: number; comment?: string }) { return prisma.review.update({ where: { id, userId }, data: input }); },
  remove: (id: string, userId: string) => prisma.review.update({ where: { id, userId }, data: { isDeleted: true } }),
};
