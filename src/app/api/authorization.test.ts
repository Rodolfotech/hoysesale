// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Base de datos simulada: cada prueba decide qué devuelve.
const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
  businessProduct: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  businessService: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  businessHighlight: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  event: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  attendee: { findMany: vi.fn() },
  eventMedia: { findUnique: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/server/db', () => ({ prisma: db }));

process.env.JWT_SECRET = 'secreto-solo-para-pruebas';

import { signAccessToken, signResetToken } from '@/server/auth/session';

type Handler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;
type RouteModule = Record<string, Handler>;

const modules = import.meta.glob<RouteModule>('./**/route.ts', { eager: true });
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// Lo único que funciona sin sesión. Una ruta nueva queda protegida por defecto: si no está aquí, debe responder 401.
const PUBLIC = new Set([
  'GET businesses', 'GET businesses/[slug]', 'GET businesses/check-slug', 'GET categories',
  'GET events', 'GET events/[id]', 'GET events/[id]/media', 'POST events/[id]/interactions', 'GET health',
  'POST auth/check-email', 'POST auth/forgot-password', 'POST auth/google', 'GET auth/google/url',
  'POST auth/instagram', 'GET auth/instagram/url', 'POST auth/login', 'POST auth/logout',
  'POST auth/register', 'POST auth/reset-password',
  'GET social/instagram/auth-url', 'POST social/instagram/deletion',
  'GET social/instagram/webhook', 'POST social/instagram/webhook',
  'GET social/refresh-images', // protegida por CRON_SECRET, se prueba aparte
]);

const routes = Object.entries(modules).flatMap(([file, mod]) => {
  const path = file.replace('./', '').replace('/route.ts', '');
  return METHODS.filter((method) => mod[method]).map((method) => ({ method, path, handler: mod[method] }));
});

const call = (handler: Handler, method: string, { params = {}, token, body }: { params?: Record<string, string>; token?: string; body?: unknown } = {}) =>
  handler(
    new NextRequest('http://localhost/api/prueba', {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      ...(method === 'GET' || method === 'DELETE' ? {} : { body: JSON.stringify(body ?? {}) }),
    }),
    { params: Promise.resolve(params) },
  );

const handlerOf = (path: string, method: string) => {
  const found = routes.find((route) => route.path === path && route.method === method);
  if (!found) throw new Error(`Ruta no encontrada: ${method} ${path}`);
  return found.handler;
};

const member = { id: 'usuario-a', email: 'a@example.com', role: 'USER' };
const memberToken = signAccessToken(member);

beforeEach(() => {
  vi.clearAllMocks();
  db.user.findUnique.mockResolvedValue(member);
});

describe('rutas protegidas', () => {
  it('encuentra las rutas de la API', () => {
    expect(routes.length).toBeGreaterThan(60);
  });

  it('toda ruta pública declarada existe', () => {
    const existing = new Set(routes.map((route) => `${route.method} ${route.path}`));
    expect([...PUBLIC].filter((route) => !existing.has(route))).toEqual([]);
  });

  it.each(routes.filter((route) => !PUBLIC.has(`${route.method} ${route.path}`)).map((route) => [`${route.method} ${route.path}`, route] as const))(
    '%s responde 401 sin sesión',
    async (_name, route) => {
      const response = await call(route.handler, route.method, { params: { id: 'x', eventId: 'x', userId: 'x', type: 'products', kind: 'logo', platform: 'instagram', slug: 'x' } });
      expect(response.status).toBe(401);
    },
  );

  it('rechaza un token inválido', async () => {
    const response = await call(handlerOf('auth/me', 'GET'), 'GET', { token: 'token-falso' });
    expect(response.status).toBe(401);
  });

  it('un token de recuperación de contraseña no sirve como sesión', async () => {
    const response = await call(handlerOf('auth/me', 'GET'), 'GET', { token: signResetToken(member.id) });
    expect(response.status).toBe(401);
  });

  it('el cron exige su secreto', async () => {
    process.env.CRON_SECRET = 'secreto-cron';
    const response = await call(handlerOf('social/refresh-images', 'GET'), 'GET', { token: 'otro-valor' });
    expect(response.status).toBe(401);
  });
});

describe('panel de administración', () => {
  it.each(['control-panel-7f3a/users', 'control-panel-7f3a/stats', 'control-panel-7f3a/comunas'])('%s responde 403 a un usuario normal', async (path) => {
    const response = await call(handlerOf(path, 'GET'), 'GET', { token: memberToken });
    expect(response.status).toBe(403);
  });
});

describe('datos de otro usuario', () => {
  it.each([['products', 'businessProduct'], ['services', 'businessService']] as const)('no permite modificar %s ajenos', async (type, model) => {
    db[model].findUnique.mockResolvedValue({ ownerId: 'usuario-b' });
    const params = { type, id: 'item-1' };
    const update = await call(handlerOf('businesses/me/[type]/[id]', 'PUT'), 'PUT', { token: memberToken, params, body: { name: 'x', title: 'x' } });
    const remove = await call(handlerOf('businesses/me/[type]/[id]', 'DELETE'), 'DELETE', { token: memberToken, params });
    expect(update.status).toBe(400);
    expect(remove.status).toBe(400);
    expect(db[model].update).not.toHaveBeenCalled();
    expect(db[model].delete).not.toHaveBeenCalled();
  });

  it('no permite modificar ni borrar un evento ajeno', async () => {
    db.event.findUnique.mockResolvedValue({ id: 'evento-1', ownerId: 'usuario-b' });
    const params = { id: 'evento-1' };
    const update = await call(handlerOf('events/[id]', 'PUT'), 'PUT', { token: memberToken, params, body: { title: 'x' } });
    const remove = await call(handlerOf('events/[id]', 'DELETE'), 'DELETE', { token: memberToken, params });
    expect(update.status).toBe(403);
    expect(remove.status).toBe(403);
    expect(db.event.update).not.toHaveBeenCalled();
    expect(db.event.delete).not.toHaveBeenCalled();
  });

  it('no muestra los asistentes de un evento ajeno', async () => {
    db.event.findUnique.mockResolvedValue({ ownerId: 'usuario-b' });
    const response = await call(handlerOf('attendees/event/[eventId]', 'GET'), 'GET', { token: memberToken, params: { eventId: 'evento-1' } });
    expect(response.status).toBe(403);
    expect(db.attendee.findMany).not.toHaveBeenCalled();
  });

  it('muestra los asistentes al dueño del evento', async () => {
    db.event.findUnique.mockResolvedValue({ ownerId: member.id });
    db.attendee.findMany.mockResolvedValue([]);
    const response = await call(handlerOf('attendees/event/[eventId]', 'GET'), 'GET', { token: memberToken, params: { eventId: 'evento-1' } });
    expect(response.status).toBe(200);
  });

  it('no acepta fotos ajenas al reordenar', async () => {
    db.user.findUnique.mockImplementation(({ select }: { select?: { aboutImages?: boolean } }) =>
      Promise.resolve(select?.aboutImages ? { aboutImages: ['mia.webp'] } : member));
    const response = await call(handlerOf('businesses/me/about-images', 'PUT'), 'PUT', { token: memberToken, body: { images: ['ajena.webp'] } });
    expect(response.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
  });
});
