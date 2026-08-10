import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = (handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler => (req, res, next: NextFunction) => { void Promise.resolve(handler(req, res)).catch(next); };
