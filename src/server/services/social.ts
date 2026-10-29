import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from '../db';
import { badRequest, unauthorized } from '../http';

// Integración con Meta (Instagram Login). Ver CLAUDE.md: vinculación + sincronización de publicaciones.
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

type FeedPost = {
  id: string;
  platform: 'instagram';
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  permalink: string | null;
  timestamp: string;
  media_type: string | null;
};

function igClientId(): string {
  return process.env.INSTAGRAM_CLIENT_ID ?? '';
}
function igClientSecret(): string {
  return process.env.INSTAGRAM_CLIENT_SECRET ?? '';
}
function igRedirectUri(): string {
  return process.env.INSTAGRAM_REDIRECT_URI || `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/social/callback`;
}

function checkInstagramConfig() {
  if (!igClientId() || !igClientSecret() || !igRedirectUri()) {
    throw badRequest(
      'Instagram no está configurado. Falta INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET o INSTAGRAM_REDIRECT_URI en las variables de entorno.',
    );
  }
}

function toFeedPost(post: Record<string, unknown>): FeedPost {
  return {
    id: String(post.id),
    platform: 'instagram',
    media_url: (post.media_url as string) || null,
    thumbnail_url: (post.thumbnail_url as string) || null,
    caption: (post.caption as string) || null,
    permalink: (post.permalink as string) || null,
    timestamp: String(post.timestamp),
    media_type: (post.media_type as string) || null,
  };
}

export function instagramAuthUrl() {
  checkInstagramConfig();
  const params = new URLSearchParams({
    client_id: igClientId(),
    redirect_uri: igRedirectUri(),
    response_type: 'code',
    scope: 'instagram_business_basic',
  });
  return { url: `https://api.instagram.com/oauth/authorize?${params.toString()}` };
}

// Vincula una cuenta de Instagram a un usuario ya autenticado y sincroniza sus publicaciones.
export async function instagramCallback(userId: string, code: string) {
  checkInstagramConfig();
  if (!code) throw badRequest('Código de autorización requerido');

  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: igClientId(),
      client_secret: igClientSecret(),
      grant_type: 'authorization_code',
      redirect_uri: igRedirectUri(),
      code,
    }),
  });
  if (!tokenResponse.ok) throw badRequest(`Error al intercambiar código: ${await tokenResponse.text()}`);

  const tokenData = (await tokenResponse.json()) as { access_token: string; user_id: number };
  const shortLivedToken = tokenData.access_token;
  const igUserId = String(tokenData.user_id);

  let finalToken = shortLivedToken;
  let expiresIn = 3600;
  const longLived = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${igClientSecret()}&access_token=${shortLivedToken}`,
  );
  if (longLived.ok) {
    const data = (await longLived.json()) as { access_token: string; expires_in?: number };
    finalToken = data.access_token;
    expiresIn = data.expires_in || 5184000;
  } else {
    console.error(`Error al obtener long-lived token: ${longLived.status} ${await longLived.text().catch(() => '')}`);
  }

  let igUsername: string | null = null;
  let igAvatar: string | null = null;
  const profile = await fetch(
    `https://graph.instagram.com/${igUserId}?fields=id,username,profile_picture&access_token=${finalToken}`,
  );
  if (profile.ok) {
    const data = (await profile.json()) as { username?: string; profile_picture?: string };
    igUsername = data.username || null;
    igAvatar = data.profile_picture || null;
  }

  // Una cuenta de Instagram solo puede estar vinculada a un usuario: se desvincula de los demás primero.
  await prisma.user.updateMany({
    where: { instagramId: igUserId, NOT: { id: userId } },
    data: { instagramId: null, socialToken: null, tokenExpiresAt: null, instagramUsername: null, instagramAvatar: null },
  });
  await prisma.user.update({
    where: { id: userId },
    data: {
      instagramId: igUserId,
      socialToken: finalToken,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      instagramUsername: igUsername,
      instagramAvatar: igAvatar,
    },
  });

  await syncAllUserEvents(userId);
  return prisma.user.findUnique({ where: { id: userId }, omit: { password: true } });
}

export async function connectInstagram(userId: string, accessToken: string) {
  checkInstagramConfig();
  const response = await fetch(`https://graph.instagram.com/me?fields=id,username,profile_picture&access_token=${accessToken}`);
  if (!response.ok) throw badRequest('Token de Instagram inválido o expirado');
  const data = (await response.json()) as { id?: string; username?: string; profile_picture?: string };
  if (!data.id) throw badRequest('No se pudo obtener el ID de Instagram');

  return prisma.user.update({
    where: { id: userId },
    data: {
      instagramId: data.id,
      socialToken: accessToken,
      tokenExpiresAt: new Date(Date.now() + 60 * DAY_MS),
      instagramUsername: data.username || null,
      instagramAvatar: data.profile_picture || null,
    },
    omit: { password: true },
  });
}

export async function connectFacebook(userId: string, accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`);
  if (!response.ok) throw badRequest('Token de Facebook inválido o expirado');
  const data = (await response.json()) as { id?: string };
  if (!data.id) throw badRequest('No se pudo obtener el ID de Facebook');

  return prisma.user.update({
    where: { id: userId },
    data: { facebookId: data.id, socialToken: accessToken, tokenExpiresAt: new Date(Date.now() + 60 * DAY_MS) },
    omit: { password: true },
  });
}

export function disconnect(userId: string, platform: string) {
  const clear = { socialToken: null, tokenExpiresAt: null };
  const data = platform === 'instagram' ? { instagramId: null, ...clear } : { facebookId: null, ...clear };
  return prisma.user.update({ where: { id: userId }, data, omit: { password: true } });
}

export async function getStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { facebookId: true, instagramId: true, instagramUsername: true, instagramAvatar: true },
  });
  return {
    facebook: !!user?.facebookId,
    instagram: !!user?.instagramId,
    instagramUsername: user?.instagramUsername || null,
    instagramAvatar: user?.instagramAvatar || null,
  };
}

// Verificación del webhook de Meta. Sin INSTAGRAM_WEBHOOK_TOKEN el webhook queda cerrado.
export function verifyWebhook(mode: string | null, challenge: string | null, verifyToken: string | null): string {
  const expected = process.env.INSTAGRAM_WEBHOOK_TOKEN;
  if (expected && mode === 'subscribe' && verifyToken === expected && challenge) return challenge;
  throw badRequest('Token de verificación inválido');
}

export async function handleWebhook(body: {
  entry?: { id?: string; changes?: { field?: string }[] }[];
}) {
  const entry = body?.entry?.[0];
  for (const change of entry?.changes ?? []) {
    if (change.field !== 'media' || !entry?.id) continue;
    const user = await prisma.user.findUnique({ where: { instagramId: String(entry.id) }, select: { id: true } });
    if (user) await syncAllUserEvents(user.id);
  }
}

export async function refreshToken(userId: string) {
  checkInstagramConfig();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { socialToken: true } });
  if (!user?.socialToken) throw badRequest('No hay token para refrescar');

  const response = await fetch(
    'https://graph.instagram.com/refresh_access_token?' +
      new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: user.socialToken }),
  );
  if (!response.ok) throw badRequest('Error al refrescar token de Instagram');

  const data = (await response.json()) as { access_token: string; expires_in?: number };
  return prisma.user.update({
    where: { id: userId },
    data: {
      socialToken: data.access_token,
      tokenExpiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000),
    },
    omit: { password: true },
  });
}

async function syncAllUserEvents(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { instagramId: true, socialToken: true } });
  if (!user?.instagramId || !user?.socialToken) return;

  const events = await prisma.event.findMany({ where: { ownerId: userId }, select: { id: true } });
  for (const event of events) {
    try {
      await fetchAndSaveFeed(userId, event.id);
    } catch {
      // Un evento que falla no detiene la sincronización de los demás.
    }
  }
}

async function fetchAndSaveFeed(userId: string, eventId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { instagramId: true, socialToken: true } });
  if (!user?.instagramId || !user?.socialToken) return;

  const response = await fetch(
    `https://graph.instagram.com/${user.instagramId}/media?fields=id,media_url,thumbnail_url,caption,permalink,timestamp,media_type&access_token=${user.socialToken}&limit=25`,
  );
  if (!response.ok) return;
  const data = (await response.json()) as { data?: Record<string, unknown>[] };

  await prisma.event.update({
    where: { id: eventId },
    data: { socialFeed: (data.data ?? []).map(toFeedPost), lastSync: new Date() },
  });
}

export async function getUserMedia(userId: string): Promise<FeedPost[]> {
  checkInstagramConfig();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { instagramId: true, socialToken: true, tokenExpiresAt: true },
  });
  if (!user?.instagramId || !user?.socialToken) throw badRequest('Instagram no está conectado');

  // Renueva el token si vence en menos de una hora; si la renovación falla, se usa el actual.
  let token = user.socialToken;
  if (user.tokenExpiresAt && user.tokenExpiresAt.getTime() - Date.now() < HOUR_MS) {
    try {
      token = (await refreshToken(userId)).socialToken || token;
    } catch {
      // Se intenta con el token existente.
    }
  }

  const fields = 'id,media_url,caption,permalink,timestamp,media_type,thumbnail_url';
  let response = await fetch(`https://graph.instagram.com/${user.instagramId}/media?fields=${fields}&access_token=${token}&limit=50`);
  if (!response.ok) {
    // Respaldo: me/media, por si el id guardado no coincide con el formato de la API.
    response = await fetch(`https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}&limit=50`);
  }
  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    if (errBody.includes('IGApiException') || errBody.includes('does not exist')) {
      throw badRequest(
        'Error de permisos de Instagram. Asegúrate de que en Meta Developers la app tenga el producto "Instagram" agregado (no "Instagram Basic Display") y que la cuenta esté configurada como Business o Creator.',
      );
    }
    throw badRequest(`Error al obtener publicaciones: ${response.status} ${errBody}`);
  }

  const data = (await response.json()) as { data?: Record<string, unknown>[] };
  return (data.data ?? []).map(toFeedPost);
}

export async function getValidation(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { instagramId: true, socialToken: true, createdAt: true },
  });
  if (!user?.instagramId || !user?.socialToken) throw badRequest('Instagram no está conectado');

  const profileResponse = await fetch(
    `https://graph.instagram.com/${user.instagramId}?fields=id,username,account_type,media_count&access_token=${user.socialToken}`,
  );
  if (!profileResponse.ok) throw badRequest('Error al obtener perfil de Instagram');
  const profile = (await profileResponse.json()) as { account_type?: string; media_count?: number };
  const accountType = profile.account_type || 'PERSONAL';
  const mediaCount = profile.media_count || 0;

  const oldestResponse = await fetch(
    `https://graph.instagram.com/${user.instagramId}/media?fields=id,timestamp&access_token=${user.socialToken}&limit=1`,
  );
  let oldestPostDate: string | null = null;
  if (oldestResponse.ok) {
    const oldest = (await oldestResponse.json()) as { data?: { timestamp: string }[] };
    if (oldest.data && oldest.data.length > 0) oldestPostDate = oldest.data[oldest.data.length - 1].timestamp;
  }

  const connectedAt = user.createdAt.toISOString();
  const ageMs = Date.now() - new Date(oldestPostDate ?? connectedAt).getTime();
  const accountAgeDays = Math.floor(ageMs / DAY_MS);

  return {
    accountType,
    mediaCount,
    connectedAt,
    oldestPostDate,
    accountAgeDays,
    isProfessional: accountType === 'BUSINESS' || accountType === 'CREATOR',
    hasActivity: mediaCount > 0,
    hasMinAge: accountAgeDays >= 180,
    hasMinPosts: mediaCount >= 5,
    level: calculateLevel(accountType, accountAgeDays, mediaCount),
  };
}

function calculateLevel(accountType: string, ageDays: number, mediaCount: number): number {
  let score = 0;
  if (accountType === 'BUSINESS' || accountType === 'CREATOR') score += 3;
  if (ageDays >= 180) score += 2;
  else if (ageDays >= 30) score += 1;
  if (mediaCount >= 20) score += 3;
  else if (mediaCount >= 5) score += 1;
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  return 1;
}

// Solicitud de eliminación de datos de Meta: firma HMAC-SHA256 con el secreto de la app.
export async function handleDeletionCallback(signedRequest: string) {
  if (!signedRequest) throw badRequest('signed_request requerido');
  const parts = signedRequest.split('.');
  if (parts.length !== 2) throw badRequest('signed_request inválido');
  const [encodedSig, encodedPayload] = parts;

  const payload = Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const parsed = JSON.parse(payload) as { algorithm?: string; user_id?: string | number };
  if (parsed.algorithm?.toUpperCase() !== 'HMAC-SHA256') throw badRequest('Algoritmo no soportado');

  const expected = createHmac('sha256', igClientSecret())
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const a = Buffer.from(expected);
  const b = Buffer.from(encodedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw badRequest('Firma inválida');

  await prisma.user.updateMany({
    where: { instagramId: String(parsed.user_id) },
    data: { instagramId: null, socialToken: null, tokenExpiresAt: null, instagramUsername: null, instagramAvatar: null },
  });

  return {
    url: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/eliminacion-datos`,
    confirmation_code: randomBytes(8).toString('hex').toUpperCase(),
  };
}

export async function syncFeed(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { ownerId: true } });
  if (!event) throw badRequest('Evento no encontrado');
  if (event.ownerId !== userId) throw unauthorized('No eres el dueño de este evento');

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { instagramId: true, socialToken: true } });
  if (!user?.instagramId || !user?.socialToken) throw badRequest('Instagram no está conectado');

  return fetchAndSaveFeed(userId, eventId);
}

function urlPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

async function ownerToken(ownerId: string, cache: Map<string, string>): Promise<string | null> {
  const cached = cache.get(ownerId);
  if (cached) return cached;

  const user = await prisma.user.findUnique({ where: { id: ownerId }, select: { socialToken: true, tokenExpiresAt: true } });
  if (!user?.socialToken) return null;

  let token = user.socialToken;
  if (user.tokenExpiresAt && user.tokenExpiresAt.getTime() - Date.now() < DAY_MS) {
    try {
      token = (await refreshToken(ownerId)).socialToken ?? token;
    } catch {
      // Se usa el token que queda.
    }
  }
  cache.set(ownerId, token);
  return token;
}

// Cron diario: actualiza las URL de imagen de eventos cuyo enlace de Instagram caducó.
export async function refreshEventImages(): Promise<{ updated: number; skipped: number }> {
  const events = await prisma.event.findMany({
    where: { imageUrl: { contains: 'cdninstagram.com' } },
    select: { id: true, instagramMediaId: true, ownerId: true, imageUrl: true },
  });

  const tokens = new Map<string, string>();
  const feeds = new Map<string, { id: string; media_url: string }[]>();
  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    if (!event.imageUrl) {
      skipped++;
      continue;
    }
    const token = await ownerToken(event.ownerId, tokens);
    if (!token) {
      skipped++;
      continue;
    }

    // Caso 1: el evento guarda el id de la publicación → se pide la URL fresca directamente.
    if (event.instagramMediaId) {
      try {
        const res = await fetch(`https://graph.instagram.com/${event.instagramMediaId}?fields=id,media_url&access_token=${token}`);
        const media = res.ok ? ((await res.json()) as { media_url?: string }) : null;
        if (!media?.media_url) {
          skipped++;
          continue;
        }
        await prisma.event.update({ where: { id: event.id }, data: { imageUrl: media.media_url } });
        updated++;
      } catch {
        skipped++;
      }
      continue;
    }

    // Caso 2: sin id → se busca por ruta de la URL en el feed del dueño.
    if (!feeds.has(event.ownerId)) {
      try {
        const user = await prisma.user.findUnique({ where: { id: event.ownerId }, select: { instagramId: true } });
        const res = await fetch(`https://graph.instagram.com/${user?.instagramId}/media?fields=id,media_url&access_token=${token}&limit=50`);
        if (res.ok) {
          const data = (await res.json()) as { data?: { id: string; media_url?: string }[] };
          feeds.set(event.ownerId, (data.data ?? []).map((p) => ({ id: p.id, media_url: p.media_url ?? '' })));
        }
      } catch {
        // Sin feed no hay coincidencias para este dueño.
      }
    }

    const storedPath = urlPath(event.imageUrl);
    const match = (feeds.get(event.ownerId) ?? []).find((m) => m.media_url && urlPath(m.media_url) === storedPath);
    if (match?.media_url) {
      await prisma.event.update({
        where: { id: event.id },
        data: { imageUrl: match.media_url, instagramMediaId: match.id },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  return { updated, skipped };
}

// Compara el secreto del cron en tiempo constante. Sin CRON_SECRET, el endpoint queda cerrado.
export function assertCronSecret(header: string | null): void {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw unauthorized('No autorizado');
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header ?? '');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw unauthorized('No autorizado');
  }
}
