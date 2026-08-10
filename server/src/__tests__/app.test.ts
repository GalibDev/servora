import request from 'supertest';
import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { app } from '../app.js';
import { bookingCreateSchema, categoryCreateSchema, registerSchema, serviceCreateSchema } from '../validation/schemas.js';

describe('Servora API production contract', () => {
  it('returns a healthy, consistent response envelope', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, message: 'Servora API is healthy' });
  });

  it('sets Helmet security headers and hides Express', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('returns standard rate-limit headers', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['ratelimit-policy']).toBeDefined();
  });

  it('rejects invalid registration payloads before database access', async () => {
    const response = await request(app).post('/api/auth/register').send({ name: 'A', email: 'invalid', password: '123' });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toBeNull();
  });

  it('uses the consistent envelope for missing routes', async () => {
    const response = await request(app).get('/api/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, message: 'Route not found', data: null });
  });
});

describe('Role-based access control', () => {
  const tokenFor = (role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN') => jwt.sign({ id: `${role.toLowerCase()}-id`, role }, process.env.JWT_SECRET!);

  it('prevents customers from creating provider services', async () => {
    const response = await request(app).post('/api/services').set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`).send({ title: 'Premium Cleaning', description: 'A complete premium cleaning service.', price: 75, duration: 90, categoryId: 'category-id' });
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/permission/i);
  });

  it('prevents providers from creating customer bookings', async () => {
    const response = await request(app).post('/api/bookings').set('Authorization', `Bearer ${tokenFor('PROVIDER')}`).send({ serviceId: 'service-id', scheduledAt: new Date(Date.now() + 86400000).toISOString(), address: 'Dhaka address' });
    expect(response.status).toBe(403);
  });

  it('prevents providers and admins from submitting customer reviews', async () => {
    for (const role of ['PROVIDER', 'ADMIN'] as const) {
      const response = await request(app).post('/api/reviews').set('Authorization', `Bearer ${tokenFor(role)}`).send({ serviceId: 'service-id', rating: 5 });
      expect(response.status).toBe(403);
    }
  });

  it('keeps the user directory admin-only', async () => {
    const response = await request(app).get('/api/users').set('Authorization', `Bearer ${tokenFor('CUSTOMER')}`);
    expect(response.status).toBe(403);
  });

  it('allows customer and provider signup roles but blocks public admin signup', () => {
    const base = { name: 'New Member', email: 'member@servora.com', password: 'Password123!' };
    expect(registerSchema.parse({ ...base, role: 'CUSTOMER' }).role).toBe('CUSTOMER');
    expect(registerSchema.parse({ ...base, role: 'PROVIDER' }).role).toBe('PROVIDER');
    expect(registerSchema.safeParse({ ...base, role: 'ADMIN' }).success).toBe(false);
  });
});

describe('Central resource validation', () => {
  it('validates and coerces service fields', () => {
    const parsed = serviceCreateSchema.parse({ title: 'Premium Cleaning', description: 'A complete premium cleaning service.', price: '75', duration: '90', categoryId: 'category-id', status: 'ACTIVE' });
    expect(parsed.price).toBe(75); expect(parsed.duration).toBe(90);
  });

  it('rejects invalid category slugs', () => {
    expect(categoryCreateSchema.safeParse({ name: 'Home Care', slug: 'Not Valid!' }).success).toBe(false);
  });

  it('rejects malformed booking dates', () => {
    expect(bookingCreateSchema.safeParse({ serviceId: 'id', scheduledAt: 'tomorrow', address: 'Dhaka address' }).success).toBe(false);
  });
});
