import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { MediaStorage } from './index';

// Cliente de Supabase solo para el servidor (service_role). Se crea de forma perezosa: si faltan las variables,
// solo fallan las rutas que suben archivos.
let client: SupabaseClient | undefined;

function supabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase no está configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

function bucket(): ReturnType<SupabaseClient['storage']['from']> {
  return supabase().storage.from(process.env.SUPABASE_BUCKET ?? 'SupabaseImage_Storage');
}

export const supabaseMediaStorage: MediaStorage = {
  async upload(path, buffer, contentType) {
    const storage = bucket();
    const { error } = await storage.upload(path, buffer, { contentType, upsert: false });
    if (error) {
      console.error(`Error al subir imagen a Supabase: ${error.message}`);
      throw new Error('No se pudo subir la imagen');
    }
    return storage.getPublicUrl(path).data.publicUrl;
  },

  async remove(path) {
    const { error } = await bucket().remove([path]);
    if (error) console.warn(`No se pudo borrar ${path} de Storage: ${error.message}`);
  },

  async removePrefix(prefix) {
    const storage = bucket();
    const files: string[] = [];
    // Supabase lista una carpeta por llamada: se recorre recursivamente.
    const walk = async (folder: string) => {
      const { data, error } = await storage.list(folder, { limit: 1000 });
      if (error || !data) return;
      for (const item of data) {
        const path = `${folder}/${item.name}`;
        if (item.id) files.push(path);
        else await walk(path);
      }
    };
    await walk(prefix);
    if (files.length > 0) {
      const { error } = await storage.remove(files);
      if (error) console.warn(`No se pudieron borrar archivos de ${prefix}: ${error.message}`);
    }
  },
};
