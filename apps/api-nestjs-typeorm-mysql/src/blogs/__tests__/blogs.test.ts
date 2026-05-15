import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../../test/app';
import { cleanDb, createBlog, createUser } from '../../test/helpers';

let app: INestApplication;

beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  await app.close();
});

afterEach(() => cleanDb(app));

describe('POST /api/blogs', () => {
  it('returns 201 with created blog', async () => {
    const { token } = await createUser(app);

    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Post', description: 'Hello world' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('My Post');
    expect(res.body.authorId).toBeDefined();
  });

  it('returns 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .send({ title: 'My Post', description: 'Hello world' });

    expect(res.status).toBe(401);
  });

  it('returns 400 on missing description', async () => {
    const { token } = await createUser(app);

    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Post' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/blogs', () => {
  it('returns user blogs only (user isolation)', async () => {
    const { user, token } = await createUser(app);
    const { user: other } = await createUser(app, { email: 'other@test.com' });
    await createBlog(app, user.id, { title: 'Mine' });
    await createBlog(app, other.id, { title: 'Not mine' });

    const res = await request(app.getHttpServer())
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Mine');
  });
});

describe('GET /api/blogs/search', () => {
  it('returns blogs matching title (case-insensitive)', async () => {
    const { user, token } = await createUser(app);
    await createBlog(app, user.id, { title: 'NestJS Tutorial', description: 'Basics' });
    await createBlog(app, user.id, { title: 'React Guide', description: 'Hooks' });

    const res = await request(app.getHttpServer())
      .get('/api/blogs/search?q=nestjs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('NestJS Tutorial');
  });

  it('returns blogs matching description', async () => {
    const { user, token } = await createUser(app);
    await createBlog(app, user.id, { title: 'Post 1', description: 'TypeORM deep dive' });
    await createBlog(app, user.id, { title: 'Post 2', description: 'Prisma guide' });

    const res = await request(app.getHttpServer())
      .get('/api/blogs/search?q=typeorm')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Post 1');
  });

  it('returns empty array for no matches', async () => {
    const { user, token } = await createUser(app);
    await createBlog(app, user.id, { title: 'Hello', description: 'World' });

    const res = await request(app.getHttpServer())
      .get('/api/blogs/search?q=zzznomatch')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('GET /api/blogs/:id', () => {
  it('returns 200 with blog', async () => {
    const { user, token } = await createUser(app);
    const blog = await createBlog(app, user.id, { title: 'Find me' });

    const res = await request(app.getHttpServer())
      .get(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(blog.id);
  });

  it('returns 404 for another user blog', async () => {
    const { token } = await createUser(app);
    const { user: other } = await createUser(app, { email: 'other@test.com' });
    const blog = await createBlog(app, other.id);

    const res = await request(app.getHttpServer())
      .get(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/blogs/:id', () => {
  it('returns 200 with updated blog', async () => {
    const { user, token } = await createUser(app);
    const blog = await createBlog(app, user.id, { title: 'Old' });

    const res = await request(app.getHttpServer())
      .patch(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });
});

describe('DELETE /api/blogs/:id', () => {
  it('returns 204', async () => {
    const { user, token } = await createUser(app);
    const blog = await createBlog(app, user.id);

    const res = await request(app.getHttpServer())
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
