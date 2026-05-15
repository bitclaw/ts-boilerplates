import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../../test/app';
import { cleanDb, createTask, createUser } from '../../test/helpers';

let app: INestApplication;

beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  await app.close();
});

afterEach(() => cleanDb(app));

describe('GET /api/tasks', () => {
  it('returns 200 with user tasks', async () => {
    const { user, token } = await createUser(app);
    await createTask(app, user.id, { title: 'Task A' });
    await createTask(app, user.id, { title: 'Task B' });

    const res = await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('only returns tasks belonging to authenticated user', async () => {
    const { user, token } = await createUser(app);
    const { user: other } = await createUser(app, { email: 'other@test.com' });
    await createTask(app, user.id, { title: 'Mine' });
    await createTask(app, other.id, { title: 'Not mine' });

    const res = await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Mine');
  });

  it('returns 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/tasks', () => {
  it('returns 201 with created task', async () => {
    const { token } = await createUser(app);

    const res = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New task' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New task');
    expect(res.body.status).toBe('TODO');
  });

  it('returns 400 on missing title', async () => {
    const { token } = await createUser(app);

    const res = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns 200 with task', async () => {
    const { user, token } = await createUser(app);
    const task = await createTask(app, user.id, { title: 'Find me' });

    const res = await request(app.getHttpServer())
      .get(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(task.id);
  });

  it('returns 404 for another user task', async () => {
    const { token } = await createUser(app);
    const { user: other } = await createUser(app, { email: 'other@test.com' });
    const task = await createTask(app, other.id);

    const res = await request(app.getHttpServer())
      .get(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('returns 200 with updated task', async () => {
    const { user, token } = await createUser(app);
    const task = await createTask(app, user.id, { title: 'Old' });

    const res = await request(app.getHttpServer())
      .patch(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New', status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New');
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('returns 404 for another user task', async () => {
    const { token } = await createUser(app);
    const { user: other } = await createUser(app, { email: 'other@test.com' });
    const task = await createTask(app, other.id);

    const res = await request(app.getHttpServer())
      .patch(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('returns 204 and task is gone', async () => {
    const { user, token } = await createUser(app);
    const task = await createTask(app, user.id);

    const res = await request(app.getHttpServer())
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 for another user task', async () => {
    const { token } = await createUser(app);
    const { user: other } = await createUser(app, { email: 'other@test.com' });
    const task = await createTask(app, other.id);

    const res = await request(app.getHttpServer())
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
