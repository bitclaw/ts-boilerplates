import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

export type TaskJobData = {
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted';
};

@Processor('tasks')
export class TasksProcessor {
  @Process('notify')
  async handleNotify(job: Job<TaskJobData>) {
    // Stub: extend with email/webhook/push notifications
    console.info(`Task event: ${job.data.action} for task ${job.data.taskId}`);
  }
}
