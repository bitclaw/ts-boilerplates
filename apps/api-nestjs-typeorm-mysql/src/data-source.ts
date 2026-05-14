import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Task } from './tasks/task.entity';
import { User } from './auth/user.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'app',
  password: process.env.DB_PASSWORD ?? 'app',
  database: process.env.DB_DATABASE ?? 'app_dev',
  entities: [User, Task],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false
});
