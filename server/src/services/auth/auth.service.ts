import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/http.js';
const safe = { id: true, name: true, email: true, avatar: true, role: true, createdAt: true } as const;
export async function register(input: { name: string; email: string; password: string; role: 'CUSTOMER' | 'PROVIDER' }) {
  if (await prisma.user.findUnique({ where: { email: input.email } })) throw new AppError(409, 'Email already registered');
  const user = await prisma.user.create({ data: { ...input, password: await bcrypt.hash(input.password, 12) }, select: safe });
  return { user, token: jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' }) };
}
export async function login(email: string, password: string) {
  const record = await prisma.user.findUnique({ where: { email } });
  if (!record || record.isDeleted || record.status !== 'ACTIVE' || !(await bcrypt.compare(password, record.password))) throw new AppError(401, 'Invalid email or password');
  const { password: _, ...user } = record;
  return { user, token: jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' }) };
}
