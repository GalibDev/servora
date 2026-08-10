import type { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/http.js';

const safe = { password: true } as const;
export const userService = {
  me: (id: string) => prisma.user.findUnique({ where: { id }, omit: safe }),
  async list(page: number, limit: number, skip: number) { const where = { isDeleted: false }; const [items, total] = await prisma.$transaction([prisma.user.findMany({ where, omit: safe, orderBy: { createdAt: 'desc' }, skip, take: limit }), prisma.user.count({ where })]); return { items, total }; },
  async byId(id: string, actor: { id: string; role: Role }) { if (actor.id !== id && actor.role !== 'ADMIN') throw new AppError(403, 'Forbidden'); const data = await prisma.user.findFirst({ where: { id, isDeleted: false }, omit: safe }); if (!data) throw new AppError(404, 'User not found'); return data; },
  async update(id: string, actor: { id: string; role: Role }, input: Record<string, unknown>) { if (actor.id !== id && actor.role !== 'ADMIN') throw new AppError(403, 'Forbidden'); const data = actor.role === 'ADMIN' ? input : { name: input.name, avatar: input.avatar }; return prisma.user.update({ where: { id }, data, omit: safe }); },
  async remove(id: string, actor: { id: string; role: Role }) { if (actor.id !== id && actor.role !== 'ADMIN') throw new AppError(403, 'Forbidden'); return prisma.user.update({ where: { id }, data: { isDeleted: true }, omit: safe }); },
};
