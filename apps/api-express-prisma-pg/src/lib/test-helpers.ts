import { prisma } from './prisma.ts';
import { signToken } from './jwt.ts';
import bcrypt from 'bcrypt';

export async function createUser(overrides?: { email?: string; password?: string }) {
  const plainPassword = overrides?.password ?? 'password123';
  const user = await prisma.user.create({
    data: {
      email: overrides?.email ?? 'test@test.com',
      password: await bcrypt.hash(plainPassword, 4), // cost 4 = fast in tests
      name: 'Test User',
    },
  });
  const token = await signToken({ sub: user.id, email: user.email });
  return { user, token, plainPassword };
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