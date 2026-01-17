
import React, { useEffect, useRef, useState } from 'react';
import { X, Check, RotateCcw, RotateCw, Crop, FlipHorizontal as FlipH, FlipVertical as FlipV, Sun, Contrast, SlidersHorizontal, RefreshCcw } from 'lucide-react';

interface Props {
  imageUrl: string;
  onConfirm: (croppedUrl: string) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<Props> = ({ imageUrl, onConfirm, onClose }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<any>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [showCorrections, setShowCorrections] = useState(false);
  
  // Estados de imagen tipo PowerPoint
  const [brightness, setBrightness] = useState(100); // 100% es el original
  const [contrast, setContrast] = useState(100);
  const [sharpness, setSharpness] = useState(0);

  useEffect(() => {
    if (imageRef.current) {
      // @ts-ignore
      cropperRef.current = new Cropper(imageRef.current, {
        viewMode: 1,
        dragMode: 'move',
        responsive: true,
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready() {
          applyFiltersToCropper();
        }
      });
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, []);

  // Aplicar filtros visuales al contenedor del cropper en tiempo real
  const applyFiltersToCropper = () => {
    const cropperImages = document.querySelectorAll('.cropper-view-box img, .cropper-canvas img');
    const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${100 + sharpness}%)`;
    cropperImages.forEach((img: any) => {
      img.style.filter = filterString;
    });
  };

  useEffect(() => {
    applyFiltersToCropper();
  }, [brightness, contrast, sharpness]);

  const handleRotate = (deg: number) => cropperRef.current?.rotate(deg);
  const handleFlipH = () => cropperRef.current?.scaleX(cropperRef.current.getData().scaleX === 1 ? -1 : 1);
  const handleFlipV = () => cropperRef.current?.scaleY(cropperRef.current.getData().scaleY === 1 ? -1 : 1);
  
  const handleAspectRatio = (ratio: number | undefined) => {
    setAspectRatio(ratio);
    cropperRef.current?.setAspectRatio(ratio);
  };

  const handleConfirm = () => {
    if (!cropperRef.current) return;
    
    // Generamos el canvas base
    const canvas = cropperRef.current.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    // Aplicar los filtros de forma permanente al canvas final
    const ctx = canvas.getContext('2d');
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const finalCtx = finalCanvas.getContext('2d');
    
    if (finalCtx) {
      finalCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${100 + sharpness}%)`;
      finalCtx.drawImage(canvas, 0, 0);
      onConfirm(finalCanvas.toDataURL('image/png', 1.0));
      onClose();
    }
  };

  // Generar presets de corrección
  const brightnessPresets = [60, 80, 100, 120, 140]; // -40% a +40%
  const contrastPresets = [60, 80, 100, 120, 140];

  return (
    <div className="fixed inset-0 z-[200] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-white/20">
        
        {/* HEADER SUPERIOR */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center shadow-lg">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter leading-none mb-1">Editor Inteligente</h2>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Corrección de color y encuadre</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => { setBrightness(100); setContrast(100); setSharpness(0); }}
               className="p-2.5 text-gray-400 hover:text-brand-orange hover:bg-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase"
             >
               <RefreshCcw size={14} /> Restaurar
             </button>
             <div className="w-px h-6 bg-gray-200"></div>
             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400"><X size={24} /></button>
          </div>
        </div>

        {/* ÁREA DE TRABAJO */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
          <div className="max-w-full max-h-full">
            <img ref={imageRef} src={imageUrl} alt="Recortar" className="max-w-full block" />
          </div>

          {/* MENÚ DE CORRECCIONES (ESTILO POWERPOINT) */}
          {showCorrections && (
            <div className="absolute top-6 left-6 w-80 bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-left duration-300 z-50">
               <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark flex items-center gap-2">
                     <Sun size={14} className="text-brand-orange" /> Brillo y Contraste
                  </h4>
                  <button onClick={() => setShowCorrections(false)}><X size={16} className="text-gray-400" /></button>
               </div>
               
               <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                  <div className="grid grid-cols-5 gap-1.5">
                    {contrastPresets.map(c => (
                      brightnessPresets.map(b => (
                        <button 
                          key={`${b}-${c}`}
                          onClick={() => { setBrightness(b); setContrast(c); }}
                          className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${brightness === b && contrast === c ? 'border-brand-orange' : 'border-transparent'}`}
                        >
                           <img 
                            src={imageUrl} 
                            className="w-full h-full object-cover" 
                            style={{ filter: `brightness(${b}%) contrast(${c}%)` }}
                           />
                           {brightness === b && contrast === c && (
                             <div className="absolute inset-0 bg-brand-orange/20 flex items-center justify-center">
                                <Check size={12} className="text-white" />
                             </div>
                           )}
                        </button>
                      ))
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                     <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-4 text-center">Ajuste Manual de Nitidez</label>
                     <input 
                       type="range" min="0" max="100" value={sharpness}
                       onChange={(e) => setSharpness(parseInt(e.target.value))}
                       className="w-full accent-brand-orange h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase mt-2">
                        <span>Suave</span>
                        <span>{sharpness}%</span>
                        <span>Nítido</span>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* TOOLBAR INFERIOR */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-6">
            
            {/* Opciones de Formato */}
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setShowCorrections(!showCorrections)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${showCorrections ? 'bg-brand-orange border-brand-orange text-white' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-brand-orange/30'}`}
               >
                 <Sun size={16} /> Correcciones
               </button>
               <div className="w-px h-10 bg-gray-100 mx-1"></div>
               <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                  <button onClick={() => handleAspectRatio(undefined)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${aspectRatio === undefined ? 'bg-brand-dark text-white' : 'text-gray-400'}`}>Libre</button>
                  <button onClick={() => handleAspectRatio(1)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${aspectRatio === 1 ? 'bg-brand-dark text-white' : 'text-gray-400'}`}>1:1</button>
                  <button onClick={() => handleAspectRatio(16/9)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${aspectRatio === 16/9 ? 'bg-brand-dark text-white' : 'text-gray-400'}`}>16:9</button>
               </div>
            </div>

            {/* Transformaciones */}
            <div className="flex gap-2">
               <button onClick={() => handleRotate(-90)} className="p-3 bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange rounded-xl border border-gray-100 transition-all"><RotateCcw size={18} /></button>
               <button onClick={() => handleRotate(90)} className="p-3 bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange rounded-xl border border-gray-100 transition-all"><RotateCw size={18} /></button>
               <div className="w-px h-10 bg-gray-100 mx-1"></div>
               <button onClick={handleFlipH} className="p-3 bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange rounded-xl border border-gray-100 transition-all"><FlipH size={18} /></button>
               <button onClick={handleFlipV} className="p-3 bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange rounded-xl border border-gray-100 transition-all"><FlipV size={18} /></button>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3">
               <button onClick={onClose} className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-2xl">Cancelar</button>
               <button onClick={handleConfirm} className="flex items-center gap-3 px-10 py-4 bg-brand-dark text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-black shadow-xl shadow-brand-dark/20">
                 <Check size={20} /> Guardar Edición
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
