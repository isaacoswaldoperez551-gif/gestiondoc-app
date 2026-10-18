/**
 * Componente de Gestión de Usuarios y Roles (Solo Admin)
 */
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Users, Shield, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';

interface PerfilUsuario {
  id: string;
  email: string;
  nombre: string | null;
  rol: 'admin' | 'supervisor' | 'usuario';
  creado_en?: string;
}

interface AdminUsuariosProps {
  perfiles: PerfilUsuario[];
  currentUserId: string;
  onRefresh: () => void;
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const AdminUsuarios: React.FC<AdminUsuariosProps> = ({
  perfiles,
  currentUserId,
  onRefresh,
  addToast,
}) => {
  const [emailAsignar, setEmailAsignar] = useState('');
  const [rolAsignar, setRolAsignar] = useState<'admin' | 'supervisor' | 'usuario'>('usuario');
  const [cargandoAsignar, setCargandoAsignar] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  const numAdmins = perfiles.filter((p) => p.rol === 'admin').length;
  const numSupervisores = perfiles.filter((p) => p.rol === 'supervisor').length;
  const numUsuarios = perfiles.filter((p) => p.rol === 'usuario').length;

  const handleCambiarRol = async (id: string, nuevoRol: 'admin' | 'supervisor' | 'usuario') => {
    if (id === currentUserId) {
      addToast('No puedes cambiar tu propio rol de administrador.', 'error');
      return;
    }

    setActualizandoId(id);
    try {
      const perfil = perfiles.find((p) => p.id === id);
      if (!perfil) throw new Error('Usuario no encontrado.');

      // Usa la RPC para mantener sincronizadas "perfiles" y "roles_por_correo"
      const { error } = await supabase.rpc('asignar_rol_por_correo', {
        p_email: perfil.email,
        p_rol: nuevoRol,
      });

      if (error) throw error;

      addToast('Rol de usuario actualizado correctamente.', 'success');
      onRefresh();
    } catch (err: any) {
      console.error('Error al cambiar rol:', err);
      addToast(err?.message || 'Error al actualizar el rol.', 'error');
    } finally {
      setActualizandoId(null);
    }
  };

  const handleAsignarRolPorCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAsignar.trim()) return;

    setCargandoAsignar(true);
    try {
      const { error } = await supabase.rpc('asignar_rol_por_correo', {
        p_email: emailAsignar.trim(),
        p_rol: rolAsignar,
      });

      if (error) throw error;

      addToast(`Rol asignado correctamente a ${emailAsignar}.`, 'success');
      setEmailAsignar('');
      onRefresh();
    } catch (err: any) {
      console.error('Error al asignar rol por correo:', err);
      addToast(err?.message || 'Error al asignar rol por correo.', 'error');
    } finally {
      setCargandoAsignar(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Administradores
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {numAdmins}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Supervisores
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {numSupervisores}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Usuarios
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {numUsuarios}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario Asignar Rol por Correo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <UserPlus className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Asignar Rol por Correo Electrónico
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Permite preasignar o cambiar el rol de un correo incluso si aún no ha creado su cuenta.
        </p>

        <form onSubmit={handleAsignarRolPorCorreo} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <input
            type="email"
            required
            value={emailAsignar}
            onChange={(e) => setEmailAsignar(e.target.value)}
            placeholder="correo@empresa.com"
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <select
            value={rolAsignar}
            onChange={(e) => setRolAsignar(e.target.value as any)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="usuario">Usuario</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Administrador</option>
          </select>
          <button
            type="submit"
            disabled={cargandoAsignar}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            {cargandoAsignar && <Loader2 className="w-4 h-4 animate-spin" />}
            Asignar Rol
          </button>
        </form>
      </div>

      {/* Tabla de Personas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Listado de Usuarios Registrados
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Usuario</th>
                <th className="py-3.5 px-6">Correo</th>
                <th className="py-3.5 px-6">Rol Actual</th>
                <th className="py-3.5 px-6 text-right">Cambiar Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {perfiles.map((p) => {
                const esMio = p.id === currentUserId;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {p.nombre || p.email.split('@')[0]}
                      {esMio && <span className="ml-2 text-xs text-indigo-600 font-normal">(Tú)</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                      {p.email}
                    </td>
                    <td className="py-4 px-6 text-xs capitalize">
                      <span className={`px-2.5 py-1 rounded-md font-semibold ${
                        p.rol === 'admin'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : p.rol === 'supervisor'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {p.rol}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {esMio ? (
                        <span className="text-xs text-slate-400 italic">No editable</span>
                      ) : (
                        <select
                          value={p.rol}
                          disabled={actualizandoId === p.id}
                          onChange={(e) => handleCambiarRol(p.id, e.target.value as any)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                          <option value="usuario">Usuario</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
