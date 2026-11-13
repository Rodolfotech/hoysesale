import { route } from '@/server/http';
import { homeSections } from '@/server/services/home';

// Pública: secciones del inicio (Hoy se sale, Experiencias y Novedades). Solo datos que ya muestran los micro-sitios.
export const GET = route(async () => homeSections());
