
import React from 'react';
import { QuoteVersion, QuoteData } from '../types';
import { X, History, RotateCcw, Trash2, Calendar, DollarSign, StickyNote } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  versions: QuoteVersion[];
  onRevert: (version: QuoteVersion) => void;
  onDelete: (id: string) => void;
}

export const VersionHistoryModal: React.FC<Props> = ({ isOpen, onClose, versions, onRevert, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-brand-dark/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-orange shadow-lg shadow-brand-dark/20">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Historial de Versiones</h2>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-widest text-[10px]">Puntos de restauración del proyecto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {versions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300 opacity-50">
              <History size={64} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-sm">No hay versiones guardadas aún</p>
              <p className="text-xs text-center mt-2 max-w-xs">Las versiones se guardan cuando realizas cambios significativos o manualmente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...versions].reverse().map((v) => (
                <div key={v.id} className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:border-brand-orange/50 hover:shadow-xl hover:shadow-brand-orange/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-brand-dark uppercase tracking-tight text-sm">
                          {new Date(v.timestamp).toLocaleString('es-MX', { 
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                        {v.total > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {formatCurrency(v.total, v.data.currency)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-start gap-2 text-xs text-gray-400 font-medium">
                        <StickyNote size={12} className="mt-0.5 flex-shrink-0" />
                        <span className="italic">"{v.note || 'Sin descripción'}"</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onRevert(v)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                    >
                      <RotateCcw size={14} /> Revertir
                    </button>
                    <button 
                      onClick={() => onDelete(v.id)}
                      className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Revertir una versión reemplazará los datos actuales por los guardados en esa fecha.
          </p>
        </div>
      </div>
    </div>
  );
};
