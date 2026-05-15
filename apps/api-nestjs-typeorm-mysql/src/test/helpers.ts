import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../auth/user.entity';
import { Blog } from '../blogs/blog.entity';
import { Product } from '../products/product.entity';
import { Task } from '../tasks/task.entity';

export async function createUser(
  app: INestApplication,
  overrides?: { email?: string; password?: string }
) {
  const ds = app.get(DataSource);
  const plain = overrides?.password ?? 'Password1!';
  const user = await ds.getRepository(User).save({
    email: overrides?.email ?? 'test@test.com',
    password: await bcrypt.hash(plain, 4),
    name: 'Test User'
  });
  const token = app.get(JwtService).sign({ sub: user.id, email: user.email });
  return { user, token, plainPassword: plain };
}

export async function createTask(
  app: INestApplication,
  userId: string,
  overrides?: { title?: string }
) {
  return app.get(DataSource).getRepository(Task).save({
    title: overrides?.title ?? 'Test task',
    userId
  });
}

export async function createProduct(
  app: INestApplication,
  overrides?: Partial<{ name: string; price: number; category: string; ratingRate: number; ratingCount: number }>
) {
  return app.get(DataSource).getRepository(Product).save({
    name: overrides?.name ?? 'Test product',
    price: overrides?.price ?? 9.99,
    category: overrides?.category,
    ratingRate: overrides?.ratingRate,
    ratingCount: overrides?.ratingCount
  });
}

export async function createBlog(
  app: INestApplication,
  authorId: string,
  overrides?: Partial<{ title: string; description: string }>
) {
  return app.get(DataSource).getRepository(Blog).save({
    title: overrides?.title ?? 'Test blog',
    description: overrides?.description ?? 'Test description',
    authorId
  });
}

export async function cleanDb(app: INestApplication) {
  const ds = app.get(DataSource);
  await ds.query('SET FOREIGN_KEY_CHECKS = 0');
  await ds.query('DELETE FROM tasks');
  await ds.query('DELETE FROM blogs');
  await ds.query('DELETE FROM products');
  await ds.query('DELETE FROM users');
  await ds.query('SET FOREIGN_KEY_CHECKS = 1');
}
