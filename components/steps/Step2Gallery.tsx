
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { QuoteData, QuoteImage } from '../../types';
import { IMAGE_CATEGORIES } from '../../constants';
import { Upload, X, ImageIcon, Clipboard, Loader2, Crop, GripVertical, MousePointer2 } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { ImageCropperModal } from '../ImageCropperModal';

interface Props {
  data: QuoteData;
  updateData: (data: Partial<QuoteData>) => void;
}

export const Step2Gallery: React.FC<Props> = ({ data, updateData }) => {
  const [isPasting, setIsPasting] = useState(false);
  const [editingImage, setEditingImage] = useState<QuoteImage | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragNode = useRef<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: QuoteImage[] = Array.from(e.target.files).map((file: any) => ({
        id: generateId(),
        url: URL.createObjectURL(file),
        category: 'Render',
        title: file.name.split('.')[0],
      }));
      updateData({ gallery: [...data.gallery, ...newImages] });
    }
  };

  const handleRemoveImage = (id: string) => {
    updateData({ gallery: data.gallery.filter(img => img.id !== id) });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    dragNode.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newGallery = [...data.gallery];
    const itemToMove = newGallery.splice(draggedIndex, 1)[0];
    newGallery.splice(index, 0, itemToMove);
    setDraggedIndex(index);
    updateData({ gallery: newGallery });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragNode.current = null;
  };

  const handleCategoryChange = (id: string, category: QuoteImage['category']) => {
    const updatedGallery = data.gallery.map(img => img.id === id ? { ...img, category } : img);
    updateData({ gallery: updatedGallery });
  };

  const handleCropComplete = (croppedUrl: string) => {
    if (!editingImage) return;
    const updatedGallery = data.gallery.map(img => img.id === editingImage.id ? { ...img, url: croppedUrl } : img);
    updateData({ gallery: updatedGallery });
    setEditingImage(null);
  };

  const processClipboardItems = useCallback((items: DataTransferItemList) => {
    let imageFound = false;
    const newImages: QuoteImage[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          imageFound = true;
          newImages.push({ id: generateId(), url: URL.createObjectURL(blob), category: 'Plano', title: `Plano Importado ${new Date().toLocaleTimeString()}`});
        }
      }
    }
    if (imageFound) {
      setIsPasting(true);
      setTimeout(() => { updateData({ gallery: [...data.gallery, ...newImages] }); setIsPasting(false); }, 600);
    }
  }, [data.gallery, updateData]);

  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.clipboardData && e.clipboardData.items) processClipboardItems(e.clipboardData.items);
    };
    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [processClipboardItems]);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-24">
      <div className="mb-8 sm:mb-12 text-center">
         <h2 className="text-2xl sm:text-3xl font-black text-brand-dark uppercase tracking-tighter mb-2">Diseño y Planimetría</h2>
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em]">Arrastra para organizar el PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border-2 border-dashed border-gray-100 hover:border-brand-orange/40 transition-all text-center relative group shadow-sm">
          <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="pointer-events-none"><div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors"><Upload size={32} /></div><h3 className="text-base sm:text-lg font-black text-brand-dark uppercase tracking-tight">Cargar Renders</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Explorar archivos</p></div>
        </div>
        <div className={`p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border-2 border-brand-orange/20 transition-all text-center relative group shadow-sm ${isPasting ? 'bg-brand-orange/10 scale-95' : 'bg-orange-50/30'}`}>
          <div className="flex flex-col items-center justify-center h-full"><div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 transition-all ${isPasting ? 'bg-brand-orange text-white rotate-12' : 'bg-white text-brand-orange shadow-md'}`}>{isPasting ? <Loader2 size={32} className="animate-spin" /> : <Clipboard size={32} />}</div><h3 className="text-base sm:text-lg font-black text-brand-dark uppercase tracking-tight">Importar de AutoCAD</h3><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Copia y Pega (Ctrl + V)</p></div>
        </div>
      </div>

      <div className="space-y-8">
        {data.gallery.length === 0 ? (
          <div className="bg-white rounded-[32px] sm:rounded-[40px] p-12 sm:p-24 text-center border border-gray-100 shadow-inner">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><ImageIcon className="text-slate-200" size={48} /></div><p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Sin elementos visuales</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {data.gallery.map((img, index) => (
              <div key={img.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className={`bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 cursor-grab active:cursor-grabbing ${draggedIndex === index ? 'opacity-40 scale-95 border-brand-orange border-2' : 'hover:shadow-2xl hover:-translate-y-1'}`}>
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
                  <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"><button onClick={() => setEditingImage(img)} className="p-3 bg-white text-brand-dark rounded-2xl hover:bg-brand-orange hover:text-white transition-all shadow-xl" title="Editar"><Crop size={18} /></button><button onClick={() => handleRemoveImage(img.id)} className="p-3 bg-white text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl" title="Eliminar"><X size={18} /></button></div>
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none"><GripVertical size={20} /></div>
                  <div className="absolute top-4 left-4 flex gap-2"><div className="bg-brand-dark text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg border border-white/10 uppercase tracking-widest">Posición {index + 1}</div></div>
                  {img.category === 'Plano' && (<div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">CAD</div>)}
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: data.gallery[index].category === 'Plano' ? '#10b981' : '#FF6B35' }}></div><span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-[0.2em]">{img.category}</span></div>
                  <div className="space-y-3"><select value={img.category} onChange={(e) => handleCategoryChange(img.id, e.target.value as any)} className="w-full text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-brand-orange uppercase cursor-pointer outline-none">{IMAGE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select><input type="text" value={img.title} onChange={(e) => { const newGallery = [...data.gallery]; newGallery[index].title = e.target.value; updateData({ gallery: newGallery }); }} className="w-full text-[11px] font-bold text-slate-800 bg-white border border-slate-100 rounded-xl px-4 py-2.5 focus:border-brand-orange outline-none transition-all uppercase placeholder:text-slate-300" placeholder="Nombre..." /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 p-6 sm:p-8 bg-white rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 sm:gap-8 text-center md:text-left">
         <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-orange/10 rounded-[24px] flex items-center justify-center shrink-0"><MousePointer2 className="text-brand-orange animate-bounce" size={28} /></div>
         <div><h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 text-slate-900">Control de Secuencia</h4><p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">Arrastra cualquier tarjeta para reordenar la secuencia de imágenes en tu cotización PDF.</p></div>
      </div>

      {editingImage && (<ImageCropperModal imageUrl={editingImage.url} onConfirm={handleCropComplete} onClose={() => setEditingImage(null)} />)}
    </div>
  );
};
