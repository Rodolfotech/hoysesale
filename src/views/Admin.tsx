'use client';

import { useState, useEffect } from 'react';
import { adminApi, authApi } from '../api';
import { COMUNAS } from '../constants/comunas';
import type { User } from '../types';
import {
  Users,
  MapPin,
  Camera,
  Calendar,
  Sparkles,
  Shield,
  Clock,
  ChevronRight,
  Mail,
  Activity,
  Eye,
  Loader2,
  LogIn,
  Lock,
} from 'lucide-react';
import { PasswordInput } from '../components/ui/PasswordInput';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Admin() {
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [comuna, setComuna] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [stats, setStats] = useState<{ totalUsers: number; totalEvents: number; totalAttendees: number; totalInstagramClicks: number } | null>(null);

  useEffect(() => {
    adminApi.getStats().then(({ data }) => {
      setStats(data);
      setAccessGranted(true);
    }).catch((err) => {
      if (err?.response?.status === 403) {
        setAccessGranted(false);
        setAccessError('No tienes permisos de administrador.');
      } else if (err?.response?.status === 401) {
        setAccessGranted(false);
      } else if (err?.response) {
        setAccessGranted(false);
        setAccessError(`Error del servidor (${err.response.status}).`);
      } else {
        setAccessGranted(false);
        setAccessError('Error de conexión con el servidor.');
      }
    });

    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        window.location.reload();
      }, 30 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await authApi.login(loginEmail, loginPassword);
      setLoginLoading(false);
      window.location.reload();
    } catch (err: any) {
      setLoginLoading(false);
      setLoginError(err?.response?.data?.message || 'Credenciales inválidas');
    }
  };

  useEffect(() => {
    if (!accessGranted) return;
    setLoading(true);
    adminApi.getUsers(comuna || undefined).then(({ data }) => {
      setUsers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [accessGranted, comuna]);

  const handleSelectUser = (userId: string) => {
    setLoadingDetail(true);
    adminApi.getUserById(userId).then(({ data }) => {
      setSelectedUser(data);
      setLoadingDetail(false);
    }).catch(() => setLoadingDetail(false));
  };

  if (accessGranted === null) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-full max-w-sm mx-4">
          <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#2563EB' }}
              >
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-lg font-bold leading-tight break-words" style={{ color: '#1D1D1F' }}>Panel de Control</h1>
              <p className="text-sm mt-1" style={{ color: '#1D1D1F99' }}>Inicia sesión como administrador</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@ejemplo.cl"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none light-form"
                  required
                />
              </div>

              <PasswordInput
                label="Contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                icon={Lock}
                autoComplete="current-password"
              />

              {loginError && (
                <p className="text-xs text-center" style={{ color: '#DC2626' }}>{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: '#2563EB' }}
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loginLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            {accessError && (
              <p className="text-xs text-center mt-4" style={{ color: '#1D1D1F66' }}>{accessError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>Panel de Control</h1>
            <p className="text-sm" style={{ color: '#1D1D1F99' }}>Gestión de usuarios y estadísticas</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Usuarios', value: stats.totalUsers, icon: Users },
              { label: 'Eventos', value: stats.totalEvents, icon: Sparkles },
              { label: 'Inscripciones', value: stats.totalAttendees, icon: Activity },
              { label: 'Clicks Instagram', value: stats.totalInstagramClicks, icon: Camera },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: '#2563EB' }} />
                  <span className="text-xs" style={{ color: '#1D1D1F99' }}>{label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#1D1D1F' }}>
                <MapPin className="w-4 h-4" style={{ color: '#2563EB' }} />
                Filtrar por Comuna
              </h2>

              <select
                value={comuna}
                onChange={(e) => { setComuna(e.target.value); setSelectedUser(null); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4 light-form"
              >
                <option value="">Selecciona una comuna</option>
                {COMUNAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <h3 className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#1D1D1F99' }}>
                <Users className="w-3 h-3" />
                Usuarios ({users.length})
              </h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2563EB' }} />
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#1D1D1F99' }}>
                  {comuna ? 'No hay usuarios en esta comuna' : 'No hay usuarios registrados'}
                </p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer"
                      style={
                        selectedUser?.id === u.id
                          ? { backgroundColor: '#E4EBFA', border: '1px solid #2563EB' }
                          : { backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }
                      }
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#2563EB' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#1D1D1F' }}>{u.name}</p>
                        <p className="text-xs truncate" style={{ color: '#1D1D1F99' }}>{u.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {u.instagramId && <Camera className="w-3 h-3" style={{ color: '#2563EB' }} />}
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ color: '#2563EB', backgroundColor: '#E4EBFA' }}
                        >
                          {u.role === 'ADMIN' ? 'Admin' : u.role === 'ORGANIZER' ? 'Org' : 'User'}
                        </span>
                        <ChevronRight className="w-3 h-3" style={{ color: '#1D1D1F66' }} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {loadingDetail ? (
              <div className="rounded-2xl p-5 flex items-center justify-center py-20" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2563EB' }} />
              </div>
            ) : selectedUser ? (
              <div className="rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-sm shrink-0" style={{ backgroundColor: '#2563EB' }}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3" style={{ color: '#1D1D1F99' }} />
                      <span className="text-sm" style={{ color: '#1D1D1F99' }}>{selectedUser.email}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        style={{ color: '#2563EB', backgroundColor: '#E4EBFA' }}
                      >
                        <Shield className="w-3 h-3" />
                        {selectedUser.role === 'ADMIN' ? 'Administrador' : selectedUser.role === 'ORGANIZER' ? 'Organizador' : 'Usuario'}
                      </span>
                      {selectedUser.comuna && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full" style={{ color: '#2563EB', backgroundColor: '#E4EBFA' }}>
                          <MapPin className="w-3 h-3" />
                          {selectedUser.comuna}
                        </span>
                      )}
                      {selectedUser.instagramId && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full" style={{ color: '#2563EB', backgroundColor: '#E4EBFA' }}>
                          <Camera className="w-3 h-3" />
                          Instagram {selectedUser.instagramUsername ? `@${selectedUser.instagramUsername}` : 'conectado'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Eventos', value: selectedUser.eventCount ?? 0, icon: Sparkles },
                    { label: 'Inscripciones', value: selectedUser.registrationCount ?? 0, icon: Users },
                    { label: 'Clicks Instagram', value: selectedUser.instagramClickCount ?? 0, icon: Camera },
                    { label: 'Miembro desde', value: selectedUser.createdAt ? format(new Date(selectedUser.createdAt), "MMM yyyy", { locale: es }) : '-', icon: Clock },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
                      <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: '#2563EB' }} />
                      <p className="text-lg font-bold" style={{ color: '#1D1D1F' }}>{value}</p>
                      <p className="text-[10px]" style={{ color: '#1D1D1F99' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {selectedUser.instagramId && (
                  <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#1D1D1F99' }}>
                      <Camera className="w-3 h-3" style={{ color: '#2563EB' }} />
                      Instagram
                    </h3>
                    <div className="flex items-center gap-3">
                      {selectedUser.instagramAvatar ? (
                        <img src={selectedUser.instagramAvatar} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1D1D1F' }}>
                          {selectedUser.instagramUsername ? `@${selectedUser.instagramUsername}` : 'Instagram conectado'}
                        </p>
                        <p className="text-xs" style={{ color: '#1D1D1F99' }}>ID: {selectedUser.instagramId?.slice(0, 12)}...</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUser.ownedEvents && selectedUser.ownedEvents.length > 0 && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#1D1D1F99' }}>
                        <Sparkles className="w-3 h-3" style={{ color: '#2563EB' }} />
                        Eventos Creados ({selectedUser.ownedEvents.length})
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedUser.ownedEvents.map((e) => (
                          <div key={e.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #E4EBFA' }}>
                            <p className="text-sm truncate" style={{ color: '#1D1D1F' }}>{e.title}</p>
                            <span className="text-[10px] shrink-0 ml-2" style={{ color: '#1D1D1F99' }}>
                              {format(new Date(e.date), "dd MMM", { locale: es })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.registrations && selectedUser.registrations.length > 0 && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#1D1D1F99' }}>
                        <Calendar className="w-3 h-3" style={{ color: '#2563EB' }} />
                        Inscripciones ({selectedUser.registrations.length})
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedUser.registrations.map((r) => (
                          <div key={r.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #E4EBFA' }}>
                            <p className="text-sm truncate" style={{ color: '#1D1D1F' }}>{r.event.title}</p>
                            <span className="text-[10px] shrink-0 ml-2" style={{ color: '#1D1D1F99' }}>
                              {format(new Date(r.createdAt), "dd MMM", { locale: es })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!selectedUser.ownedEvents?.length && !selectedUser.registrations?.length && (
                  <p className="text-sm text-center py-6" style={{ color: '#1D1D1F99' }}>El usuario no tiene eventos ni inscripciones registradas.</p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl p-5 flex items-center justify-center py-20" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
                <div className="text-center">
                  <Eye className="w-10 h-10 mx-auto mb-3" style={{ color: '#E4EBFA' }} />
                  <p className="text-sm" style={{ color: '#1D1D1F99' }}>Selecciona una comuna y un usuario para ver su información</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}