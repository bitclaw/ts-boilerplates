import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { app } from '~/app.ts';
import { cleanDb, createTask, createUser } from '~/lib/test-helpers.ts';

afterEach(cleanDb);

describe('GET /api/tasks', () => {
  it('returns 200 with user tasks', async () => {
    const { user, token } = await createUser();
    await createTask(user.id, { title: 'Task A' });
    await createTask(user.id, { title: 'Task B' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
  });

  it('only returns tasks belonging to the authenticated user', async () => {
    const { user, token } = await createUser();
    const { user: other } = await createUser({ email: 'other@test.com' });
    await createTask(user.id, { title: 'Mine' });
    await createTask(other.id, { title: 'Not mine' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe('Mine');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/tasks', () => {
  it('returns 201 with created task', async () => {
    const { token } = await createUser();

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New task' });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('New task');
    expect(res.body.task.status).toBe('TODO');
  });

  it('returns 400 on missing title', async () => {
    const { token } = await createUser();

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns 200 with task', async () => {
    const { user, token } = await createUser();
    const task = await createTask(user.id, { title: 'Find me' });

    const res = await request(app)
      .get(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.task.id).toBe(task.id);
  });

  it('returns 404 for another user task', async () => {
    const { token } = await createUser();
    const { user: other } = await createUser({ email: 'other@test.com' });
    const task = await createTask(other.id);

    const res = await request(app)
      .get(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('returns 200 with updated task', async () => {
    const { user, token } = await createUser();
    const task = await createTask(user.id, { title: 'Old title' });

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New title', status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('New title');
    expect(res.body.task.status).toBe('IN_PROGRESS');
  });

  it('returns 404 for another user task', async () => {
    const { token } = await createUser();
    const { user: other } = await createUser({ email: 'other@test.com' });
    const task = await createTask(other.id);

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('returns 204 and deletes task', async () => {
    const { user, token } = await createUser();
    const task = await createTask(user.id);

    const res = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 for another user task', async () => {
    const { token } = await createUser();
    const { user: other } = await createUser({ email: 'other@test.com' });
    const task = await createTask(other.id);

    const res = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
