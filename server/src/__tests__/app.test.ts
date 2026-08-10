import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';
import { bookingCreateSchema, categoryCreateSchema, serviceCreateSchema } from '../validation/schemas.js';

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
