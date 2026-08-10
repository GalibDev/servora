import { Router } from 'express';
import { login, register } from '../services/auth/auth.service.js';
import { ok } from '../lib/http.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';
const router = Router();
router.post('/register', validate(registerSchema), async (req, res, next) => { try { ok(res, 'Registration successful', await register(req.body), 201); } catch (e) { next(e); } });
router.post('/login', validate(loginSchema), async (req, res, next) => { try { ok(res, 'Login successful', await login(req.body.email, req.body.password)); } catch (e) { next(e); } });
export default router;
