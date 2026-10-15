/**
 * Componente Principal (App.tsx) para GestiónDoc con soporte de carpetas, tarjetas y vistas
 */
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Documento, ToastMessage } from './types';
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
import { Toast } from './components/Toast';
import { LayoutGrid, Table } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargandoDocs, setCargandoDocs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Carpetas y Vistas
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string | null>(null);
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

  // Cargar carpetas vacías desde localStorage al iniciar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem('gestiondoc_carpetas_vacias');
      if (guardado) {
        setCarpetasLocales(JSON.parse(guardado));
      }
    } catch (err) {
      console.error('Error al leer carpetas de localStorage:', err);
    }
  }, []);

  // Guardar vista en localStorage con try/catch
  const cambiarVista = (nuevoModo: 'tarjetas' | 'tabla') => {
    setVistaModo(nuevoModo);
    try {
      localStorage.setItem('gestiondoc_vista', nuevoModo);
    } catch (err) {
      console.error('Error al guardar vista en localStorage:', err);
    }
  };

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

  // Verificar sesión al cargar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargandoSesion(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar documentos y configurar Realtime
  useEffect(() => {
    if (!session) return;

    fetchDocumentos();

    const canal = supabase
      .channel('public:documentos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documentos' },
        () => {
          fetchDocumentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [session]);

  const fetchDocumentos = async () => {
    setCargandoDocs(true);
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) {
        throw error;
      }
      setDocumentos(data || []);
    } catch (err: any) {
      console.error('Error al cargar documentos:', err);
      addToast('Error al cargar la lista de documentos.', 'error');
    } finally {
      setCargandoDocs(false);
    }
  };

  // Crear nueva carpeta (guardar en localStorage si está vacía)
  const handleCrearCarpeta = (nombre: string) => {
    if (carpetasLocales.includes(nombre)) {
      addToast('La carpeta ya existe.', 'info');
      return;
    }
    const nuevasCarpetas = [...carpetasLocales, nombre];
    setCarpetasLocales(nuevasCarpetas);
    try {
      localStorage.setItem('gestiondoc_carpetas_vacias', JSON.stringify(nuevasCarpetas));
      addToast(`Carpeta "${nombre}" creada.`, 'success');
    } catch (err) {
      console.error('Error al guardar carpeta en localStorage:', err);
    }
  };

  // Descargar documento con createSignedUrl (60 segundos)
  const handleDownload = async (doc: Documento) => {
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

  // Abrir vista previa
  const handlePreview = async (doc: Documento) => {
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

  // Cambiar nombre (actualiza solo la columna nombre)
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
      addToast(err?.message || 'Error al actualizar el nombre del documento.', 'error');
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

  // Borrar documento (solo propios)
  const handleDelete = async (doc: Documento) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([doc.ruta]);

      if (storageError) {
        console.error('Error al borrar en Storage:', storageError);
      }

      const { error: dbError } = await supabase
        .from('documentos')
        .delete()
        .eq('id', doc.id);

      if (dbError) {
        throw dbError;
      }

      addToast(`Documento "${doc.nombre}" eliminado con éxito.`, 'success');
      fetchDocumentos();
    } catch (err: any) {
      console.error('Error al borrar documento:', err);
      addToast(err?.message || 'Error al eliminar el documento.', 'error');
    }
  };

  // Toggle modo oscuro
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

  const userId = session.user.id;
  const userEmail = session.user.email || '';

  // Filtrar documentos según la carpeta seleccionada
  const documentosFiltradosCarpeta = documentos.filter((doc) => {
    if (carpetaSeleccionada === null) return true; // Todos
    if (carpetaSeleccionada === 'sin_carpeta') return !doc.carpeta; // Sin carpeta
    return doc.carpeta === carpetaSeleccionada;
  });

  // Lista de carpetas existentes para el modal de mover
  const carpetasExistentes = Array.from(
    new Set([
      ...documentos.map((d) => d.carpeta).filter((c): c is string => Boolean(c)),
      ...carpetasLocales,
    ])
  ).sort();

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${darkMode ? 'dark' : ''}`}>
      <Navbar
        userEmail={userEmail}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tarjetas de Resumen */}
        <SummaryCards documentos={documentos} currentUserId={userId} />

        {/* Layout principal con barra lateral de carpetas */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FolderSidebar
            documentos={documentos}
            carpetaSeleccionada={carpetaSeleccionada}
            onSelectCarpeta={setCarpetaSeleccionada}
            carpetasLocales={carpetasLocales}
            onCrearCarpeta={handleCrearCarpeta}
          />

          <div className="flex-1 w-full space-y-8 min-w-0">
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
                carpetaActual={carpetaSeleccionada}
                onUploadComplete={fetchDocumentos}
                addToast={addToast}
              />
            </section>

            {/* Repositorio Documental con selector de vista */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {carpetaSeleccionada === null
                      ? 'Todos los Documentos'
                      : carpetaSeleccionada === 'sin_carpeta'
                      ? 'Documentos sin carpeta'
                      : `Carpeta: ${carpetaSeleccionada}`}
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
                  documentos={documentosFiltradosCarpeta}
                  currentUserId={userId}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                  onRename={(doc) => setDocARenombrar(doc)}
                  onMove={(doc) => setDocAMover(doc)}
                  onDelete={handleDelete}
                />
              ) : (
                <DocumentList
                  documentos={documentosFiltradosCarpeta}
                  currentUserId={userId}
                  cargando={cargandoDocs}
                  onRefresh={fetchDocumentos}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                  onRename={(doc) => setDocARenombrar(doc)}
                  onMove={(doc) => setDocAMover(doc)}
                  onDelete={handleDelete}
                />
              )}
            </section>
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
        carpetas={carpetasExistentes}
        onClose={() => setDocAMover(null)}
        onConfirm={handleConfirmMove}
      />

      {/* Notificaciones Toast */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
