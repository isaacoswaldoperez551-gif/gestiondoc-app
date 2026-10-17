/**
 * Componente Principal (App.tsx) para GestiónDoc
 */
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { CarpetaSeleccion, Documento, ToastMessage } from './types';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { DocumentList } from './components/DocumentList';
import { PreviewModal } from './components/PreviewModal';
import { Toast } from './components/Toast';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargandoDocs, setCargandoDocs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Carpetas
  const [carpetaActual, setCarpetaActual] = useState<CarpetaSeleccion>('todas');
  const [carpetasLocales, setCarpetasLocales] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('gd_carpetas') || '[]');
    } catch {
      return [];
    }
  });
  const [miniaturas, setMiniaturas] = useState<Record<string, string>>({});

  // Estado para vista previa
  const [docPreview, setDocPreview] = useState<Documento | null>(null);
  const [signedUrlPreview, setSignedUrlPreview] = useState<string | null>(null);

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

    // Supabase Realtime sobre la tabla documentos
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

  // Lista de carpetas = las que usan los documentos + las creadas y aún vacías
  const carpetas = useMemo(() => {
    const set = new Set<string>(carpetasLocales);
    documentos.forEach((d) => d.carpeta && set.add(d.carpeta));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [documentos, carpetasLocales]);

  // Miniaturas de imágenes (enlaces temporales de 1 hora)
  useEffect(() => {
    const pendientes = documentos.filter((d) => d.tipo === 'imagen' && !miniaturas[d.id]);
    if (pendientes.length === 0) return;
    let cancelado = false;
    supabase.storage
      .from('documentos')
      .createSignedUrls(
        pendientes.map((d) => d.ruta),
        3600
      )
      .then(({ data }) => {
        if (cancelado || !data) return;
        const nuevas: Record<string, string> = {};
        data.forEach((item) => {
          const doc = pendientes.find((d) => d.ruta === item.path);
          if (doc && item.signedUrl) nuevas[doc.id] = item.signedUrl;
        });
        setMiniaturas((prev) => ({ ...prev, ...nuevas }));
      });
    return () => {
      cancelado = true;
    };
  }, [documentos]);

  const handleCrearCarpeta = (nombre: string) => {
    const existente = carpetas.find((c) => c.toLowerCase() === nombre.toLowerCase());
    if (existente) {
      setCarpetaActual(existente);
      return;
    }
    const nuevas = [...carpetasLocales, nombre];
    setCarpetasLocales(nuevas);
    try {
      localStorage.setItem('gd_carpetas', JSON.stringify(nuevas));
    } catch {
      /* sin almacenamiento */
    }
    setCarpetaActual(nombre);
    addToast(`Carpeta "${nombre}" creada.`, 'success');
  };

  // Cambiar nombre (solo el nombre que se muestra; el archivo en Storage no cambia)
  const handleRename = async (doc: Documento, nombre: string) => {
    const { data, error } = await supabase
      .from('documentos')
      .update({ nombre })
      .eq('id', doc.id)
      .select('id');
    if (error || !data || data.length === 0) {
      addToast(error?.message || 'No tienes permiso para cambiar el nombre. Revisa los permisos en Supabase.', 'error');
      return;
    }
    addToast('Nombre actualizado.', 'success');
    fetchDocumentos();
  };

  const handleMove = async (doc: Documento, carpeta: string | null) => {
    const { data, error } = await supabase
      .from('documentos')
      .update({ carpeta })
      .eq('id', doc.id)
      .select('id');
    if (error || !data || data.length === 0) {
      addToast(
        error?.message || 'No se pudo mover. Falta ejecutar el SQL de carpetas en Supabase.',
        'error'
      );
      return;
    }
    addToast(carpeta ? `Movido a "${carpeta}".` : 'Movido a "Sin carpeta".', 'success');
    fetchDocumentos();
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

      // Abrir o descargar mediante enlace temporal
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

  // Borrar documento (solo propios)
  const handleDelete = async (doc: Documento) => {
    try {
      // 1. Borrar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([doc.ruta]);

      if (storageError) {
        console.error('Error al borrar en Storage:', storageError);
      }

      // 2. Borrar fila de la tabla
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

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${darkMode ? 'dark' : ''}`}>
      <Navbar
        userEmail={userEmail}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sección de Subida */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight">Subir Documentos</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sube uno o varios archivos (hasta 50 MB cada uno) al repositorio compartido.
              {carpetaActual !== 'todas' && carpetaActual !== '__sin__' && (
                <> Se guardarán en la carpeta <strong>{carpetaActual}</strong>.</>
              )}
            </p>
          </div>
          <UploadSection
            userId={userId}
            userEmail={userEmail}
            carpeta={carpetaActual !== 'todas' && carpetaActual !== '__sin__' ? carpetaActual : null}
            onUploadComplete={fetchDocumentos}
            addToast={addToast}
          />
        </section>

        {/* Lista de Documentos */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight">Repositorio Documental</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Todos los documentos subidos por el equipo, ordenados por fecha de creación.
            </p>
          </div>
          <DocumentList
            documentos={documentos}
            currentUserId={userId}
            cargando={cargandoDocs}
            miniaturas={miniaturas}
            carpetas={carpetas}
            carpetaActual={carpetaActual}
            onCarpetaChange={setCarpetaActual}
            onCrearCarpeta={handleCrearCarpeta}
            onRename={handleRename}
            onMove={handleMove}
            onRefresh={fetchDocumentos}
            onDownload={handleDownload}
            onPreview={handlePreview}
            onDelete={handleDelete}
          />
        </section>
      </main>

      {/* Modal de Vista Previa */}
      <PreviewModal
        documento={docPreview}
        signedUrl={signedUrlPreview}
        onClose={() => setDocPreview(null)}
        onDownload={handleDownload}
      />

      {/* Notificaciones Toast */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
