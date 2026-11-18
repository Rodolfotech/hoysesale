import { prisma } from '../db';
import { forbidden, notFound } from '../http';
import { deleteAccount } from './users';

// Cada acción del panel deja un registro en admin_audit_logs. Un fallo al auditar no bloquea la respuesta.
async function logAudit(adminId: string, action: string, detail?: string, ip?: string) {
  await prisma.adminAuditLog
    .create({ data: { adminId, action, detail: detail || null, ip: ip || null } })
    .catch(() => undefined);
}

export async function listUsers(adminId: string, comuna: string | undefined, ip?: string) {
  const users = await prisma.user.findMany({
    where: comuna ? { comuna } : {},
    omit: { password: true, socialToken: true },
    include: {
      _count: { select: { ownedEvents: true, registrations: true, instagramClicks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  await logAudit(adminId, 'LIST_USERS', comuna ? `comuna: ${comuna}` : 'todos', ip);

  return users.map(({ _count, ...u }) => ({
    ...u,
    eventCount: _count.ownedEvents,
    registrationCount: _count.registrations,
    instagramClickCount: _count.instagramClicks,
  }));
}

export async function getUserDetail(adminId: string, id: string, ip?: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: { password: true, socialToken: true },
    include: {
      _count: {
        select: {
          ownedEvents: true,
          registrations: true,
          instagramClicks: true,
          businessProducts: true,
          businessServices: true,
          businessHighlights: true,
        },
      },
      ownedEvents: {
        select: { id: true, title: true, slug: true, date: true, city: true },
        orderBy: { date: 'desc' },
        take: 10,
      },
      businessProducts: {
        select: { id: true, name: true, price: true, tag: true },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      },
      businessServices: {
        select: { id: true, title: true, tags: true },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      },
      businessHighlights: {
        select: { id: true, title: true },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      },
      registrations: {
        select: {
          id: true,
          event: { select: { id: true, title: true, slug: true, date: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!user) throw notFound('Usuario no encontrado');

  await logAudit(adminId, 'VIEW_USER', `usuario: ${user.name} (${user.email})`, ip);

  const { _count, ...rest } = user;
  return {
    ...rest,
    eventCount: _count.ownedEvents,
    registrationCount: _count.registrations,
    instagramClickCount: _count.instagramClicks,
    productCount: _count.businessProducts,
    serviceCount: _count.businessServices,
    highlightCount: _count.businessHighlights,
  };
}

// Borra una cuenta desde el panel (misma limpieza que el autoborrado). No se puede borrar la propia cuenta.
export async function deleteUserAsAdmin(adminId: string, id: string, ip?: string) {
  if (adminId === id) throw forbidden('No puedes eliminar tu propia cuenta desde el panel');
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true } });
  if (!user) throw notFound('Usuario no encontrado');

  await logAudit(adminId, 'DELETE_USER', `usuario: ${user.name} (${user.email})`, ip);
  await deleteAccount(id);
}

export function trackInstagramClick(userId: string, eventId?: string) {
  return prisma.instagramClick.create({ data: { userId, eventId: eventId || null } });
}

export async function listComunas(adminId: string, ip?: string) {
  const rows = await prisma.user.findMany({
    where: { comuna: { not: null } },
    select: { comuna: true },
    distinct: ['comuna'],
    orderBy: { comuna: 'asc' },
  });
  await logAudit(adminId, 'LIST_COMUNAS', undefined, ip);
  return rows.map((r) => r.comuna).filter(Boolean);
}

export async function getStats(adminId: string, ip?: string) {
  const [totalUsers, totalEvents, totalAttendees, totalClicks] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.attendee.count(),
    prisma.instagramClick.count(),
  ]);
  await logAudit(adminId, 'VIEW_STATS', undefined, ip);
  return { totalUsers, totalEvents, totalAttendees, totalInstagramClicks: totalClicks };
}
