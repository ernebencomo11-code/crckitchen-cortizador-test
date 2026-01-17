
import React, { useState } from 'react';
import { Branding, PreviewSettings, QuoteData } from '../types';
import { PDFRenderer } from './PDFRenderer';
import { 
  X, Save, Palette, Type, Layout, Eye, Wand2, Layers, 
  Minimize2, Maximize2, Sliders, CheckCircle2, FileText, 
  Monitor, MousePointer2, Settings2, Columns, Square, 
  Grid3X3, Type as TypeIcon, Droplets
} from 'lucide-react';
import { DEFAULT_QUOTE } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branding: Branding;
  onSave: (newSettings: PreviewSettings) => void;
}

export const PDFSettingsModal: React.FC<Props> = ({ isOpen, onClose, branding, onSave }) => {
  const [activeSlide, setActiveSlide] = useState<'cover' | 'gallery' | 'budget' | 'terms'>('cover');
  const [activeTab, setActiveTab] = useState<'design' | 'format' | 'pages'>('design');
  const [zoom, setZoom] = useState(0.35);
  
  const [isPagesOpen, setPagesOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<PreviewSettings>(branding.pdfSettings || {
    theme: 'modern',
    baseFontSize: 12,
    accentColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    backgroundColor: '#FFFFFF',
    gradientBackground: false,
    titleFont: 'Inter',
    borderRadius: 16,
    borderWidth: 1,
    headerOpacity: 1,
    showGallery: true,
    showBudget: true,
    showTerms: true,
    showDescriptions: true,
    showCover: true
  });

  const demoData: QuoteData = {
    ...DEFAULT_QUOTE,
    client: { name: 'CLIENTE EJEMPLO PRO', email: 'pro@crkitchen.com', phone: '998-123-456', address: 'Zona Hotelera, Cancún' },
    project: { ...DEFAULT_QUOTE.project, quoteNumber: 'QT-MASTER-2024', name: 'PENTHOUSE RIVIERA' }
  };

  if (!isOpen) return null;

  const updateSetting = (key: keyof PreviewSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const fonts = ['Inter', 'Playfair Display', 'Montserrat', 'Roboto Mono'];
  const themes = [
    { id: 'modern', name: 'Modern Clean' },
    { id: 'executive_noir', name: 'Executive Noir' },
    { id: 'industrial', name: 'Industrial Grid' },
    { id: 'minimal', name: 'Pure Minimal' }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-brand-dark/98 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-[99vw] h-[96vh] rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col border border-white/10 text-white">
        
        <header className="h-20 md:h-16 flex-shrink-0 bg-[#252525] border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
           <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-brand-orange rounded-lg text-white shadow-lg shadow-brand-orange/20"><Monitor size={16} /></div>
                 <h2 className="hidden sm:block text-[11px] font-black uppercase tracking-widest">CR Design Studio</h2>
              </div>
              <div className="h-4 w-px bg-white/10 hidden lg:block"></div>
              <div className="hidden lg:flex bg-black/40 p-1 rounded-xl">
                 <button onClick={() => setActiveTab('pages')} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === 'pages' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Estructura</button>
                 <button onClick={() => setActiveTab('design')} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === 'design' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Diseño Maestro</button>
                 <button onClick={() => setActiveTab('format')} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === 'format' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Formato</button>
              </div>
           </div>

            <div className="flex lg:hidden items-center gap-2">
                <button onClick={() => setPagesOpen(true)} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl text-[9px] font-black uppercase"><Layers size={14} /> Páginas</button>
                <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl text-[9px] font-black uppercase"><Sliders size={14} /> Ajustes</button>
            </div>

           <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                 <button onClick={() => setZoom(Math.max(0.1, zoom - 0.05))} className="p-1 text-white/40 hover:text-white"><Minimize2 size={14} /></button>
                 <span className="text-[10px] font-mono text-brand-orange w-10 text-center">{Math.round(zoom * 100)}%</span>
                 <button onClick={() => setZoom(Math.min(1, zoom + 0.05))} className="p-1 text-white/40 hover:text-white"><Maximize2 size={14} /></button>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-all"><X size={18} /></button>
           </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          
          {(isPagesOpen || isSettingsOpen) && <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => { setPagesOpen(false); setSettingsOpen(false); }} />}

          <aside className={`absolute lg:static top-0 bottom-0 left-0 z-30 w-64 lg:w-56 flex-shrink-0 bg-[#252525] border-r border-white/5 flex flex-col p-4 space-y-4 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out ${isPagesOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
             <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 ml-1">Páginas del Documento</label>
             {[
               { id: 'cover', label: '01. Portada', visible: settings.showCover },
               { id: 'gallery', label: '02. Renders', visible: settings.showGallery },
               { id: 'budget', label: '03. Inversión', visible: settings.showBudget },
               { id: 'terms', label: '04. Legal', visible: settings.showTerms }
             ].map((slide) => (
               <button 
                key={slide.id}
                onClick={() => { setActiveSlide(slide.id as any); setPagesOpen(false); }}
                className={`group relative w-full aspect-[3/4] rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 overflow-hidden ${activeSlide === slide.id ? 'border-brand-orange bg-brand-orange/5' : 'border-white/5 bg-black/20 hover:border-white/20'}`}
               >
                  <div className={`text-[8px] font-black uppercase tracking-tighter mb-1 ${activeSlide === slide.id ? 'text-brand-orange' : 'text-white/40'}`}>{slide.label}</div>
                  <div className="w-full flex-1 bg-white/5 rounded-md border border-white/5 group-hover:bg-white/10 transition-colors flex items-center justify-center">
                     {!slide.visible && <X size={20} className="text-red-500/40" />}
                  </div>
                  {activeSlide === slide.id && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full animate-pulse" />}
               </button>
             ))}
          </aside>

          <main className="flex-1 bg-[#121212] overflow-auto p-4 md:p-12 scrollbar-hide flex justify-center items-start">
             <div 
              className="shadow-[0_40px_100px_rgba(0,0,0,0.6)] origin-top transition-transform duration-500 bg-white"
              style={{ transform: `scale(${zoom})` }}
             >
                <PDFRenderer 
                  data={{...demoData, previewSettings: settings}} 
                  branding={branding} 
                  isPreview={true}
                  isEditMode={false}
                />
             </div>
          </main>

          <aside className={`absolute lg:static top-0 bottom-0 right-0 z-30 w-80 flex-shrink-0 bg-[#252525] border-l border-white/5 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                   <Settings2 size={14} className="text-brand-orange" /> Panel de Formato
                </h3>
                <button onClick={() => setSettingsOpen(false)} className="lg:hidden p-1.5 bg-white/5 rounded-lg"><X size={16} /></button>
             </div>
             
             <div className="flex lg:hidden bg-black/40 p-1 rounded-xl m-4">
                 <button onClick={() => setActiveTab('pages')} className={`flex-1 px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === 'pages' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Estructura</button>
                 <button onClick={() => setActiveTab('design')} className={`flex-1 px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === 'design' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Diseño</button>
                 <button onClick={() => setActiveTab('format')} className={`flex-1 px-4 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === 'format' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Formato</button>
              </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {activeTab === 'design' && (
                  <>
                    <section className="space-y-4">
                       <label className="text-[8px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2"><Palette size={12} /> Temas Maestros</label>
                       <div className="grid grid-cols-1 gap-2">
                          {themes.map(t => (
                            <button 
                              key={t.id}
                              onClick={() => updateSetting('theme', t.id)}
                              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${settings.theme === t.id ? 'border-brand-orange bg-brand-orange/10' : 'border-white/5 bg-black/20 hover:bg-black/40'}`}
                            >
                               <div className={`text-[10px] font-black uppercase ${settings.theme === t.id ? 'text-white' : 'text-white/40'}`}>{t.name}</div>
                            </button>
                          ))}
                       </div>
                    </section>
                    <section className="space-y-4">
                       <label className="text-[8px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2"><TypeIcon size={12} /> Tipografía</label>
                       <div className="grid grid-cols-1 gap-2">
                          {fonts.map(f => (
                            <button 
                              key={f}
                              onClick={() => updateSetting('titleFont', f)}
                              className={`w-full p-3 rounded-xl border-2 text-left transition-all ${settings.titleFont === f ? 'border-brand-orange bg-brand-orange/10' : 'border-white/5 bg-black/20'}`}
                              style={{ fontFamily: f }}
                            >
                               <div className={`text-xs ${settings.titleFont === f ? 'text-white' : 'text-white/40'}`}>{f}</div>
                            </button>
                          ))}
                       </div>
                    </section>
                  </>
                )}
                {activeTab === 'format' && (
                  <>
                    <section className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-widest flex justify-between">Color Acento <span className="text-brand-orange">{settings.accentColor}</span></label>
                          <div className="flex gap-2">
                             <input type="color" value={settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} className="w-10 h-10 border-none cursor-pointer bg-transparent" />
                             <input type="text" value={settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-lg text-white font-mono text-xs px-3" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-widest flex justify-between">Color Secundario <span className="text-white/40">{settings.secondaryColor}</span></label>
                          <div className="flex gap-2"><input type="color" value={settings.secondaryColor} onChange={(e) => updateSetting('secondaryColor', e.target.value)} className="w-10 h-10 border-none cursor-pointer bg-transparent" /><input type="text" value={settings.secondaryColor} onChange={(e) => updateSetting('secondaryColor', e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-lg text-white font-mono text-xs px-3" /></div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-widest flex justify-between">Color de Página <span className="text-white/40">{settings.backgroundColor}</span></label>
                          <div className="flex gap-2"><input type="color" value={settings.backgroundColor} onChange={(e) => updateSetting('backgroundColor', e.target.value)} className="w-10 h-10 border-none cursor-pointer bg-transparent" /><input type="text" value={settings.backgroundColor} onChange={(e) => updateSetting('backgroundColor', e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-lg text-white font-mono text-xs px-3" /></div>
                       </div>
                    </section>
                    <section className="space-y-6">
                       <div><label className="text-[8px] font-black text-white/30 uppercase tracking-widest">Radio de Bordes: {settings.borderRadius}px</label><input type="range" min="0" max="40" value={settings.borderRadius} onChange={(e) => updateSetting('borderRadius', Number(e.target.value))} className="w-full accent-brand-orange h-1 bg-black/40 rounded-lg appearance-none cursor-pointer" /></div>
                       <div><label className="text-[8px] font-black text-white/30 uppercase tracking-widest">Opacidad de Header: {settings.headerOpacity * 100}%</label><input type="range" min="0" max="1" step="0.1" value={settings.headerOpacity} onChange={(e) => updateSetting('headerOpacity', Number(e.target.value))} className="w-full accent-brand-orange h-1 bg-black/40 rounded-lg appearance-none cursor-pointer" /></div>
                       <div><label className="text-[8px] font-black text-white/30 uppercase tracking-widest">Tamaño de Texto: {settings.baseFontSize}px</label><input type="range" min="8" max="16" value={settings.baseFontSize} onChange={(e) => updateSetting('baseFontSize', Number(e.target.value))} className="w-full accent-brand-orange h-1 bg-black/40 rounded-lg appearance-none cursor-pointer" /></div>
                    </section>
                  </>
                )}
                {activeTab === 'pages' && (
                  <section className="space-y-3">
                    <label className="text-[8px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2"><Layers size={12}/> Contenido del Documento</label>
                    <button onClick={() => updateSetting('showCover', !settings.showCover)} className={`w-full flex justify-between p-4 rounded-xl transition-all ${settings.showCover ? 'bg-white/10' : 'bg-black/20 text-white/40'}`}><span className="text-[10px] font-black">Portada</span><div className={`w-4 h-4 rounded-full border-2 ${settings.showCover ? 'bg-brand-orange border-brand-orange' : 'border-white/20'}`} /></button>
                    <button onClick={() => updateSetting('showGallery', !settings.showGallery)} className={`w-full flex justify-between p-4 rounded-xl transition-all ${settings.showGallery ? 'bg-white/10' : 'bg-black/20 text-white/40'}`}><span className="text-[10px] font-black">Galería</span><div className={`w-4 h-4 rounded-full border-2 ${settings.showGallery ? 'bg-brand-orange border-brand-orange' : 'border-white/20'}`} /></button>
                    <button onClick={() => updateSetting('showBudget', !settings.showBudget)} className={`w-full flex justify-between p-4 rounded-xl transition-all ${settings.showBudget ? 'bg-white/10' : 'bg-black/20 text-white/40'}`}><span className="text-[10px] font-black">Presupuesto</span><div className={`w-4 h-4 rounded-full border-2 ${settings.showBudget ? 'bg-brand-orange border-brand-orange' : 'border-white/20'}`} /></button>
                    <button onClick={() => updateSetting('showTerms', !settings.showTerms)} className={`w-full flex justify-between p-4 rounded-xl transition-all ${settings.showTerms ? 'bg-white/10' : 'bg-black/20 text-white/40'}`}><span className="text-[10px] font-black">Condiciones</span><div className={`w-4 h-4 rounded-full border-2 ${settings.showTerms ? 'bg-brand-orange border-brand-orange' : 'border-white/20'}`} /></button>
                    <button onClick={() => updateSetting('showDescriptions', !settings.showDescriptions)} className={`w-full flex justify-between p-4 rounded-xl transition-all ${settings.showDescriptions ? 'bg-white/10' : 'bg-black/20 text-white/40'}`}><span className="text-[10px] font-black">Descripciones</span><div className={`w-4 h-4 rounded-full border-2 ${settings.showDescriptions ? 'bg-brand-orange border-brand-orange' : 'border-white/20'}`} /></button>
                  </section>
                )}
             </div>
             <div className="p-6 border-t border-white/5 mt-auto">
                <button onClick={() => { onSave(settings); onClose(); }} className="w-full py-4 bg-brand-orange text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                   <Save size={16} /> Guardar Diseño
                </button>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
