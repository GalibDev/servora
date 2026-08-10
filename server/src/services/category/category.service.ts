import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/http.js';

export const categoryService = {
  async managed(limit: number, skip: number) { const where = { isDeleted: false }; const [items, total] = await prisma.$transaction([prisma.category.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }), prisma.category.count({ where })]); return { items, total }; },
  async list(limit: number, skip: number) { const where = { isDeleted: false, status: 'ACTIVE' as const }; const [items, total] = await prisma.$transaction([prisma.category.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }), prisma.category.count({ where })]); return { items, total }; },
  async byId(id: string) { const data = await prisma.category.findFirst({ where: { id, isDeleted: false, status: 'ACTIVE' } }); if (!data) throw new AppError(404, 'Category not found'); return data; },
  create: (data: Parameters<typeof prisma.category.create>[0]['data']) => prisma.category.create({ data }),
  update: (id: string, data: Parameters<typeof prisma.category.update>[0]['data']) => prisma.category.update({ where: { id }, data }),
  remove: (id: string) => prisma.category.update({ where: { id }, data: { isDeleted: true } }),
};
