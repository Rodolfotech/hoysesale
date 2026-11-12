'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { socialApi, usersApi } from '../api';
import { InstagramLinkModal } from '../features/social/InstagramLinkModal';
import { SocialPostCard } from '../features/social/SocialPostCard';
import { Toast } from '../components/ui/Toast';
import { PROFILE_LABEL_STYLE, ProfileField } from '../components/ui/ProfileField';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  Camera,
  SquarePen,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Link,
  Unlink,
  RefreshCw,
  Search,
} from 'lucide-react';
import { COMUNAS } from '../constants/comunas';
import { splitAddress } from '../features/business/BusinessForm';
import { BUSINESS_CATEGORY_GROUPS, isBusinessCategory } from '../constants/business';
import { GIRO_SELECT_GROUPS, isGiroOption } from '../constants/giros';
import { InstagramInput, instagramHandleFrom, instagramValueFrom } from '../components/ui/InstagramInput';
import type { SocialPost } from '../types';
import { apiErrorMessage } from '@/lib/api-error';
import { companyRutError, formatRut, formatRutInput, isValidRut } from '@/lib/rut';
import { CompleteProfileModal, requiredProfileItems } from '../features/profile/CompleteProfileModal';

// Texto del popover de cada campo obligatorio del perfil.
// Móvil chileno: +569 y 8 dígitos que no empiezan con 1 ni 2 (igual que el servidor).
const PHONE_PATTERN = /^\+569[3-9]\d{7}$/;
const validPhone = (value: string | null | undefined) => (value && PHONE_PATTERN.test(value) ? value : '');

const REQUIRED_INFO: Record<string, string> = {
  'Nombre de empresa': 'El nombre de la empresa es obligatorio.',
  'Instagram empresa': 'El Instagram de la empresa es obligatorio.',
  'Rut de empresa': 'El RUT de la empresa es obligatorio. Debe ser de persona jurídica (desde 50.000.000), por ejemplo 76.086.428-5.',
  'Giro de empresa': 'El giro de la empresa es obligatorio. Elige la actividad registrada en el SII; el número entre paréntesis es su código.',
  'Teléfono empresa': 'El teléfono de la empresa es obligatorio. Empieza con +569: ingresa los 8 dígitos restantes.',
  'Correo electrónico empresa': 'El correo electrónico de la empresa es obligatorio.',
  'Calle': 'La calle de la dirección de la empresa es obligatoria.',
  'Número': 'El número de la dirección de la empresa es obligatorio.',
  'Categoría': 'Elige el rubro o categoría que mejor describe a tu empresa. Es obligatorio.',
  'Ciudad': 'La ciudad de la empresa es obligatoria.',
  'Comuna': 'La comuna de la empresa es obligatoria. Solo podrás publicar eventos de esta comuna.',
  'Nombre de administrador': 'El nombre del administrador es obligatorio.',
  'Apellidos de administrador': 'Los apellidos del administrador son obligatorios.',
  'Rut administrador': 'El RUT del administrador es obligatorio.',
  'Teléfono administrador': 'El teléfono del administrador es obligatorio. Empieza con +569: ingresa los 8 dígitos restantes.',
  'Correo electrónico administrador': 'El correo electrónico del administrador es obligatorio.',
};


const CIUDADES = ['Villarrica', 'Pucón', 'Temuco', 'Loncoche', 'Freire', 'Cunco', 'Curarrehue', 'Lautaro', 'Pitrufquén', 'Gorbea'] as const;

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editing, setEditing] = useState(false);
  // Aviso de datos obligatorios: aparece al entrar mientras falten datos (cuenta nueva, por formulario o Google).
  const [requiredNoticeClosed, setRequiredNoticeClosed] = useState(false);
  const requiredItems = user ? requiredProfileItems(user) : [];

  // Abre la edición y lleva el foco al campo elegido en el aviso.
  const goToField = (fieldId: string) => {
    setRequiredNoticeClosed(true);
    setEditing(true);
    setTimeout(() => {
      const field = document.getElementById(fieldId);
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field?.focus({ preventScroll: true });
    }, 50);
  };
  const [saving, setSaving] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState<SocialPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postFilter, setPostFilter] = useState('');

  const [form, setForm] = useState({
    name: '',
    companyInstagram: '', // solo el usuario, sin @
    website: '',
    companyRut: '',
    companyGiro: '',
    companyPhone: '',
    email: '',
    companyStreet: '',
    companyNumber: '',
    category: '',
    city: '',
    comuna: '',
    adminFirstName: '',
    adminLastName: '',
    adminRut: '',
    adminPhone: '',
  });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- copia los datos de la sesión al formulario editable
      setForm({
        name: user.name || '',
        companyInstagram: instagramHandleFrom(user.companyInstagram),
        website: user.website || '',
        companyRut: formatRut(user.companyRut || ''),
        companyGiro: isGiroOption(user.companyGiro) ? user.companyGiro! : '', // un giro escrito a mano obliga a elegir de nuevo
        companyPhone: validPhone(user.companyPhone), // un teléfono con otro formato obliga a ingresarlo de nuevo
        email: user.email || '',
        companyStreet: splitAddress(user.companyAddress)[0],
        companyNumber: splitAddress(user.companyAddress)[1],
        category: isBusinessCategory(user.category) ? user.category : '', // una categoría antigua obliga a elegir de nuevo
        city: user.city || '',
        comuna: user.comuna || '',
        adminFirstName: user.adminFirstName || '',
        adminLastName: user.adminLastName || '',
        adminRut: formatRut(user.adminRut || ''),
        adminPhone: validPhone(user.adminPhone),
      });
    }
  }, [user]);

  const updateInstagramStatus = useCallback(({ data }: { data: { instagram: boolean } }) => {
    setInstagramConnected(data.instagram);
  }, []);

  const handleLinkSuccess = useCallback(() => {
    setToast({ message: 'Vinculación con Instagram correcta', type: 'success' });
    socialApi.getStatus().then(updateInstagramStatus).catch(() => undefined);
  }, [updateInstagramStatus]);

  const handleLinkError = useCallback((msg: string) => {
    setToast({ message: msg, type: 'error' });
  }, []);

  const handleDisconnect = async () => {
    try {
      await socialApi.disconnect('instagram');
      setInstagramConnected(false);
      setToast({ message: 'Instagram desvinculado correctamente', type: 'success' });
    } catch {
      setToast({ message: 'Error al desvincular Instagram', type: 'error' });
    }
  };

  useEffect(() => {
    socialApi.getStatus().then(updateInstagramStatus).catch(() => undefined);
  }, [updateInstagramStatus]);

  const loadPosts = useCallback(() => {
    setLoadingPosts(true);
    socialApi.getUserMedia()
      .then(({ data }) => setInstagramPosts(data))
      .catch(() => setToast({ message: 'Error al cargar publicaciones de Instagram. Intenta de nuevo.', type: 'error' }))
      .finally(() => setLoadingPosts(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga las publicaciones al conectar Instagram
    if (instagramConnected) loadPosts();
  }, [instagramConnected, loadPosts]);

  const filteredPosts = instagramPosts.filter((post) =>
    !postFilter || (post.caption || '').toLowerCase().includes(postFilter.toLowerCase()),
  );

  // Guarda lo que ya está completo, aunque falten otros datos obligatorios: se puede avanzar de a poco.
  // Los campos vacíos no se envían (el servidor no permite vaciar un dato obligatorio) y los completos se validan.
  const handleSave = async () => {
    const filled = (value: string) => value.trim() !== '';
    const errors: string[] = [];
    if (filled(form.companyPhone) && !PHONE_PATTERN.test(form.companyPhone)) errors.push('El teléfono de la empresa debe tener 8 dígitos después del +569');
    if (filled(form.companyRut)) {
      const rutError = companyRutError(form.companyRut);
      if (rutError) errors.push(rutError);
    }
    if (filled(form.companyStreet) !== filled(form.companyNumber)) errors.push('Completa la calle y el número de la dirección');
    if (filled(form.adminPhone) && !PHONE_PATTERN.test(form.adminPhone)) errors.push('El teléfono del administrador debe tener 8 dígitos después del +569');
    if (filled(form.adminRut) && !isValidRut(form.adminRut)) errors.push('El RUT del administrador no es válido');
    if (errors.length > 0) {
      setToast({ message: errors[0], type: 'error' });
      return;
    }

    const { email: _email, companyStreet, companyNumber, companyInstagram, website, ...rest } = form;
    const data: Parameters<typeof usersApi.updateProfile>[0] = Object.fromEntries(Object.entries(rest).filter(([, value]) => filled(value)));
    if (filled(companyInstagram)) data.companyInstagram = instagramValueFrom(companyInstagram);
    // La dirección se guarda como un solo texto: "Calle 123".
    if (filled(companyStreet) && filled(companyNumber)) data.companyAddress = `${companyStreet.trim()} ${companyNumber}`;
    data.website = website.trim() || null; // opcional: vacío lo borra

    setSaving(true);
    try {
      const { data: updated } = await usersApi.updateProfile(data);
      const nextUser = { ...user!, ...updated };
      setUser(nextUser);
      setEditing(false);
      setRequiredNoticeClosed(true);
      const pending = requiredProfileItems(nextUser).filter((item) => !item.done).length;
      setToast(pending > 0
        ? { message: `Datos guardados. Te ${pending === 1 ? 'falta 1 dato obligatorio' : `faltan ${pending} datos obligatorios`}.`, type: 'success' }
        : { message: 'Datos actualizados correctamente', type: 'success' });
    } catch (err) {
      setToast({ message: apiErrorMessage(err, 'Error al guardar los datos'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await usersApi.deleteAccount();
      logout();
      window.location.href = '/';
    } catch {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setToast({ message: 'Error al eliminar la cuenta. Inténtalo de nuevo.', type: 'error' });
    }
  };

  const set = (key: keyof typeof form) => (val: string) => setForm(prev => ({ ...prev, [key]: val }));
  // Los RUT se muestran con puntos y guion mientras se escriben: 74.000.888-5.
  const setRut = (key: 'companyRut' | 'adminRut') => (val: string) => set(key)(formatRutInput(val));

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                style={{ backgroundColor: '#2563EB' }}
              >
                {(form.name || '?').charAt(0).toUpperCase()}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFFFFF', border: '2px solid #F8FAFC' }}
              >
                <Camera className="w-3.5 h-3.5" style={{ color: '#1D1D1F' }} />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" }}>
                {form.name || 'Nombre empresa organizadora'}
              </p>
              {instagramConnected ? (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mt-1"
                  style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
                >
                  <Camera className="w-3 h-3" />
                  Instagram vinculado
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mt-1"
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                >
                  <Camera className="w-3 h-3" />
                  Instagram no vinculado
                </span>
              )}
            </div>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
              style={{ color: '#2563EB', border: '1px solid #E4EBFA', backgroundColor: '#FFFFFF' }}
            >
              <SquarePen className="w-4 h-4" />
              Editar datos
            </button>
          )}
        </div>

        {/* ── Datos de empresa ── */}
        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '4px' }}>
            Datos de empresa
          </p>
          {editing && (
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '16px' }}>
              Completa los datos de la empresa organizadora, que utilizaremos para el registro de publicaciones y la emisión de documentos tributarios.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <ProfileField id="perfil-nombre" label="Nombre de empresa" info={REQUIRED_INFO['Nombre de empresa']} value={form.name} editing={editing} onChange={set('name')} placeholder="Ingrese nombre de empresa" required />
            {editing ? (
              <InstagramInput id="perfil-instagram" label="Instagram empresa" labelStyle={PROFILE_LABEL_STYLE} required info={<p>{REQUIRED_INFO['Instagram empresa']}</p>} value={form.companyInstagram} onChange={set('companyInstagram')} />
            ) : (
              <ProfileField label="Instagram empresa" info={REQUIRED_INFO['Instagram empresa']} value={form.companyInstagram ? `@${form.companyInstagram}` : ''} editing={false} onChange={set('companyInstagram')} placeholder="Ingrese cuenta de instagram" required />
            )}
            <ProfileField label="Sitio web" value={form.website} editing={editing} onChange={set('website')} placeholder="Ingrese sitio web" />
            <ProfileField id="perfil-rut" label="Rut de empresa" info={REQUIRED_INFO['Rut de empresa']} value={form.companyRut} editing={editing} onChange={setRut('companyRut')} placeholder="Ej: 74.000.888-5" required />
            <ProfileField id="perfil-giro" label="Giro de empresa" info={REQUIRED_INFO['Giro de empresa']} value={form.companyGiro} editing={editing} onChange={set('companyGiro')} placeholder="Elige el giro de la empresa" type="select" groups={GIRO_SELECT_GROUPS} required />
            <ProfileField id="perfil-telefono" label="Teléfono empresa" info={REQUIRED_INFO['Teléfono empresa']} value={form.companyPhone} editing={editing} onChange={set('companyPhone')} type="phone" required />
            <ProfileField label="Correo electrónico empresa" info={REQUIRED_INFO['Correo electrónico empresa']} value={form.email} editing={editing} onChange={set('email')} placeholder="Ingrese correo electrónico de empresa" type="email" required disabled />
            <ProfileField id="perfil-calle" label="Calle" info={REQUIRED_INFO['Calle']} value={form.companyStreet} editing={editing} onChange={(v) => setForm(prev => ({ ...prev, companyStreet: v.slice(0, 50) }))} placeholder="Nombre de la calle" required />
            <ProfileField label="Número" info={REQUIRED_INFO['Número']} value={form.companyNumber} editing={editing} onChange={(v) => setForm(prev => ({ ...prev, companyNumber: v.replace(/\D/g, '').slice(0, 6) }))} placeholder="Número" required />
            <ProfileField id="perfil-categoria" label="Categoría" info={REQUIRED_INFO['Categoría']} value={form.category} editing={editing} onChange={set('category')} placeholder="Elige una categoría" type="select" groups={BUSINESS_CATEGORY_GROUPS} required />
            <ProfileField id="perfil-ciudad" label="Ciudad" info={REQUIRED_INFO['Ciudad']} value={form.city} editing={editing} onChange={set('city')} placeholder="Seleccione Ciudad" type="select" options={CIUDADES} required />
            <ProfileField id="perfil-comuna" label="Comuna" info={REQUIRED_INFO['Comuna']} value={form.comuna} editing={editing} onChange={set('comuna')} placeholder="Seleccione Comuna" type="select" options={COMUNAS} required />
          </div>
        </div>

        {/* ── Datos personales Administrador ── */}
        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '4px' }}>
            Datos personales Administrador
          </p>
          {editing && (
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '16px' }}>
              Completa la información de la persona que administrará las publicaciones de eventos en la plataforma.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <ProfileField id="perfil-admin-nombre" label="Nombre de administrador" info={REQUIRED_INFO['Nombre de administrador']} value={form.adminFirstName} editing={editing} onChange={set('adminFirstName')} placeholder="Ingrese nombre" required />
            <ProfileField id="perfil-admin-apellidos" label="Apellidos de administrador" info={REQUIRED_INFO['Apellidos de administrador']} value={form.adminLastName} editing={editing} onChange={set('adminLastName')} placeholder="Ingrese apellidos" required />
            <ProfileField id="perfil-admin-rut" label="Rut administrador" info={REQUIRED_INFO['Rut administrador']} value={form.adminRut} editing={editing} onChange={setRut('adminRut')} placeholder="Ingrese RUT de administrador" required />
            <ProfileField id="perfil-admin-telefono" label="Teléfono administrador" info={REQUIRED_INFO['Teléfono administrador']} value={form.adminPhone} editing={editing} onChange={set('adminPhone')} type="phone" required />
            <ProfileField label="Correo electrónico administrador" info={REQUIRED_INFO['Correo electrónico administrador']} value={form.email} editing={editing} onChange={set('email')} placeholder="Ingrese correo electrónico" type="email" required disabled />
            {editing && (
              <div className="flex items-end">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
                  style={{ color: '#2563EB', border: '1px solid #2563EB', backgroundColor: '#FFFFFF' }}
                >
                  Configurar contraseña
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Redes sociales ── */}
        <div className="mb-6">
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '12px' }}>
            Redes sociales
          </p>
          <div
            className="flex items-center justify-between px-5 py-4 rounded-2xl"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium" style={{ color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" }}>
                Instagram
              </span>
            </div>

            {instagramConnected ? (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Vinculado
                </span>
                {editing && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-all"
                    style={{ color: '#2563EB', border: '1px solid #2563EB', backgroundColor: '#FFFFFF' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#2563EB'; }}
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Desvincular
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                >
                  No vinculado
                </span>
                {editing && (
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-full cursor-pointer transition-all"
                    style={{ color: '#DC2626', border: '1px solid #DC2626', backgroundColor: '#FFFFFF' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DC2626'; e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#DC2626'; }}
                  >
                    <Link className="w-3.5 h-3.5" />
                    Vincular
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Publicaciones de Instagram ── */}
        {instagramConnected && (
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={postFilter}
                onChange={(e) => setPostFilter(e.target.value)}
                placeholder="Buscar en descripciones..."
                aria-label="Buscar publicaciones"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA', color: '#1D1D1F' }}
              />
              <button
                type="button"
                onClick={() => { setToast(null); loadPosts(); }}
                disabled={loadingPosts}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ color: '#2563EB', border: '1px solid #2563EB', backgroundColor: '#FFFFFF' }}
              >
                <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>

            {loadingPosts ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner color="cyan" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
                <Search className="w-8 h-8 mx-auto mb-3" style={{ color: '#1D1D1F66' }} />
                <p className="text-sm" style={{ color: '#1D1D1F99' }}>
                  {postFilter ? 'No hay publicaciones que coincidan con tu búsqueda' : 'Aún no hay publicaciones en Instagram'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPosts.map((post) => (
                  <SocialPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Guardar datos ── */}
        {editing && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 mb-3"
            style={{ backgroundColor: '#2563EB' }}
          >
            {saving ? 'Guardando...' : 'Guardar datos'}
          </button>
        )}

        {/* ── Eliminar cuenta ── */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: '#1D1D1F99', border: '1px solid #E4EBFA', backgroundColor: '#FFFFFF' }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar cuenta
        </button>

      </div>

      {/* Modal eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#FEE2E2' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: '#DC2626' }} />
              </div>
              <h2 className="text-base font-bold mb-1" style={{ color: '#1D1D1F' }}>¿Eliminar tu cuenta?</h2>
              <p className="text-sm" style={{ color: '#1D1D1F99' }}>
                Se eliminarán permanentemente tu perfil, eventos, inscripciones y conexión con Instagram. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: '#DC2626' }}
              >
                {deleteLoading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="w-full px-4 py-2.5 rounded-xl text-sm border cursor-pointer"
                style={{ color: '#1D1D1F99', borderColor: '#E4EBFA', backgroundColor: '#F8FAFC' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <InstagramLinkModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleLinkSuccess}
        onError={handleLinkError}
      />
      <CompleteProfileModal items={requiredItems} isOpen={!editing && !requiredNoticeClosed} onClose={() => setRequiredNoticeClosed(true)} onGoTo={goToField} />
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        visible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
