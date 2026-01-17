
import React, { useState } from 'react';
import { Category } from '../types';
import { X, Plus, Edit3, Trash2, Save, Layers, Utensils, Bath, DoorOpen, Home, Armchair, Check, AlertTriangle } from 'lucide-react';
import { generateId } from '../utils/helpers';

interface Props {
  categories: Category[];
  onUpdateCategories: (newCats: Category[]) => void;
  onClose: () => void;
}

const ICON_OPTIONS = [
  { id: 'Utensils', icon: Utensils, label: 'Cocina' },
  { id: 'Bath', icon: Bath, label: 'Baño' },
  { id: 'DoorOpen', icon: DoorOpen, label: 'Closet' },
  { id: 'Layers', icon: Layers, label: 'Mixto' },
  { id: 'Home', icon: Home, label: 'Residencial' },
  { id: 'Armchair', icon: Armchair, label: 'Mobiliario' }
] as const;

export const CategoryManager: React.FC<Props> = ({ categories, onUpdateCategories, onClose }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({ name: '', icon: 'Layers', isActive: true });

  const handleSave = () => {
    if (!formData.name) return;

    if (editingId) {
      const updated = categories.map(c => c.id === editingId ? { ...c, ...formData as Category } : c);
      onUpdateCategories(updated);
    } else {
      const newCat: Category = {
        id: generateId(),
        name: formData.name.toUpperCase(),
        icon: (formData.icon as any) || 'Layers',
        isActive: true
      };
      onUpdateCategories([...categories, newCat]);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', icon: 'Layers', isActive: true });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData(cat);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este tipo de proyecto? Las cotizaciones existentes mantendrán su nombre pero no aparecerán en los filtros de búsqueda rápida.')) {
      onUpdateCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-brand-dark/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-white/20">
        
        <header className="p-4 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-orange shadow-lg shadow-brand-dark/20">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-brand-dark uppercase tracking-tighter leading-none mb-1">Tipos de Proyectos</h2>
              <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Catálogo de categorías comerciales</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsAdding(true)} 
              className="flex items-center gap-2 p-3 md:px-6 md:py-3 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              <Plus size={16} /> <span className="hidden md:inline">NUEVO TIPO</span>
            </button>
            <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-500">
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => {
              const IconComp = ICON_OPTIONS.find(o => o.id === cat.icon)?.icon || Layers;
              return (
                <div key={cat.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-orange">
                      <IconComp size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-brand-dark uppercase text-sm">{cat.name}</h3>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Icono: {cat.icon}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(cat)} className="p-2 text-gray-400 hover:text-brand-dark transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isAdding && (
          <div className="fixed inset-0 z-[300] bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter">
                    {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                 </h3>
                 <button onClick={resetForm} className="text-gray-400 hover:text-brand-dark"><X size={24} /></button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Comercial</label>
                  <input 
                    type="text" 
                    autoFocus 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-black text-brand-dark text-lg" 
                    placeholder="EJ. LAVANDERÍAS" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Icono Representativo</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ICON_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({...formData, icon: opt.id as any})}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${formData.icon === opt.id ? 'bg-brand-dark border-brand-dark text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                      >
                        <opt.icon size={20} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={resetForm} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest">Cancelar</button>
                  <button 
                    onClick={handleSave} 
                    disabled={!formData.name} 
                    className="flex-[2] py-5 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-brand-orange/20"
                  >
                    <Save size={20} className="inline mr-2" /> {editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
