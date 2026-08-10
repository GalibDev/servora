import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/http.js';

export const reviewService = {
  async list(options: { page: number; limit: number; skip: number; serviceId?: string }) { const where = { isDeleted: false, ...(options.serviceId ? { serviceId: options.serviceId } : {}) }; const [items, total] = await prisma.$transaction([prisma.review.findMany({ where, include: { user: { select: { id: true, name: true, avatar: true } }, service: { select: { id: true, title: true } } }, orderBy: { createdAt: 'desc' }, skip: options.skip, take: options.limit }), prisma.review.count({ where })]); return { items, total }; },
  async byId(id: string) { const data = await prisma.review.findFirst({ where: { id, isDeleted: false } }); if (!data) throw new AppError(404, 'Review not found'); return data; },
  save(userId: string, input: { serviceId: string; rating: number; comment?: string }) { return prisma.review.upsert({ where: { userId_serviceId: { userId, serviceId: input.serviceId } }, update: { rating: input.rating, comment: input.comment, isDeleted: false }, create: { ...input, userId } }); },
  update(id: string, userId: string, input: { rating?: number; comment?: string }) { return prisma.review.update({ where: { id, userId }, data: input }); },
  remove: (id: string, userId: string) => prisma.review.update({ where: { id, userId }, data: { isDeleted: true } }),
};
