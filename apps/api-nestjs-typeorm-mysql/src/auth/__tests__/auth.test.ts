import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../../test/app';
import { cleanDb, createUser } from '../../test/helpers';

let app: INestApplication;

beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  await app.close();
});

afterEach(() => cleanDb(app));

describe('POST /api/auth/register', () => {
  it('returns 201 with user and token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.token).toBeDefined();
  });

  it('returns 409 on duplicate email', async () => {
    await createUser(app, { email: 'dup@test.com' });

    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'Password1!' });

    expect(res.status).toBe(409);
  });

  it('returns 400 on invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'Password1!' });

    expect(res.status).toBe(400);
  });

  it('returns 400 on weak password (no number)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'valid@test.com', password: 'onlyletters' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with token on valid credentials', async () => {
    await createUser(app, { email: 'login@test.com' });

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 401 on wrong password', async () => {
    await createUser(app, { email: 'login@test.com' });

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'WrongPass1!' });

    expect(res.status).toBe(401);
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password1!' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 without auth token', async () => {
    const res = await request(app.getHttpServer()).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('logged out');
  });
});

describe('GET /api/auth/me', () => {
  it('returns 200 with user when authenticated', async () => {
    const { token } = await createUser(app, { email: 'me@test.com' });

    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/auth/me', () => {
  it('returns 204 and removes user', async () => {
    const { token } = await createUser(app, { email: 'delete@test.com' });

    const res = await request(app.getHttpServer())
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    // token now invalid — user deleted, JwtStrategy DB lookup returns null
    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(401);
  });

  it('returns 401 without token', async () => {
    const res = await request(app.getHttpServer()).delete('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
