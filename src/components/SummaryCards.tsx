/**
 * Tarjetas de resumen del repositorio documental
 */
import React from 'react';
import { Documento } from '../types';
import { formatearTamano } from '../utils';
import { FileText, HardDrive, UserCheck } from 'lucide-react';

interface SummaryCardsProps {
  documentos: Documento[];
  currentUserId: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ documentos, currentUserId }) => {
  const totalDocumentos = documentos.length;
  const espacioTotal = documentos.reduce((acc, doc) => acc + (doc.tamano || 0), 0);
  const misDocumentos = documentos.filter((doc) => doc.subido_por === currentUserId).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Documentos
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {totalDocumentos}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
          <HardDrive className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Espacio Total
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {formatearTamano(espacioTotal)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Subidos por Ti
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {misDocumentos}
          </p>
        </div>
      </div>
    </div>
  );
};
