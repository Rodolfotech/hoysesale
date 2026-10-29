'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { socialApi, usersApi } from '../api';
import { InstagramLinkModal } from '../features/social/InstagramLinkModal';
import { BusinessSettings } from '../features/business/BusinessSettings';
import { SocialPostCard } from '../features/social/SocialPostCard';
import { Toast } from '../components/ui/Toast';
import { ProfileField } from '../components/ui/ProfileField';
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
import type { SocialPost } from '../types';

const CIUDADES = ['Villarrica', 'Pucón', 'Temuco', 'Loncoche', 'Freire', 'Cunco', 'Curarrehue', 'Lautaro', 'Pitrufquén', 'Gorbea'] as const;

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState<SocialPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postFilter, setPostFilter] = useState('');

  const [form, setForm] = useState({
    name: '',
    companyInstagram: '',
    website: '',
    companyRut: '',
    companyGiro: '',
    companyPhone: '',
    email: '',
    companyAddress: '',
    city: '',
    comuna: '',
    adminFirstName: '',
    adminLastName: '',
    adminRut: '',
    adminPhone: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        companyInstagram: user.companyInstagram || '',
        website: user.website || '',
        companyRut: user.companyRut || '',
        companyGiro: user.companyGiro || '',
        companyPhone: user.companyPhone || '',
        email: user.email || '',
        companyAddress: user.companyAddress || '',
        city: user.city || '',
        comuna: user.comuna || '',
        adminFirstName: user.adminFirstName || '',
        adminLastName: user.adminLastName || '',
        adminRut: user.adminRut || '',
        adminPhone: user.adminPhone || '',
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
    if (instagramConnected) loadPosts();
  }, [instagramConnected, loadPosts]);

  const filteredPosts = instagramPosts.filter((post) =>
    !postFilter || (post.caption || '').toLowerCase().includes(postFilter.toLowerCase()),
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const { email: _email, ...data } = form;
      await usersApi.updateProfile(data);
      setEditing(false);
      setToast({ message: 'Datos actualizados correctamente', type: 'success' });
    } catch {
      setToast({ message: 'Error al guardar los datos', type: 'error' });
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
            <ProfileField label="Nombre de empresa organizadora" value={form.name} editing={editing} onChange={set('name')} placeholder="Ingrese nombre de empresa" required />
            <ProfileField label="Instagram empresa organizadora" value={form.companyInstagram} editing={editing} onChange={set('companyInstagram')} placeholder="Ingrese cuenta de instagram" required />
            <ProfileField label="Sitio web" value={form.website} editing={editing} onChange={set('website')} placeholder="Ingrese sitio web" />
            <ProfileField label="Rut de empresa" value={form.companyRut} editing={editing} onChange={set('companyRut')} placeholder="Ingrese RUT de empresa" />
            <ProfileField label="Giro de empresa" value={form.companyGiro} editing={editing} onChange={set('companyGiro')} placeholder="Ingrese giro comercial de empresa" />
            <ProfileField label="Teléfono empresa" value={form.companyPhone} editing={editing} onChange={set('companyPhone')} placeholder="Ingrese RUT de empresa" type="tel" required />
            <ProfileField label="Correo electrónico empresa" value={form.email} editing={editing} onChange={set('email')} placeholder="Ingrese correo electrónico de empresa" type="email" required disabled />
            <ProfileField label="Dirección de empresa" value={form.companyAddress} editing={editing} onChange={set('companyAddress')} placeholder="Ingrese dirección de empresa" />
            <ProfileField label="Ciudad" value={form.city} editing={editing} onChange={set('city')} placeholder="Seleccione Ciudad" type="select" options={CIUDADES} required />
            <ProfileField label="Comuna" value={form.comuna} editing={editing} onChange={set('comuna')} placeholder="Seleccione Comuna" type="select" options={COMUNAS} required />
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
            <ProfileField label="Nombre de administrador" value={form.adminFirstName} editing={editing} onChange={set('adminFirstName')} placeholder="Ingrese nombre" required />
            <ProfileField label="Apellidos de administrador" value={form.adminLastName} editing={editing} onChange={set('adminLastName')} placeholder="Ingrese apellidos" required />
            <ProfileField label="Rut administrador" value={form.adminRut} editing={editing} onChange={set('adminRut')} placeholder="Ingrese rut de organizador" />
            <ProfileField label="Teléfono administrador" value={form.adminPhone} editing={editing} onChange={set('adminPhone')} placeholder="Ingrese número de teléfono" type="tel" required />
            <ProfileField label="Correo electrónico administrador" value={form.email} editing={editing} onChange={set('email')} placeholder="Ingrese correo electrónico" type="email" required disabled />
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

        {/* ── Mi micro-sitio ── */}
        {user && (
          <div className="mb-6">
            <BusinessSettings
              slug={user.slug ?? null}
              onSaved={(newSlug) => setUser({ ...user, slug: newSlug ?? user.slug })}
              initial={{
                category: user.category,
                businessDescription: user.businessDescription,
                amenities: user.amenities,
                whatsappReservations: user.whatsappReservations,
                mapUrl: user.mapUrl,
              }}
            />
          </div>
        )}

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
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        visible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
