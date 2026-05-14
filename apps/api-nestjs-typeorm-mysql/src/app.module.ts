import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
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
      entities: [User, Task],
      synchronize: process.env.NODE_ENV === 'development'
    }),
    BullModule.forRoot({
      redis: process.env.REDIS_URL ?? 'redis://localhost:6379'
    }),
    BullModule.registerQueue({ name: 'tasks' }),
    AuthModule,
    TasksModule
  ],
  providers: [TasksProcessor]
})
export class AppModule {}
