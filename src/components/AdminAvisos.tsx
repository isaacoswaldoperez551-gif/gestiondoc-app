/**
 * Componente de Envío de Avisos Masivos / Específicos (Solo Admin)
 */
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { DirectoriUser } from '../types';
import { obtenerNombreUsuario } from '../utils';
import { Megaphone, Send, Loader2, CheckCircle2 } from 'lucide-react';

interface AdminAvisosProps {
  directorioUsers: DirectoriUser[];
  addToast: (mensaje: string, tipo?: 'success' | 'error' | 'info') => void;
}

export const AdminAvisos: React.FC<AdminAvisosProps> = ({
  directorioUsers,
  addToast,
}) => {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [destino, setDestino] = useState<'todos' | 'supervisores' | 'usuarios' | 'persona'>('todos');
  const [usuarioIdSeleccionado, setUsuarioIdSeleccionado] = useState(directorioUsers[0]?.id || '');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensaje.trim()) {
      addToast('El título y el mensaje son obligatorios.', 'error');
      return;
    }

    setCargando(true);
    try {
      const { data, error } = await supabase.rpc('enviar_aviso', {
        p_titulo: titulo.trim(),
        p_mensaje: mensaje.trim(),
        p_destino: destino,
        p_usuario_id: destino === 'persona' ? usuarioIdSeleccionado : null,
      });

      if (error) throw error;

      const numPersonas = typeof data === 'number' ? data : 0;
      addToast(`Aviso enviado a ${numPersonas} personas.`, 'success');
      setTitulo('');
      setMensaje('');
    } catch (err: any) {
      console.error('Error al enviar aviso:', err);
      addToast(err?.message || 'Error al enviar el aviso.', 'error');
    } finally {
      setCargando(false);
    }
  };

  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Enviar Avisos del Sistema
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notifica a los usuarios de manera masiva o individual.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              ¿A quién va dirigido?
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="todos">Todos los usuarios</option>
              <option value="supervisores">Solo supervisores</option>
              <option value="usuarios">Solo usuarios</option>
              <option value="persona">Una persona específica</option>
            </select>
          </div>

          {destino === 'persona' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Seleccionar Persona
              </label>
              <select
                value={usuarioIdSeleccionado}
                onChange={(e) => setUsuarioIdSeleccionado(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {directorioUsers.map((u) => {
                  const nombre = obtenerNombreUsuario(u.id, directorioMap);
                  return (
                    <option key={u.id} value={u.id}>
                      {nombre} ({u.email})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Título del Aviso *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Actualización de políticas de seguridad"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mensaje *
            </label>
            <textarea
              rows={4}
              required
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe el contenido del aviso aquí..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Enviar Aviso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
