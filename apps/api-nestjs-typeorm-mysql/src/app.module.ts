import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import { Blog } from './blogs/blog.entity';
import { BlogsModule } from './blogs/blogs.module';
import { Product } from './products/product.entity';
import { ProductsModule } from './products/products.module';
import { TasksProcessor } from './queue/tasks.processor';
import { Task } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME ?? 'app',
      password: process.env.DB_PASSWORD ?? 'app',
      database: process.env.DB_DATABASE ?? 'app_dev',
      entities: [User, Task, Product, Blog],
      synchronize: process.env.NODE_ENV === 'development'
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRoot({
      redis: process.env.REDIS_URL ?? 'redis://localhost:6379'
    }),
    BullModule.registerQueue({ name: 'tasks' }),
    AuthModule,
    TasksModule,
    ProductsModule,
    BlogsModule
  ],
  providers: [
    TasksProcessor,
    { provide: APP_GUARD, useClass: ThrottlerGuard }
  ]
})
export class AppModule {}
