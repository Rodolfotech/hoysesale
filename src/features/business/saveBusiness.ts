import { businessApi } from '../../api';
import type { User } from '../../types';
import type { BusinessFormPayload } from './BusinessForm';

// Guarda los datos del negocio (imágenes se suben al elegirlas, en el formulario).
export async function saveBusinessEdits(payload: BusinessFormPayload): Promise<Partial<User>> {
  const { data } = await businessApi.updateMe(payload);
  return data;
}
