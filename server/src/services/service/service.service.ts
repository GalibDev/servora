import type { Role, ServiceStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/http.js';

const include = { category: true, provider: { select: { id: true, name: true, avatar: true } }, reviews: { where: { isDeleted: false, status: 'PUBLISHED' as const } } } as const;
type Actor = { id: string; role: Role };
type ServiceInput = { title?: string; description?: string; price?: number; duration?: number; image?: string; status?: ServiceStatus; categoryId?: string; providerId?: string };

export const serviceService = {
  async list(options: { page: number; limit: number; skip: number; categoryId?: string; search?: string }) { const where = { isDeleted: false, status: 'ACTIVE' as const, ...(options.categoryId ? { categoryId: options.categoryId } : {}), ...(options.search ? { OR: [{ title: { contains: options.search, mode: 'insensitive' as const } }, { description: { contains: options.search, mode: 'insensitive' as const } }] } : {}) }; const [items, total] = await prisma.$transaction([prisma.service.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip: options.skip, take: options.limit }), prisma.service.count({ where })]); return { items, total }; },
  async managed(actor: Actor, page: number, limit: number, skip: number) { const where = { isDeleted: false, ...(actor.role === 'PROVIDER' ? { providerId: actor.id } : {}) }; const [items, total] = await prisma.$transaction([prisma.service.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip, take: limit }), prisma.service.count({ where })]); return { items, total }; },
  async byId(id: string) { const data = await prisma.service.findFirst({ where: { id, isDeleted: false }, include }); if (!data) throw new AppError(404, 'Service not found'); return data; },
  create(input: ServiceInput, actor: Actor) { const { providerId, ...data } = input; return prisma.service.create({ data: { title: data.title!, description: data.description!, price: data.price!, duration: data.duration!, image: data.image || null, status: data.status || 'DRAFT', categoryId: data.categoryId!, providerId: actor.role === 'ADMIN' && providerId ? providerId : actor.id } }); },
  async update(id: string, input: ServiceInput, actor: Actor) { const current = await prisma.service.findUnique({ where: { id } }); if (!current) throw new AppError(404, 'Service not found'); if (actor.role === 'PROVIDER' && current.providerId !== actor.id) throw new AppError(403, 'You can only update your own services'); const { providerId: _providerId, ...data } = input; return prisma.service.update({ where: { id }, data }); },
  async remove(id: string, actor: Actor) { const current = await prisma.service.findUnique({ where: { id } }); if (!current) throw new AppError(404, 'Service not found'); if (actor.role === 'PROVIDER' && current.providerId !== actor.id) throw new AppError(403, 'You can only delete your own services'); return prisma.service.update({ where: { id }, data: { isDeleted: true } }); },
};
