import { prisma } from './prisma.ts';
import { signToken } from './jwt.ts';

export async function createUser(overrides?: { email?: string; password?: string }) {
  const user = await prisma.user.create({
    data: {
      email: overrides?.email ?? 'test@test.com',
      password: 'hashed-not-used-in-tests',
      name: 'Test User',
    },
  });
  const token = await signToken({ sub: user.id, email: user.email });
  return { user, token };
}

export async function createTask(userId: string, overrides?: { title?: string; status?: 'TODO' | 'IN_PROGRESS' | 'DONE' }) {
  return prisma.task.create({
    data: {
      title: overrides?.title ?? 'Test task',
      status: overrides?.status ?? 'TODO',
      userId,
    },
  });
}

export async function cleanDb() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}