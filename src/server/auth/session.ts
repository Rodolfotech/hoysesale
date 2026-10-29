import jwt from 'jsonwebtoken';
import { NextResponse, type NextRequest } from 'next/server';
import { forbidden, unauthorized } from '../http';
import { findUserById } from '../services/users';

// Sesión por cookie httpOnly (ver SPEC.md). El header Authorization se acepta como respaldo para clientes antiguos.
export const ACCESS_COOKIE = 'access_token';

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

// JWT_SECRET es obligatorio: sin él cualquiera podría firmar tokens válidos. Nunca usar un valor por defecto.
function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definido');
  return secret;
}

export function signAccessToken(user: { id: string; email: string | null }): string {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret(), { expiresIn: '7d' });
}

// Token de recuperación de contraseña: 1 hora, tipo "reset" para que no sirva como sesión.
export function signResetToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'reset' }, jwtSecret(), { expiresIn: '1h' });
}

export function verifyToken(token: string): jwt.JwtPayload & { type?: string } {
  return jwt.verify(token, jwtSecret()) as jwt.JwtPayload & { type?: string };
}

function tokenFromRequest(req: NextRequest | Request): string | null {
  const fromCookie = 'cookies' in req ? req.cookies.get(ACCESS_COOKIE)?.value : undefined;
  if (fromCookie) return fromCookie;
  const header = req.headers.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

// Usuario de la sesión, o null si no hay token válido o el usuario ya no existe.
export async function getSessionUser(req: NextRequest | Request) {
  const token = tokenFromRequest(req);
  if (!token) return null;
  let payload: jwt.JwtPayload;
  try {
    payload = verifyToken(token);
  } catch {
    return null;
  }
  if (!payload.sub) return null;
  return findUserById(String(payload.sub));
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export async function requireUser(req: NextRequest | Request): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw unauthorized();
  return user;
}

// Equivale a AuthGuard('jwt') + AdminGuard: primero sesión (401), luego rol (403).
export async function requireAdmin(req: NextRequest | Request): Promise<SessionUser> {
  const user = await requireUser(req);
  if (user.role !== 'ADMIN') throw forbidden('Solo administradores pueden acceder a este recurso');
  return user;
}

// Respuesta JSON que además fija la cookie de sesión.
export function withSession<T extends object>(body: T, token: string): NextResponse {
  const res = NextResponse.json(body);
  res.cookies.set(ACCESS_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}

export function clearSession(body: object): NextResponse {
  const res = NextResponse.json(body);
  res.cookies.delete({ name: ACCESS_COOKIE, path: '/' });
  return res;
}
