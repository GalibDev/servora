import type { Response } from 'express';
export const ok = (res: Response, message: string, data: unknown, status = 200) => res.status(status).json({ success: true, message, data });
export class AppError extends Error { constructor(public status: number, message: string) { super(message); } }
