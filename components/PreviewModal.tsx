
import React, { useState, useEffect } from 'react';
import { QuoteData, Branding, PreviewSettings } from '../types';
import { PDFRenderer } from './PDFRenderer';
import { X, FileDown, Eye, Maximize2, Minimize2, Download, ExternalLink, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: QuoteData;
  updateData: (data: Partial<QuoteData>) => void;
  branding: Branding;
  onDownload: () => void;
  isGenerating: boolean;
}

export const PreviewModal: React.FC<Props> = ({ isOpen, onClose, data, updateData, branding, onDownload, isGenerating }) => {
  const [zoom, setZoom] = useState(0.85);
  
  const settings: PreviewSettings = data.previewSettings || branding.pdfSettings || {
    theme: 'modern', baseFontSize: 12, accentColor: branding.primaryColor, secondaryColor: branding.secondaryColor, backgroundColor: '#FFFFFF',
    gradientBackground: false, titleFont: 'Inter', borderRadius: 16, borderWidth: 1, headerOpacity: 1,
    showGallery: true, showBudget: true, showTerms: true, showDescriptions: true, showCover: true
  };

  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth < 768;
      setZoom(isMobile ? 0.45 : 0.85);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/95 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-300">
      <div 
        className="bg-gray-100 w-full h-full sm:max-w-[98vw] sm:h-[95vh] rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        <header className="bg-white px-4 sm:px-10 py-4 sm:py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-orange p-2.5 rounded-xl text-white shadow-lg shadow-brand-orange/20"><Eye size={20} /></div>
            <div>
              <h3 className="font-black text-brand-dark uppercase tracking-tighter text-sm leading-none">Vista Previa</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate max-w-xs">A4 Printable • {data.project.quoteNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6 w-full md:w-auto">
             <div className="flex bg-gray-100 p-1.5 rounded-2xl items-center gap-2 border border-gray-200 shadow-inner">
                <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-2 bg-white hover:bg-gray-50 rounded-xl text-gray-500"><Minimize2 size={16} /></button>
                <span className="text-[11px] font-black text-brand-dark w-14 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 bg-white hover:bg-gray-50 rounded-xl text-gray-500"><Maximize2 size={16} /></button>
             </div>

             <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

             <button onClick={onDownload} disabled={isGenerating} className="flex-1 md:flex-initial flex items-center justify-center gap-3 px-4 sm:px-8 py-3.5 bg-brand-dark text-white rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-brand-dark/20 disabled:opacity-50">
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} <span className="hidden sm:inline">GENERAR PDF</span>
             </button>

             <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-400 transition-all"><X size={24} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8 md:p-12 scrollbar-hide flex justify-center items-start bg-slate-200/50">
          <div className="preview-canvas shadow-[0_0_100px_rgba(0,0,0,0.15)] origin-top transition-transform duration-500 bg-white" style={{ transform: `scale(${zoom})` }}>
             <PDFRenderer data={{...data, previewSettings: settings}} updateData={updateData} branding={branding} isPreview={true} isEditMode={false} />
          </div>
        </div>

        <footer className="px-4 sm:px-10 py-4 bg-white border-t border-gray-200 flex justify-between items-center text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">
           <div className="flex items-center gap-2 sm:gap-4"><span className="truncate">Folio: {data.project.quoteNumber}</span><span className="opacity-30 hidden sm:inline">•</span><span className="hidden sm:inline">Tema: {settings.theme}</span></div>
           <div className="flex items-center gap-2"><ExternalLink size={12} className="text-brand-orange" /><span className="hidden sm:inline">Generado via CR Kitchen Cloud</span></div>
        </footer>
      </div>
    </div>
  );
};
