import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '~/lib/prisma.ts';
import { authenticate, type AuthRequest } from '~/middleware/authenticate.ts';
import { validate } from '~/middleware/validate.ts';

export const tasksRouter = Router();

tasksRouter.use(authenticate);

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional()
});

const updateSchema = createSchema.partial();

tasksRouter.get('/', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ tasks });
});

tasksRouter.post('/', validate(createSchema), async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const data = req.body as z.infer<typeof createSchema>;
  const task = await prisma.task.create({ data: { ...data, userId } });
  res.status(201).json({ task });
});

tasksRouter.get('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const task = await prisma.task.findFirst({
    where: { id: req.params['id'], userId }
  });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ task });
});

tasksRouter.patch('/:id', validate(updateSchema), async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const existing = await prisma.task.findFirst({
    where: { id: req.params['id'], userId }
  });
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  const task = await prisma.task.update({
    where: { id: req.params['id'] },
    data: req.body as z.infer<typeof updateSchema>
  });
  res.json({ task });
});

tasksRouter.delete('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const existing = await prisma.task.findFirst({
    where: { id: req.params['id'], userId }
  });
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  await prisma.task.delete({ where: { id: req.params['id'] } });
  res.status(204).send();
});
