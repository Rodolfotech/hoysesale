import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { ZodError, z } from 'zod';
import { rateLimit, clientIp } from './rate-limit';

// Error con código HTTP. Las respuestas de error tienen la forma { statusCode, message }, igual que el backend anterior.
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const unauthorized = (message = 'No autenticado') => new HttpError(401, message);
export const forbidden = (message: string) => new HttpError(403, message);
export const notFound = (message: string) => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);

// Límite global por IP: 300 peticiones por minuto en toda la API (igual que el ThrottlerGuard anterior).
const GLOBAL_LIMIT = 300;
const GLOBAL_WINDOW_MS = 60_000;

type RouteContext<P> = { params: Promise<P> };
type RouteResult = Response | unknown;

// Envuelve un handler de ruta: aplica el límite global, convierte errores en JSON y deja pasar las Response tal cual.
export function route<P = Record<string, string>>(
  handler: (req: NextRequest, ctx: RouteContext<P>) => Promise<RouteResult>,
) {
  return async (req: NextRequest, ctx: RouteContext<P>) => {
    try {
      // En desarrollo todas las peticiones salen de la misma IP: el límite global solo estorbaría al probar.
      if (process.env.NODE_ENV !== 'development') {
        rateLimit(`global:${clientIp(req)}`, GLOBAL_LIMIT, GLOBAL_WINDOW_MS);
      }
      const result = await handler(req, ctx);
      if (result instanceof Response) return result;
      if (result === undefined) return new Response(null, { status: 200 });
      return NextResponse.json(result);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ statusCode: error.status, message: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? 'Datos no válidos';
    return NextResponse.json({ statusCode: 400, message }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return NextResponse.json({ statusCode: 404, message: 'Registro no encontrado' }, { status: 404 });
    if (error.code === 'P2002') return NextResponse.json({ statusCode: 409, message: 'Ya existe un registro con ese valor único' }, { status: 409 });
  }
  console.error('[api] error no controlado:', error);
  return NextResponse.json({ statusCode: 500, message: 'Error interno del servidor' }, { status: 500 });
}

// Valida un valor con un esquema zod y devuelve los datos ya limpios (campos desconocidos eliminados).
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw badRequest(result.error.issues[0]?.message ?? 'Datos no válidos');
  return result.data;
}

export async function readBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.output<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest('El cuerpo debe ser JSON válido');
  }
  return parse(schema, raw);
}

export async function readFile(req: Request, field = 'file'): Promise<File> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw badRequest('Se esperaba un formulario multipart');
  }
  const file = form.get(field);
  if (!(file instanceof File)) throw badRequest('Falta el archivo (campo "file")');
  return file;
}

export function parseIntOr(value: string | null, fallback: number | undefined): number | undefined {
  if (value === null) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}
