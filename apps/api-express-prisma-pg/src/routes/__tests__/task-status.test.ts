import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { app } from '~/app.ts';
import { cleanDb, createTask, createUser } from '~/lib/test-helpers.ts';

afterEach(cleanDb);

describe('PATCH /api/tasks/:id/status', () => {
  it('returns 200 with updated status', async () => {
    const { user, token } = await createUser();
    const task = await createTask(user.id, { status: 'TODO' });

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('DONE');
  });

  it('returns 400 on invalid status', async () => {
    const { user, token } = await createUser();
    const task = await createTask(user.id);

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INVALID' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for another user task', async () => {
    const { token } = await createUser();
    const { user: other } = await createUser({ email: 'other@test.com' });
    const task = await createTask(other.id);

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(404);
  });
});