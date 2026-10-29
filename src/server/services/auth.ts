import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { badRequest, conflict, unauthorized } from '../http';
import { signAccessToken, signResetToken, verifyToken } from '../auth/session';
import { sendPasswordReset } from './mail';
import { createUser, findUserByEmail, findUserById } from './users';
import type { z } from 'zod';
import type { RegisterSchema } from '../validation';

const SALT_ROUNDS = 10;
const GENERIC_RESET_MESSAGE = 'Si el email existe, recibirás un enlace de recuperación';

function frontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:5173';
}

// Redirect de Google: GOOGLE_REDIRECT_URI, o el callback del frontend si no está definido.
function googleRedirectUri(): string {
  return process.env.GOOGLE_REDIRECT_URI || `${frontendUrl()}/auth/google/callback`;
}

async function validateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !user.password) return null;
  return (await bcrypt.compare(password, user.password)) ? user : null;
}

export async function login(email: string, password: string) {
  const user = await validateUser(email, password);
  if (!user) throw unauthorized('Credenciales inválidas');
  return { access_token: signAccessToken(user), user: await findUserById(user.id) };
}

export async function register(data: z.output<typeof RegisterSchema>) {
  if (await findUserByEmail(data.email)) throw conflict('El email ya está registrado');
  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  // El registro público crea organizadores (ver SPEC.md).
  const user = await createUser({ ...data, password: hashed, role: 'ORGANIZER' });
  return { access_token: signAccessToken(user), user };
}

// Respuesta genérica siempre: no revela si el correo existe.
export async function forgotPassword(email: string) {
  const user = await findUserByEmail(email);
  if (user) {
    const resetToken = signResetToken(user.id);
    await sendPasswordReset(email, `${frontendUrl()}/reset-password?token=${resetToken}`);
  }
  return { message: GENERIC_RESET_MESSAGE };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!newPassword || newPassword.length < 8) {
    throw badRequest('La contraseña debe tener al menos 8 caracteres');
  }
  let payload: ReturnType<typeof verifyToken>;
  try {
    payload = verifyToken(token);
  } catch {
    throw badRequest('Token inválido o expirado');
  }
  if (payload.type !== 'reset' || !payload.sub) throw badRequest('Token inválido');

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: String(payload.sub) }, data: { password: hashed } });

  const user = await findUserById(String(payload.sub));
  if (!user) throw badRequest('Usuario no encontrado');
  return { access_token: signAccessToken(user), user };
}

// Verifica si el correo existe. Responde 401 si no, como el endpoint anterior.
export async function checkEmail(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw unauthorized('Email no encontrado');
  return { exists: true };
}

export function googleAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  if (state) params.set('state', state);
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` };
}

export async function googleLogin(code: string) {
  if (!code) throw badRequest('Código de autorización requerido');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: googleRedirectUri(),
    }),
  });
  if (!tokenResponse.ok) {
    throw badRequest(`Error al autenticar con Google: ${await tokenResponse.text()}`);
  }
  const { access_token: accessToken } = (await tokenResponse.json()) as { access_token: string };

  const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
  if (!userResponse.ok) throw badRequest('Error al obtener perfil de Google');
  const profile = (await userResponse.json()) as { email: string; name?: string; picture?: string };

  const existing = await prisma.user.findUnique({ where: { email: profile.email } });
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { avatar: profile.picture || existing.avatar },
      })
    : await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || profile.email.split('@')[0],
          avatar: profile.picture || null,
        },
      });

  return { access_token: signAccessToken(user), user: await findUserById(user.id) };
}

export function instagramAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_CLIENT_ID ?? '',
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI ?? '',
    response_type: 'code',
    scope: 'instagram_business_basic',
  });
  if (state) params.set('state', state);
  return { url: `https://api.instagram.com/oauth/authorize?${params.toString()}` };
}

// Login social con Instagram: si la cuenta no existe, se crea con un correo de marcador (ig-<id>@instagram.auth).
export async function instagramLogin(code: string) {
  if (!code) throw badRequest('Código de autorización requerido');

  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET ?? '';
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID ?? '',
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI ?? '',
      code,
    }),
  });
  if (!tokenResponse.ok) {
    throw badRequest(`Error al autenticar con Instagram: ${await tokenResponse.text()}`);
  }
  const tokenData = (await tokenResponse.json()) as { access_token: string; user_id: number };
  const igUserId = String(tokenData.user_id);

  let finalToken = tokenData.access_token;
  let expiresIn = 5184000;
  const longLived = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`,
  );
  if (longLived.ok) {
    const data = (await longLived.json()) as { access_token: string; expires_in?: number };
    finalToken = data.access_token;
    expiresIn = data.expires_in || 5184000;
  }

  let igProfile: { username?: string } = {};
  try {
    const profileResponse = await fetch(
      `https://graph.instagram.com/${igUserId}?fields=id,username,account_type&access_token=${finalToken}`,
    );
    if (profileResponse.ok) igProfile = await profileResponse.json();
  } catch {
    // El perfil es opcional: sin él el usuario se crea con nombre genérico.
  }

  const tokenFields = {
    socialToken: finalToken,
    tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
  };
  const existing = await prisma.user.findUnique({ where: { instagramId: igUserId } });
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { ...tokenFields, instagramUsername: igProfile.username || existing.instagramUsername },
      })
    : await prisma.user.create({
        data: {
          email: `ig-${igUserId}@instagram.auth`,
          name: igProfile.username || `Instagram ${igUserId.slice(0, 6)}`,
          instagramId: igUserId,
          instagramUsername: igProfile.username || null,
          ...tokenFields,
        },
      });

  return { access_token: signAccessToken(user), user: await findUserById(user.id) };
}
