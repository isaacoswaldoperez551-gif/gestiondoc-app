/**
 * Componente Principal (App.tsx) para GestiónDoc (Documentos, Tareas, Papelera, Favoritos, Recientes, Perfil y Recuperación)
 */
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Documento, ToastMessage, DirectoriUser, Tarea, TipoFiltro } from './types';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { FolderSidebar } from './components/FolderSidebar';
import { UploadSection } from './components/UploadSection';
import { DocumentList } from './components/DocumentList';
import { CardGrid } from './components/CardGrid';
import { PreviewModal } from './components/PreviewModal';
import { RenameModal } from './components/RenameModal';
import { MoveFolderModal } from './components/MoveFolderModal';
import { TrashView } from './components/TrashView';
import { TasksView } from './components/TasksView';
import { TaskModal } from './components/TaskModal';
import { TaskCommentsModal } from './components/TaskCommentsModal';
import { ProfileModal } from './components/ProfileModal';
import { Toast } from './components/Toast';
import { LayoutGrid, Table } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [documentosBorrados, setDocumentosBorrados] = useState<Documento[]>([]);
  const [favoritosIds, setFavoritosIds] = useState<string[]>([]);
  const [recientesIds, setRecientesIds] = useState<string[]>([]);
  const [directorioUsers, setDirectorioUsers] = useState<DirectoriUser[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);

  const [cargandoDocs, setCargandoDocs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Navegación y Vistas
  const [activeMainTab, setActiveMainTab] = useState<'documentos' | 'tareas'>('documentos');
  const [filtroActual, setFiltroActual] = useState<TipoFiltro | string | null>(null); // null = todos, 'sin_carpeta', 'favoritos', 'recientes', 'papelera', o nombre carpeta
  const [carpetasLocales, setCarpetasLocales] = useState<string[]>([]);
  const [vistaModo, setVistaModo] = useState<'tarjetas' | 'tabla'>(() => {
    try {
      const guardado = localStorage.getItem('gestiondoc_vista');
      return guardado === 'tarjetas' || guardado === 'tabla' ? guardado : 'tarjetas';
    } catch {
      return 'tarjetas';
    }
  });

  // Modales
  const [docPreview, setDocPreview] = useState<Documento | null>(null);
  const [signedUrlPreview, setSignedUrlPreview] = useState<string | null>(null);
  const [docARenombrar, setDocARenombrar] = useState<Documento | null>(null);
  const [docAMover, setDocAMover] = useState<Documento | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskAEditar, setTaskAEditar] = useState<Tarea | null>(null);
  const [taskCommentsOpen, setTaskCommentsOpen] = useState<Tarea | null>(null);

  // Rol del usuario actual (detectando admin/supervisor por metadata o rol simulado/perfil)
  const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role || 'usuario';
  const isAdminOrSupervisor = ['admin', 'supervisor'].includes(userRole) || session?.user?.email?.includes('admin');
  const isAdmin = userRole === 'admin' || session?.user?.email?.includes('admin');

  // Agregar notificación Toast
  const addToast = (mensaje: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Verificar sesión y modo recuperación al cargar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargandoSesion(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    // Revisar hash por si viene de recuperación
    if (window.location.hash.includes('type=recovery')) {
      setIsRecoveryMode(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  // Cargar datos cuando hay sesión
  useEffect(() => {
    if (!session) return;

    fetchDocumentos();
    fetchDirectorio();
    fetchFavoritos();
    fetchRecientes();
    fetchTareas();

    // Supabase Realtime
    const canalDocs = supabase
      .channel('public:documentos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documentos' }, () => {
        fetchDocumentos();
      })
      .subscribe();

    const canalTareas = supabase
      .channel('public:tareas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
        fetchTareas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canalDocs);
      supabase.removeChannel(canalTareas);
    };
  }, [session]);

  const fetchDocumentos = async () => {
    setCargandoDocs(true);
    try {
      // Documentos activos (eliminado_en is null)
      const { data: activos, error: errActivos } = await supabase
        .from('documentos')
        .select('*')
        .is('eliminado_en', null)
        .order('creado_en', { ascending: false });

      if (errActivos) throw errActivos;
      setDocumentos(activos || []);

      // Documentos borrados (Papelera): usuario ve los suyos, admin ve todos
      let queryBorrados = supabase
        .from('documentos')
        .select('*')
        .not('eliminado_en', 'is', null)
        .order('eliminado_en', { ascending: false });

      if (!isAdmin) {
        queryBorrados = queryBorrados.eq('subido_por', session.user.id);
      }

      const { data: borrados, error: errBorrados } = await queryBorrados;
      if (!errBorrados) {
        setDocumentosBorrados(borrados || []);
      }
    } catch (err: any) {
      console.error('Error al cargar documentos:', err);
    } finally {
      setCargandoDocs(false);
    }
  };

  const fetchDirectorio = async () => {
    try {
      const { data, error } = await supabase.from('directorio').select('*');
      if (!error && data) {
        setDirectorioUsers(data);
      }
    } catch (err) {
      console.error('Error al cargar directorio:', err);
    }
  };

  const fetchFavoritos = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('documento_id')
        .eq('usuario_id', session.user.id);

      if (!error && data) {
        setFavoritosIds(data.map((f: any) => f.documento_id));
      }
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
    }
  };

  const fetchRecientes = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('documentos_recientes')
        .select('documento_id')
        .eq('usuario_id', session.user.id)
        .order('abierto_en', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecientesIds(data.map((r: any) => r.documento_id));
      }
    } catch (err) {
      console.error('Error al cargar recientes:', err);
    }
  };

  const fetchTareas = async () => {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('creado_en', { ascending: false });

      if (!error && data) {
        setTareas(data);
      }
    } catch (err) {
      console.error('Error al cargar tareas:', err);
    }
  };

  const registrarReciente = async (docId: string) => {
    if (!session?.user?.id) return;
    try {
      await supabase.from('documentos_recientes').upsert(
        {
          usuario_id: session.user.id,
          documento_id: docId,
          abierto_en: new Date().toISOString(),
        },
        { onConflict: 'usuario_id,documento_id' }
      );
      fetchRecientes();
    } catch (err) {
      console.error('Error al registrar reciente:', err);
    }
  };

  const handleToggleFavorito = async (docId: string) => {
    if (!session?.user?.id) return;
    const esFav = favoritosIds.includes(docId);
    try {
      if (esFav) {
        await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', session.user.id)
          .eq('documento_id', docId);
        setFavoritosIds(favoritosIds.filter((id) => id !== docId));
        addToast('Quitado de favoritos.', 'info');
      } else {
        await supabase.from('favoritos').insert({
          usuario_id: session.user.id,
          documento_id: docId,
        });
        setFavoritosIds([...favoritosIds, docId]);
        addToast('Añadido a favoritos.', 'success');
      }
    } catch (err: any) {
      console.error('Error al cambiar favorito:', err);
      addToast('Error al actualizar favoritos.', 'error');
    }
  };

  // Guardar vista en localStorage
  const cambiarVista = (nuevoModo: 'tarjetas' | 'tabla') => {
    setVistaModo(nuevoModo);
    try {
      localStorage.setItem('gestiondoc_vista', nuevoModo);
    } catch (err) {
      console.error('Error al guardar vista en localStorage:', err);
    }
  };

  // Descargar documento con createSignedUrl (60 segundos) + registrar reciente
  const handleDownload = async (doc: Documento) => {
    registrarReciente(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUrl(doc.ruta, 60);

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'No se pudo generar el enlace de descarga.');
      }

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = doc.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`Descargando "${doc.nombre}"...`, 'success');
    } catch (err: any) {
      console.error('Error al descargar:', err);
      addToast(err?.message || 'Error al descargar el archivo.', 'error');
    }
  };

  // Abrir vista previa + registrar reciente
  const handlePreview = async (doc: Documento) => {
    registrarReciente(doc.id);
    setDocPreview(doc);
    setSignedUrlPreview(null);
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUrl(doc.ruta, 60);

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'No se pudo generar la vista previa.');
      }
      setSignedUrlPreview(data.signedUrl);
    } catch (err: any) {
      console.error('Error en vista previa:', err);
      addToast(err?.message || 'Error al abrir la vista previa.', 'error');
    }
  };

  // Papelera: Borrar (soft delete: eliminado_en = now(), eliminado_por = user)
  const handleSoftDelete = async (doc: Documento) => {
    try {
      const { error } = await supabase
        .from('documentos')
        .update({
          eliminado_en: new Date().toISOString(),
          eliminado_por: session.user.id,
        })
        .eq('id', doc.id);

      if (error) throw error;
      addToast(`Documento enviado a la papelera. Podrás restaurarlo posteriormente.`, 'success');
      fetchDocumentos();
    } catch (err: any) {
      console.error('Error al enviar a papelera:', err);
      addToast(err?.message || 'Error al enviar el documento a la papelera.', 'error');
    }
  };

  // Papelera: Restaurar
  const handleRestaurar = async (doc: Documento) => {
    try {
      const { error } = await supabase
        .from('documentos')
        .update({
          eliminado_en: null,
          eliminado_por: null,
        })
        .eq('id', doc.id);

      if (error) throw error;
      addToast(`Documento "${doc.nombre}" restaurado con éxito.`, 'success');
      fetchDocumentos();
    } catch (err: any) {
      console.error('Error al restaurar:', err);
      addToast(err?.message || 'Error al restaurar el documento.', 'error');
    }
  };

  // Papelera: Eliminar para siempre
  const handleEliminarPermanente = async (doc: Documento) => {
    try {
      await supabase.storage.from('documentos').remove([doc.ruta]);
      const { error } = await supabase.from('documentos').delete().eq('id', doc.id);
      if (error) throw error;

      addToast(`Documento eliminado permanentemente.`, 'success');
      fetchDocumentos();
    } catch (err: any) {
      console.error('Error al eliminar permanentemente:', err);
      addToast(err?.message || 'Error al eliminar permanentemente.', 'error');
    }
  };

  // Papelera: Vaciar papelera (admin)
  const handleVaciarPapelera = async () => {
    try {
      for (const doc of documentosBorrados) {
        await supabase.storage.from('documentos').remove([doc.ruta]);
        await supabase.from('documentos').delete().eq('id', doc.id);
      }
      addToast('Papelera vaciada correctamente.', 'success');
      fetchDocumentos();
    } catch (err: any) {
      console.error('Error al vaciar papelera:', err);
      addToast(err?.message || 'Error al vaciar la papelera.', 'error');
    }
  };

  // Cambiar nombre
  const handleConfirmRename = async (nuevoNombre: string) => {
    if (!docARenombrar) return;
    try {
      const { data, error } = await supabase
        .from('documentos')
        .update({ nombre: nuevoNombre })
        .eq('id', docARenombrar.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo actualizar el nombre (registro no encontrado o sin permisos).');
      }

      addToast('Nombre actualizado correctamente.', 'success');
      fetchDocumentos();
    } catch (err: any) {
      console.error('Error al renombrar:', err);
      addToast(err?.message || 'Error al actualizar el nombre.', 'error');
    }
  };

  // Mover a carpeta
  const handleConfirmMove = async (carpetaDestino: string | null) => {
    if (!docAMover) return;
    try {
      const { error } = await supabase
        .from('documentos')
        .update({ carpeta: carpetaDestino })
        .eq('id', docAMover.id);

      if (error) throw error;
      addToast('Documento movido correctamente.', 'success');
      fetchDocumentos();
    } catch (err: any) {
      console.error('Error al mover:', err);
      addToast(err?.message || 'Error al mover el documento.', 'error');
    }
  };

  // Guardar tarea
  const handleSaveTask = async (datos: Partial<Tarea>) => {
    if (taskAEditar) {
      const { error } = await supabase
        .from('tareas')
        .update(datos)
        .eq('id', taskAEditar.id);
      if (error) throw error;
      addToast('Tarea actualizada correctamente.', 'success');
    } else {
      const { error } = await supabase.from('tareas').insert({
        ...datos,
        creado_por: session.user.id,
      });
      if (error) throw error;
      addToast('Tarea creada correctamente.', 'success');
    }
    fetchTareas();
  };

  // Cambiar estado de tarea (con optimistic update y revert si falla)
  const handleCambiarEstadoTarea = async (
    tareaId: string,
    nuevoEstado: 'pendiente' | 'en_progreso' | 'completada'
  ) => {
    const estadoAnterior = tareas.find((t) => t.id === tareaId)?.estado;
    // Optimistic update
    setTareas((prev) =>
      prev.map((t) => (t.id === tareaId ? { ...t, estado: nuevoEstado } : t))
    );

    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado: nuevoEstado })
        .eq('id', tareaId);

      if (error) throw error;
      addToast('Estado de tarea actualizado.', 'success');
    } catch (err: any) {
      console.error('Error al cambiar estado de tarea:', err);
      // Revert
      if (estadoAnterior) {
        setTareas((prev) =>
          prev.map((t) => (t.id === tareaId ? { ...t, estado: estadoAnterior } : t))
        );
      }
      addToast(err?.message || 'Error al actualizar el estado de la tarea.', 'error');
    }
  };

  const handleBorrarTarea = async (tareaId: string) => {
    try {
      const { error } = await supabase.from('tareas').delete().eq('id', tareaId);
      if (error) throw error;
      addToast('Tarea eliminada.', 'success');
      fetchTareas();
    } catch (err: any) {
      console.error('Error al borrar tarea:', err);
      addToast(err?.message || 'Error al eliminar la tarea.', 'error');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast('Sesión cerrada correctamente.', 'info');
  };

  if (cargandoSesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Cargando GestiónDoc...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Login onLoginSuccess={() => {}} addToast={addToast} />
        <Toast toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  if (isRecoveryMode) {
    return (
      <>
        <Login
          onLoginSuccess={() => setIsRecoveryMode(false)}
          addToast={addToast}
          isRecoveryMode={true}
          onRecoveryComplete={() => setIsRecoveryMode(false)}
        />
        <Toast toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const userId = session.user.id;
  const userEmail = session.user.email || '';
  const directorioMap = directorioUsers.reduce((acc, u) => {
    acc[u.id] = { nombre: u.nombre, email: u.email };
    return acc;
  }, {} as Record<string, { nombre: string | null; email: string }>);

  // Nombre del usuario actual en perfil
  const perfilActual = directorioUsers.find((u) => u.id === userId);
  const nombrePerfilActual = perfilActual?.nombre || '';

  // Filtrado de documentos según filtroActual
  let documentosVisibles = documentos;
  if (filtroActual === 'favoritos') {
    documentosVisibles = documentos.filter((d) => favoritosIds.includes(d.id));
  } else if (filtroActual === 'recientes') {
    documentosVisibles = recientesIds
      .map((id) => documentos.find((d) => d.id === id))
      .filter((d): d is Documento => Boolean(d));
  } else if (filtroActual === 'sin_carpeta') {
    documentosVisibles = documentos.filter((d) => !d.carpeta);
  } else if (typeof filtroActual === 'string' && filtroActual !== 'papelera') {
    documentosVisibles = documentos.filter((d) => d.carpeta === filtroActual);
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${darkMode ? 'dark' : ''}`}>
      <Navbar
        userEmail={userEmail}
        userId={userId}
        directorioMap={directorioMap}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tarjetas de Resumen (solo visibles en pestaña Documentos) */}
        {activeMainTab === 'documentos' && filtroActual !== 'papelera' && (
          <SummaryCards documentos={documentos} currentUserId={userId} />
        )}

        {/* Layout principal con barra lateral */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FolderSidebar
            documentos={documentos}
            documentosBorrados={documentosBorrados}
            favoritosIds={favoritosIds}
            recientesIds={recientesIds}
            filtroActual={filtroActual}
            activeMainTab={activeMainTab}
            onSelectFiltro={(filtro, tab) => {
              if (tab) setActiveMainTab(tab);
              setFiltroActual(filtro);
            }}
            carpetasLocales={carpetasLocales}
            onCrearCarpeta={(nombre) => {
              if (!carpetasLocales.includes(nombre)) {
                setCarpetasLocales([...carpetasLocales, nombre]);
                addToast(`Carpeta "${nombre}" creada.`, 'success');
              }
            }}
          />

          <div className="flex-1 w-full space-y-8 min-w-0">
            {activeMainTab === 'tareas' ? (
              <TasksView
                tareas={tareas}
                documentos={documentos}
                directorioUsers={directorioUsers}
                currentUserId={userId}
                isAdminOrSupervisor={isAdminOrSupervisor}
                onCrearTarea={() => {
                  setTaskAEditar(null);
                  setTaskModalOpen(true);
                }}
                onEditarTarea={(t) => {
                  setTaskAEditar(t);
                  setTaskModalOpen(true);
                }}
                onCambiarEstado={handleCambiarEstadoTarea}
                onBorrarTarea={handleBorrarTarea}
                onAbrirComentarios={(t) => setTaskCommentsOpen(t)}
                onPrevisualizarDoc={handlePreview}
                onDescargarDoc={handleDownload}
              />
            ) : filtroActual === 'papelera' ? (
              <TrashView
                documentosBorrados={documentosBorrados}
                currentUserId={userId}
                isAdmin={isAdmin}
                directorioMap={directorioMap}
                onRestaurar={handleRestaurar}
                onEliminarPermanente={handleEliminarPermanente}
                onVaciarPapelera={handleVaciarPapelera}
              />
            ) : (
              <>
                {/* Sección de Subida */}
                <section>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold tracking-tight">Subir Documentos</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Sube uno o varios archivos (hasta 50 MB cada uno) a la carpeta seleccionada.
                    </p>
                  </div>
                  <UploadSection
                    userId={userId}
                    userEmail={userEmail}
                    carpetaActual={typeof filtroActual === 'string' && filtroActual !== 'favoritos' && filtroActual !== 'recientes' ? filtroActual : null}
                    onUploadComplete={fetchDocumentos}
                    addToast={addToast}
                  />
                </section>

                {/* Repositorio Documental con selector de vista */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">
                        {filtroActual === null
                          ? 'Todos los Documentos'
                          : filtroActual === 'favoritos'
                          ? 'Documentos Favoritos'
                          : filtroActual === 'recientes'
                          ? 'Documentos Recientes'
                          : filtroActual === 'sin_carpeta'
                          ? 'Documentos sin carpeta'
                          : `Carpeta: ${filtroActual}`}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Administra, busca y visualiza los archivos del equipo.
                      </p>
                    </div>

                    {/* Botones de cambio de vista */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm self-start sm:self-auto">
                      <button
                        onClick={() => cambiarVista('tarjetas')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          vistaModo === 'tarjetas'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Tarjetas</span>
                      </button>
                      <button
                        onClick={() => cambiarVista('tabla')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          vistaModo === 'tabla'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Table className="w-4 h-4" />
                        <span>Tabla</span>
                      </button>
                    </div>
                  </div>

                  {vistaModo === 'tarjetas' ? (
                    <CardGrid
                      documentos={documentosVisibles}
                      currentUserId={userId}
                      favoritosIds={favoritosIds}
                      directorioMap={directorioMap}
                      onToggleFavorito={handleToggleFavorito}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                      onRename={(doc) => setDocARenombrar(doc)}
                      onMove={(doc) => setDocAMover(doc)}
                      onDelete={handleSoftDelete}
                    />
                  ) : (
                    <DocumentList
                      documentos={documentosVisibles}
                      currentUserId={userId}
                      favoritosIds={favoritosIds}
                      directorioMap={directorioMap}
                      cargando={cargandoDocs}
                      onToggleFavorito={handleToggleFavorito}
                      onRefresh={fetchDocumentos}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                      onRename={(doc) => setDocARenombrar(doc)}
                      onMove={(doc) => setDocAMover(doc)}
                      onDelete={handleSoftDelete}
                    />
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Vista Previa */}
      <PreviewModal
        documento={docPreview}
        signedUrl={signedUrlPreview}
        onClose={() => setDocPreview(null)}
        onDownload={handleDownload}
      />

      {/* Modal de Cambiar Nombre */}
      <RenameModal
        documento={docARenombrar}
        onClose={() => setDocARenombrar(null)}
        onConfirm={handleConfirmRename}
      />

      {/* Modal de Mover a Carpeta */}
      <MoveFolderModal
        documento={docAMover}
        carpetas={Array.from(new Set(documentos.map((d) => d.carpeta).filter((c): c is string => Boolean(c))))}
        onClose={() => setDocAMover(null)}
        onConfirm={handleConfirmMove}
      />

      {/* Modal de Perfil */}
      {showProfileModal && (
        <ProfileModal
          userId={userId}
          userEmail={userEmail}
          nombreActual={nombrePerfilActual}
          onClose={() => setShowProfileModal(false)}
          onUpdateSuccess={fetchDirectorio}
          addToast={addToast}
        />
      )}

      {/* Modal de Crear / Editar Tarea */}
      {taskModalOpen && (
        <TaskModal
          tarea={taskAEditar}
          documentos={documentos}
          directorioUsers={directorioUsers}
          currentUserId={userId}
          onClose={() => {
            setTaskModalOpen(false);
            setTaskAEditar(null);
          }}
          onSave={handleSaveTask}
          addToast={addToast}
        />
      )}

      {/* Modal de Comentarios de Tarea */}
      {taskCommentsOpen && (
        <TaskCommentsModal
          tarea={taskCommentsOpen}
          currentUserId={userId}
          isAdmin={isAdmin}
          directorioUsers={directorioUsers}
          onClose={() => setTaskCommentsOpen(null)}
          addToast={addToast}
        />
      )}

      {/* Notificaciones Toast */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
