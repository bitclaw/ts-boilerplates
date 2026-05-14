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

  it('returns 400 on invalid body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'pw' });

    expect(res.status).toBe(400);
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
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 401 on wrong password', async () => {
    await createUser({ email: 'login@test.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 200 with user when authenticated', async () => {
    const { token } = await createUser({ email: 'me@test.com' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
