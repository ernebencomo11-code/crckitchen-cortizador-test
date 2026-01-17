
import React, { useState, useEffect } from 'react';
import { QuoteData, QuoteTemplate, LineItem, Terms } from '../types';
import { X, Save, Download, Trash2, FileText, Plus, CheckCircle2, History } from 'lucide-react';
import { generateId } from '../utils/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentData: QuoteData;
  onLoadTemplate: (budget: LineItem[], terms: Terms) => void;
}

export const TemplateModal: React.FC<Props> = ({ isOpen, onClose, currentData, onLoadTemplate }) => {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [view, setView] = useState<'list' | 'save'>('list');

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('quoteTemplates');
      if (saved) {
        try {
          setTemplates(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading templates");
        }
      }
      setView('list');
      setNewTemplateName('');
    }
  }, [isOpen]);

  const saveTemplatesToStorage = (newTemplates: QuoteTemplate[]) => {
    localStorage.setItem('quoteTemplates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleSave = () => {
    if (!newTemplateName.trim()) return;

    const newTemplate: QuoteTemplate = {
      id: generateId(),
      name: newTemplateName.toUpperCase(),
      createdAt: new Date().toISOString(),
      budget: currentData.budget,
      terms: currentData.terms
    };

    const updated = [...templates, newTemplate];
    saveTemplatesToStorage(updated);
    setView('list');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta plantilla permanentemente?')) {
      const updated = templates.filter(t => t.id !== id);
      saveTemplatesToStorage(updated);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-brand-dark/90 backdrop-blur-xl p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        
        <header className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-orange shadow-lg shadow-brand-dark/20">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter leading-none mb-1">Maestro de Plantillas</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estandarización de presupuestos comerciales</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-500 hover:text-brand-dark"
          >
            <X size={28} />
          </button>
        </header>

        <div className="p-10 max-h-[60vh] overflow-y-auto bg-[#F8FAFC]">
          {view === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                onClick={() => setView('save')}
                className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-gray-200 rounded-[32px] hover:border-brand-orange/40 hover:bg-orange-50 transition-all group"
               >
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-brand-orange group-hover:text-white transition-all">
                     <Plus size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-brand-orange">Guardar Actual como Plantilla</span>
               </button>

               {templates.map(t => (
                 <div 
                   key={t.id} 
                   className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all"
                 >
                    <div>
                       <h4 className="font-black text-brand-dark uppercase text-sm mb-1">{t.name}</h4>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.budget.length} conceptos técnicos</p>
                    </div>
                    <div className="mt-8 flex gap-2">
                       <button 
                        onClick={() => {
                          if(confirm(`¿Aplicar estructura de "${t.name}"?`)) {
                             onLoadTemplate(t.budget.map(b => ({...b, id: generateId()})), t.terms);
                             onClose();
                          }
                        }}
                        className="flex-1 py-3 bg-brand-dark text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                       >
                          <History size={14} /> Cargar Datos
                       </button>
                       <button 
                         onClick={(e) => handleDelete(e, t.id)} 
                         className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-8 py-10 animate-in zoom-in-95">
               <div className="text-center">
                  <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter mb-2">Crear Nueva Plantilla</h3>
                  <p className="text-xs text-gray-400 font-medium">Asigna un nombre para identificar este paquete</p>
               </div>
               <input 
                type="text" 
                autoFocus
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-brand-orange outline-none transition-all font-black text-lg text-center uppercase"
                placeholder="EJ. COCINA PREMIUM CANCÚN"
               />
               <div className="flex gap-3">
                  <button onClick={() => setView('list')} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-100 rounded-2xl">Volver</button>
                  <button 
                    onClick={handleSave}
                    disabled={!newTemplateName}
                    className="flex-[2] py-4 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-brand-orange/20 disabled:opacity-50"
                  >
                    Confirmar Guardado
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
