import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production'
);

export type JwtPayload = {
  sub: string;
  email: string;
};

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env['JWT_EXPIRES_IN'] ?? '7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JwtPayload;
}
