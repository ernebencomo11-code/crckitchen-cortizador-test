import React from 'react';
import { QuoteData, Branding, PreviewSettings } from '../types';
import { formatCurrency } from '../utils/helpers';
import { BUDGET_SECTIONS } from '../constants';
import { Check } from 'lucide-react';

interface Props {
  data: QuoteData;
  branding: Branding;
  isPreview?: boolean;
  isEditMode?: boolean;
  updateData?: (data: Partial<QuoteData>) => void;
}

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div 
    className={`w-full h-[297mm] relative flex flex-col bg-white overflow-hidden page-break-after ${className}`}
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    {children}
  </div>
);

const Header: React.FC<{ title: string; subtitle?: string; branding: Branding; projectName: string; quoteNumber: string }> = ({ title, subtitle, branding, projectName, quoteNumber }) => (
  <header className="h-24 px-12 flex items-end justify-between pb-6 border-b border-gray-100 shrink-0">
     <div className="flex items-center gap-4">
        <img src={branding.logo} className="h-8 object-contain" alt="Logo" />
        <div className="h-6 w-px bg-gray-200"></div>
        <div>
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">{title}</h2>
           {subtitle && <p className="text-[9px] font-bold text-brand-orange uppercase tracking-widest mt-0.5" style={{ color: branding.primaryColor || '#FF6B35' }}>{subtitle}</p>}
        </div>
     </div>
     <div className="text-right">
        <p className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">{projectName}</p>
        <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{quoteNumber}</p>
     </div>
  </header>
);

const Footer: React.FC<{ pageNum: number; branding: Branding }> = ({ pageNum, branding }) => (
  <footer className="h-20 px-12 flex items-center justify-between border-t border-gray-100 shrink-0">
     <div className="flex items-center gap-4 text-[8px] font-medium text-slate-400 uppercase tracking-widest">
        <span>{branding.website}</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span>{branding.phone}</span>
     </div>
     <div className="text-[9px] font-black text-slate-300">
        PÁGINA {pageNum}
     </div>
  </footer>
);

export const PDFRenderer: React.FC<Props> = ({ data, branding }) => {
  const settings: PreviewSettings = data.previewSettings || branding.pdfSettings || {} as PreviewSettings;
  const primaryColor = branding.primaryColor || '#FF6B35'; 

  // --- LÓGICA DE MATRIZ DE COTIZACIÓN (MANTENIDA) ---
  const getUniqueItemsByCategory = (category: string) => {
    const allItems = data.prototypes.flatMap(p => p.budget.filter(i => i.category === category));
    const uniqueItemsMap = new Map();
    allItems.forEach(item => {
      const key = item.concept.trim().toUpperCase(); 
      if (!uniqueItemsMap.has(key)) {
        uniqueItemsMap.set(key, { ...item });
      }
    });
    return Array.from(uniqueItemsMap.values());
  };

  const categoriesToRender = [
    { id: BUDGET_SECTIONS.MOBILIARIO, label: 'Mobiliario y Carpintería' },
    { id: BUDGET_SECTIONS.ENCIMERAS, label: 'Cubiertas y Superficies' },
    { id: BUDGET_SECTIONS.ACCESORIOS, label: 'Equipamiento y Accesorios' }
  ];

  const getCellContent = (protoId: string, itemConcept: string, category: string) => {
    const proto = data.prototypes.find(p => p.id === protoId);
    if (!proto) return null;
    const matchedItem = proto.budget.find(i => 
      i.category === category && i.concept.trim().toUpperCase() === itemConcept.trim().toUpperCase()
    );

    if (!matchedItem) return <span className="text-slate-200 block text-center">-</span>;

    if (matchedItem.unitPrice === 0) {
      return (
        <div className="flex justify-center items-center">
           {matchedItem.quantity > 1 ? (
             <span className="font-bold text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{matchedItem.quantity} pzas</span>
           ) : (
             <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-sm">
                <Check size={10} strokeWidth={4} />
             </div>
           )}
        </div>
      );
    } else {
      return (
        <span className="font-bold text-[10px] text-slate-700 block text-center">
          {formatCurrency(matchedItem.unitPrice * matchedItem.quantity, data.currency)}
        </span>
      );
    }
  };

  const getProtoTotal = (protoId: string) => {
    const proto = data.prototypes.find(p => p.id === protoId);
    if (!proto) return 0;
    return proto.budget.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  let subtotalGlobal = data.prototypes.reduce((acc, p) => acc + (getProtoTotal(p.id) * p.quantity), 0);
  const montoDescuento = subtotalGlobal * ((data.showDiscount ? data.discountValue : 0) / 100);
  const subtotalNeto = subtotalGlobal - montoDescuento;
  const montoIva = subtotalNeto * (data.showIva ? data.ivaRate : 0);
  const totalGlobal = subtotalNeto + montoIva;

  return (
    <div className="pdf-document bg-gray-100 print:bg-white" style={{ width: '210mm' }}>
      
      {settings.showCover && (
        <PageContainer>
          <div className="flex-1 flex flex-col justify-center px-16 relative z-10">
             <div className="absolute top-0 left-0 w-2 h-1/3" style={{ backgroundColor: primaryColor }}></div>
             
             <div className="mb-12">
                <img src={branding.logo} className="h-20 object-contain mb-8" alt="Logo" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">Propuesta de Diseño</p>
                <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9] max-w-2xl">
                  {data.project.name || 'Proyecto Residencial'}
                </h1>
             </div>

             <div className="grid grid-cols-2 gap-12 border-t-2 border-slate-100 pt-8 max-w-2xl">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                   <p className="text-lg font-bold text-slate-800 uppercase">{data.client.name}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ubicación</p>
                   <p className="text-lg font-bold text-slate-800 uppercase">{data.project.address || 'Cancún, México'}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                   <p className="text-lg font-bold text-slate-800 uppercase">
                     {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                   </p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Folio</p>
                   <p className="text-lg font-bold text-slate-800 uppercase">{data.project.quoteNumber}</p>
                </div>
             </div>
          </div>
          
          <div className="h-16 bg-slate-900 flex items-center justify-between px-16 text-white shrink-0">
             <span className="text-[9px] font-bold uppercase tracking-widest">CR KITCHEN & DESIGN</span>
             <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">CONFIDENCIAL</span>
          </div>
        </PageContainer>
      )}

      <PageContainer>
        <Header 
          title="Bienvenida" 
          subtitle="Presentación del Proyecto" 
          branding={branding} 
          projectName={data.project.name} 
          quoteNumber={data.project.quoteNumber} 
        />
        <div className="flex-1 px-16 py-12 flex flex-col justify-center">
           <div className="max-w-3xl">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-10 leading-tight">
                Transformando espacios en <span style={{ color: primaryColor }}>experiencias de vida</span>.
              </h3>
              
              <div className="space-y-6 text-sm text-slate-600 leading-relaxed font-medium text-justify">
                 <p>
                   Estimado(a) <span className="font-bold text-slate-900 uppercase">{data.client.name}</span>,
                 </p>
                 <p>
                   Es un placer presentarle esta propuesta integral diseñada específicamente para el proyecto <span className="font-bold text-slate-900 uppercase">"{data.project.name}"</span>. 
                   Nuestro equipo ha analizado cuidadosamente sus requerimientos para desarrollar una solución que no solo cumpla con sus expectativas estéticas, 
                   sino que también optimice la funcionalidad y el valor de su inversión.
                 </p>
                 <p>
                   En CR Kitchen & Design, nos comprometemos con la excelencia en cada detalle, desde la selección de materiales premium hasta la ejecución técnica 
                   precisa. Esta propuesta refleja nuestra visión de crear espacios atemporales, duraderos y sofisticados.
                 </p>
                 <p>
                   Agradecemos la oportunidad de colaborar en la materialización de su visión.
                 </p>
              </div>

              <div className="mt-16 flex items-center gap-6">
                 <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-slate-300">
                    <span className="font-black text-xs">FIRMA</span>
                 </div>
                 <div>
                    <p className="text-sm font-black text-slate-900 uppercase">Dirección de Proyectos</p>
                    <p className="text-xs font-medium text-brand-orange uppercase tracking-widest mt-0.5" style={{ color: primaryColor }}>CR Kitchen & Design</p>
                 </div>
              </div>
           </div>
        </div>
        <Footer pageNum={2} branding={branding} />
      </PageContainer>

      {settings.showGallery && data.gallery.map((img, idx) => {
        let pageTitle = "Visualización";
        let subTitle = "Perspectiva 3D";
        if (img.category === 'Plano') { pageTitle = "Planimetría"; subTitle = "Plano Técnico"; }
        if (img.category === 'Alzado') { pageTitle = "Alzados"; subTitle = "Vista Frontal"; }
        
        return (
          <PageContainer key={img.id}>
             <Header 
                title={pageTitle} 
                subtitle={subTitle} 
                branding={branding} 
                projectName={data.project.name} 
                quoteNumber={data.project.quoteNumber}
             />
             <div className="flex-1 p-12 flex flex-col items-center justify-center bg-slate-50">
                <div className="w-full h-full relative flex items-center justify-center p-4 bg-white shadow-sm border border-slate-100 rounded-xl">
                   <img src={img.url} className="max-w-full max-h-full object-contain" alt={img.title} />
                   
                   <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{img.title || subTitle}</p>
                   </div>
                </div>
             </div>
             <Footer pageNum={3 + idx} branding={branding} />
          </PageContainer>
        );
      })}

      {settings.showBudget && (
        <PageContainer>
           <Header 
              title="Inversión" 
              subtitle="Desglose Financiero" 
              branding={branding} 
              projectName={data.project.name} 
              quoteNumber={data.project.quoteNumber}
           />
           
           <div className="flex-1 px-12 py-8 flex flex-col">
              
              <div className="flex justify-between items-end mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Proyecto</p>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{data.project.name}</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Presupuesto Total</p>
                    <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>{formatCurrency(totalGlobal, data.currency)}</h3>
                 </div>
              </div>

              <div className="flex-1 overflow-hidden">
                 <table className="w-full text-[10px] border-collapse">
                    <thead>
                       <tr>
                          <th className="py-3 px-4 text-left font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 w-1/3">Concepto</th>
                          <th className="py-3 px-2 text-center font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 w-12">Img</th>
                          {data.prototypes.map(p => (
                             <th key={p.id} className="py-3 px-2 text-center font-black uppercase tracking-widest text-slate-800 border-b-2 border-slate-100 border-l border-dashed border-slate-200">
                                {p.name}
                                <div className="text-[8px] font-medium text-slate-400 mt-0.5">{p.quantity} Unidades</div>
                             </th>
                          ))}
                       </tr>
                    </thead>
                    <tbody>
                       {categoriesToRender.map(cat => {
                         const items = getUniqueItemsByCategory(cat.id);
                         if (items.length === 0) return null;

                         return (
                           <React.Fragment key={cat.id}>
                             <tr>
                                <td colSpan={2 + data.prototypes.length} className="pt-6 pb-2 px-4 font-black text-slate-900 uppercase tracking-widest text-[9px] border-b border-slate-100">
                                  <span className="bg-slate-100 px-2 py-1 rounded">{cat.label}</span>
                                </td>
                             </tr>
                             
                             {items.map((item, idx) => (
                               <tr key={`${cat.id}-${idx}`} className="group">
                                  <td className="py-3 px-4 align-middle border-b border-slate-50 group-last:border-none">
                                     <div className="font-bold text-slate-700 uppercase">{item.concept}</div>
                                     {settings.showDescriptions && item.description && (
                                       <div className="text-[8px] text-slate-400 mt-0.5 leading-tight line-clamp-1">{item.description}</div>
                                     )}
                                  </td>
                                  <td className="py-3 px-2 align-middle text-center border-b border-slate-50">
                                     {item.image ? (
                                       <img src={item.image} className="w-6 h-6 object-cover rounded mx-auto border border-slate-200" alt="item" />
                                     ) : (
                                       <div className="w-1 h-1 bg-slate-200 rounded-full mx-auto"></div>
                                     )}
                                  </td>
                                  {data.prototypes.map(p => (
                                    <td key={p.id} className="py-3 px-2 align-middle border-b border-slate-50 border-l border-dashed border-slate-100 bg-slate-50/30">
                                       {getCellContent(p.id, item.concept, cat.id)}
                                    </td>
                                  ))}
                               </tr>
                             ))}
                           </React.Fragment>
                         );
                       })}

                       <tr><td className="h-8"></td></tr>
                       <tr className="bg-slate-50 border-t-2 border-slate-200">
                          <td colSpan={2} className="py-4 px-4 font-black text-slate-800 uppercase text-right tracking-widest">
                             Inversión Unitaria
                          </td>
                          {data.prototypes.map(p => (
                             <td key={p.id} className="py-4 px-2 text-center font-black text-slate-900 text-xs border-l border-slate-200">
                                {formatCurrency(getProtoTotal(p.id), data.currency)}
                             </td>
                          ))}
                       </tr>
                    </tbody>
                 </table>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
                 <div className="w-64 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                       <span>Subtotal</span>
                       <span>{formatCurrency(subtotalGlobal, data.currency)}</span>
                    </div>
                    {data.showDiscount && (
                      <div className="flex justify-between text-[10px] font-bold uppercase" style={{ color: primaryColor }}>
                         <span>Descuento ({data.discountValue}%)</span>
                         <span>- {formatCurrency(montoDescuento, data.currency)}</span>
                      </div>
                    )}
                    {data.showIva && (
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                         <span>I.V.A.</span>
                         <span>{formatCurrency(montoIva, data.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-slate-900 uppercase pt-2 border-t border-slate-200 mt-2">
                       <span>Total</span>
                       <span>{formatCurrency(totalGlobal, data.currency)}</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <Footer pageNum={3 + (data.gallery?.length || 0)} branding={branding} />
        </PageContainer>
      )}

      {settings.showTerms && (
        <PageContainer>
           <Header 
              title="Condiciones" 
              subtitle="Términos Comerciales" 
              branding={branding} 
              projectName={data.project.name} 
              quoteNumber={data.project.quoteNumber}
           />
           <div className="flex-1 px-16 py-12">
              <div className="grid grid-cols-2 gap-8 mb-12">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Forma de Pago</p>
                    <p className="text-sm font-bold text-slate-800">
                       {data.terms.advancePercent}% Anticipo / {data.terms.midPaymentPercent}% Avance / {data.terms.finalPaymentPercent}% Entrega
                    </p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tiempo de Entrega</p>
                    <p className="text-sm font-bold text-slate-800">{data.terms.deliveryTime}</p>
                 </div>
              </div>

              <div className="prose prose-sm max-w-none text-justify text-[10px] text-slate-600 leading-relaxed columns-2 gap-12">
                 <h4 className="text-xs font-black text-slate-900 uppercase mb-4 tracking-widest break-after-avoid">Cláusulas Generales</h4>
                 <div className="whitespace-pre-wrap">{data.terms.text}</div>
                 
                 <div className="break-inside-avoid mt-8 pt-8 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 uppercase mb-2 tracking-widest">Garantía Limitada</h4>
                    <p>{data.terms.warranty}</p>
                 </div>
              </div>

              <div className="mt-auto pt-20 grid grid-cols-2 gap-20">
                 <div className="border-t-2 border-slate-200 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Aceptación del Cliente</p>
                    <p className="text-[9px] font-medium uppercase text-slate-400 mt-1">{data.client.name}</p>
                 </div>
                 <div className="border-t-2 border-slate-200 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Por CR Kitchen & Design</p>
                    <p className="text-[9px] font-medium uppercase text-slate-400 mt-1">Representante Legal</p>
                 </div>
              </div>
           </div>
           <Footer pageNum={4 + (data.gallery?.length || 0)} branding={branding} />
        </PageContainer>
      )}
    </div>
  );
};