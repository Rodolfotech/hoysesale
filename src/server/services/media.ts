import { randomUUID } from 'crypto';
import { prisma } from '../db';
import { badRequest, forbidden, notFound } from '../http';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, getMediaStorage } from '../storage';
import type { Requester } from './events';
import type { z } from 'zod';
import type { LinkMediaSchema } from '../validation';

export function listEventMedia(eventId: string) {
  return prisma.eventMedia.findMany({ where: { eventId }, orderBy: { createdAt: 'desc' } });
}

// Solo el dueño del evento o un ADMIN escribe medios.
async function assertCanManageEvent(eventId: string, requester: Requester) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { ownerId: true } });
  if (!event) throw notFound('Evento no encontrado');
  if (event.ownerId !== requester.id && requester.role !== 'ADMIN') {
    throw forbidden('No puedes modificar los medios de este evento');
  }
}

function checkImage(file: File): string {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) throw badRequest('Formato no permitido (usa jpeg, png o webp)');
  if (file.size > MAX_IMAGE_BYTES) throw badRequest('La imagen supera el máximo de 4 MB');
  return ext;
}

// Ruta por usuario y evento: <userId>/<eventId>/<uuid>.<ext>
export async function uploadEventImage(eventId: string, requester: Requester, file: File) {
  await assertCanManageEvent(eventId, requester);
  const ext = checkImage(file);
  const storagePath = `${requester.id}/${eventId}/${randomUUID()}.${ext}`;
  const imageUrl = await getMediaStorage().upload(storagePath, Buffer.from(await file.arrayBuffer()), file.type);
  return prisma.eventMedia.create({
    data: { eventId, source: 'UPLOAD', storagePath, imageUrl },
  });
}

// Subida temporal de la imagen de una publicación (antes de crear el evento). Devuelve la URL.
export async function uploadTempImage(userId: string, file: File): Promise<{ url: string }> {
  const ext = checkImage(file);
  const url = await getMediaStorage().upload(
    `${userId}/tmp/${randomUUID()}.${ext}`,
    Buffer.from(await file.arrayBuffer()),
    file.type,
  );
  return { url };
}

export async function addMediaLink(eventId: string, requester: Requester, dto: z.output<typeof LinkMediaSchema>) {
  await assertCanManageEvent(eventId, requester);
  return prisma.eventMedia.create({
    data: {
      eventId,
      source: 'LINK',
      permalink: dto.permalink,
      imageUrl: dto.imageUrl ?? null,
      caption: dto.caption ?? null,
    },
  });
}

export async function removeMedia(mediaId: string, requester: Requester) {
  const media = await prisma.eventMedia.findUnique({
    where: { id: mediaId },
    include: { event: { select: { ownerId: true } } },
  });
  if (!media) throw notFound('Medio no encontrado');
  if (media.event.ownerId !== requester.id && requester.role !== 'ADMIN') {
    throw forbidden('No puedes borrar este medio');
  }
  await prisma.eventMedia.delete({ where: { id: mediaId } });
  // El archivo se borra después de la fila: si falla, solo queda basura en Storage.
  if (media.storagePath) await getMediaStorage().remove(media.storagePath);
}
