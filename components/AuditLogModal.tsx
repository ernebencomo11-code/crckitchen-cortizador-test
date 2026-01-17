
import React from 'react';
import { AuditEntry } from '../types';
import { X, History, User, Clock, Calendar, CheckCircle2, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditEntry[];
  quoteNumber: string;
}

export const AuditLogModal: React.FC<Props> = ({ isOpen, onClose, auditLog, quoteNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-orange shadow-lg shadow-brand-dark/20">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Bitácora de Cambios</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registro de actividad de {quoteNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-500">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide bg-[#F9FAFB]">
          {auditLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <Info size={40} />
               </div>
               <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">Sin historial registrado</h3>
               <p className="text-xs text-gray-400 mt-2 max-w-xs uppercase font-bold tracking-widest">Las acciones futuras se registrarán automáticamente aquí.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Línea central */}
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-200"></div>

              <div className="space-y-10">
                {auditLog.map((entry, idx) => (
                  <div key={entry.id} className="relative pl-16 group">
                    {/* Punto de la línea de tiempo */}
                    <div className={`absolute left-[20px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-md z-10 transition-transform group-hover:scale-150 ${idx === 0 ? 'bg-brand-orange ring-4 ring-brand-orange/20' : 'bg-gray-300'}`}></div>
                    
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group-hover:shadow-lg group-hover:border-brand-orange/30 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-brand-dark font-black text-xs uppercase group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                              {entry.userName.charAt(0)}
                           </div>
                           <div>
                              <p className="text-xs font-black text-brand-dark uppercase tracking-tight leading-none">{entry.userName}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Colaborador</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(entry.timestamp).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                           <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(entry.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                         <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                         <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight leading-relaxed">{entry.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
             Este registro es inmutable y sirve para fines de auditoría interna.
           </p>
        </div>
      </div>
    </div>
  );
};
