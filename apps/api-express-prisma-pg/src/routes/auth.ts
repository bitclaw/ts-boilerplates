import bcrypt from 'bcrypt';
import { Router } from 'express';
import { z } from 'zod';
import { signToken } from '~/lib/jwt.ts';
import { prisma } from '~/lib/prisma.ts';
import { authenticate, type AuthRequest } from '~/middleware/authenticate.ts';
import { validate } from '~/middleware/validate.ts';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string()
});

authRouter.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body as z.infer<typeof registerSchema>;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
    select: { id: true, email: true, name: true, createdAt: true }
  });

  const token = await signToken({ sub: user.id, email: user.email });
  res.status(201).json({ user, token });
});

authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = await signToken({ sub: user.id, email: user.email });
  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token
  });
});

authRouter.get('/me', authenticate, async (req, res) => {
  const { userId } = req as AuthRequest;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true }
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});
