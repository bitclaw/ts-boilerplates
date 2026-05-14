import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '~/lib/jwt.ts';

export type AuthRequest = Request & { userId: string; userEmail: string };

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = await verifyToken(token);
    (req as AuthRequest).userId = payload.sub;
    (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
