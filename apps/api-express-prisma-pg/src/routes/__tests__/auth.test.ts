import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { app } from '~/app.ts';
import { cleanDb, createUser } from '~/lib/test-helpers.ts';

afterEach(cleanDb);

describe('POST /api/auth/register', () => {
  it('returns 201 with user and token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.token).toBeDefined();
  });

  it('returns 409 when email already registered', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with token on valid credentials', async () => {
    await createUser({ email: 'login@test.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('returns 200 with token on valid credentials', async () => {
    await createUser({ email: 'login@test.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
    expect(res.body.user.password).toBeUndefined();
  });
});