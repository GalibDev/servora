import { Router } from 'express';
import { z } from 'zod';
import { login, register } from '../services/auth/auth.service.js';
import { ok } from '../lib/http.js';
const router = Router();
router.post('/register', async (req, res, next) => { try { const body = z.object({ name: z.string().min(2), email: z.email(), password: z.string().min(8) }).parse(req.body); ok(res, 'Registration successful', await register(body), 201); } catch (e) { next(e); } });
router.post('/login', async (req, res, next) => { try { const body = z.object({ email: z.email(), password: z.string().min(1) }).parse(req.body); ok(res, 'Login successful', await login(body.email, body.password)); } catch (e) { next(e); } });
export default router;
