
import React, { useState, useEffect } from 'react';
import { QuoteData, LineItem, AppUser, Prototype } from '../../types';
import { BUDGET_SECTIONS, UNITS } from '../../constants';
import { generateId, formatCurrency } from '../../utils/helpers';
import { Plus, Trash2, Package, Hammer, BookOpen, ChevronUp, ChevronDown, Tag, Box, ToggleLeft, ToggleRight, Lock, TrendingUp, DollarSign, Image as ImageIcon, PieChart, MinusCircle, PlusCircle, Layout, Copy, GripVertical, Edit2, CheckCircle2, ChevronRight, Target, Hash } from 'lucide-react';

interface Props {
  data: QuoteData;
  updateData: (data: Partial<QuoteData>) => void;
  onOpenPicker: (category: string, protoId?: string) => void;
  currentUser: AppUser;
}

export const Step3Budget: React.FC<Props> = ({ data, updateData, onOpenPicker, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeProtoId, setActiveProtoId] = useState<string>(
    data.prototypes?.length > 0 ? data.prototypes[0].id : ''
  );

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (data.prototypes?.length > 0) {
      if (!activeProtoId || !data.prototypes.some(p => p.id === activeProtoId)) {
        setActiveProtoId(data.prototypes[0].id);
      }
    }
  }, [data.prototypes]);

  const getActiveBudget = (): LineItem[] => {
    const proto = data.prototypes?.find(p => p.id === activeProtoId);
    return proto?.budget || [];
  };

  const updateRow = (id: string, field: keyof LineItem, value: any) => {
    const currentBudget = getActiveBudget();
    const updatedBudget = currentBudget.map(row => {
      if (row.id === id) return { ...row, [field]: value };
      return row;
    });

    const updatedProtos = data.prototypes.map(p => p.id === activeProtoId ? { ...p, budget: updatedBudget } : p);
    updateData({ prototypes: updatedProtos });
  };

  // NUEVA ACTUALIZACIÓN: Lógica corregida para Precio General (Lote) en Mobiliario
  const updateMobiliarioGlobalPrice = (field: 'unitPrice', value: number) => {
    const currentBudget = getActiveBudget();
    
    // Bandera para asignar el precio solo al primer ítem encontrado
    let isFirstItem = true;

    const updatedBudget = currentBudget.map(item => {
      if (item.category === BUDGET_SECTIONS.MOBILIARIO) {
        if (isFirstItem) {
          isFirstItem = false;
          // El primer ítem carga con el precio total del lote
          return { ...item, [field]: value, quantity: 1 };
        } else {
          // Los demás ítems se quedan en 0 (incluidos en el lote)
          return { ...item, [field]: 0 };
        }
      }
      return item;
    });

    const updatedProtos = data.prototypes.map(p => p.id === activeProtoId ? { ...p, budget: updatedBudget } : p);
    updateData({ prototypes: updatedProtos });
  };

  const deleteRow = (id: string) => {
    const currentBudget = getActiveBudget();
    const updatedBudget = currentBudget.filter(row => row.id !== id);
    
    const updatedProtos = data.prototypes.map(p => p.id === activeProtoId ? { ...p, budget: updatedBudget } : p);
    updateData({ prototypes: updatedProtos });
  };

  const addRow = (section: string) => {
    const newRow: LineItem = {
      id: generateId(), 
      codigo: 'MANUAL', // Valor por defecto para nuevos
      selected: true, 
      category: section, 
      concept: '', 
      description: '',
      unit: section === BUDGET_SECTIONS.MOBILIARIO ? 'LOTE' : 'pza',
      quantity: 1, 
      unitPrice: 0
    };
    const updatedBudget = [...getActiveBudget(), newRow];
    const updatedProtos = data.prototypes.map(p => p.id === activeProtoId ? { ...p, budget: updatedBudget } : p);
    updateData({ prototypes: updatedProtos });
  };

  const copyActivePrototype = () => {
    const protoToCopy = data.prototypes.find(p => p.id === activeProtoId);
    if (!protoToCopy) return;

    const newProto: Prototype = {
      ...protoToCopy, id: generateId(), name: `${protoToCopy.name} (COPIA)`,
      budget: protoToCopy.budget.map(item => ({ ...item, id: generateId() }))
    };
    updateData({ prototypes: [...data.prototypes, newProto] });
    setActiveProtoId(newProto.id);
  };

  const updateActiveProtoName = (newName: string) => {
    const updatedProtos = data.prototypes.map(p => p.id === activeProtoId ? { ...p, name: newName.toUpperCase() } : p);
    updateData({ prototypes: updatedProtos });
  };

  const handleDragStart = (index: number, category: string) => {
    setDraggedIndex(index);
    setDraggedCategory(category);
  };

  const handleDragEnter = (index: number, category: string) => {
    if (draggedIndex === null || draggedCategory !== category || draggedIndex === index) return;
    const currentBudget = [...getActiveBudget()];
    const sectionItems = currentBudget.filter(i => i.category === category);
    const nonSectionItems = currentBudget.filter(i => i.category !== category);
    const itemToMove = sectionItems.splice(draggedIndex, 1)[0];
    sectionItems.splice(index, 0, itemToMove);
    const updatedBudget = [...nonSectionItems, ...sectionItems];
    setDraggedIndex(index);
    const updatedProtos = data.prototypes.map(p => p.id === activeProtoId ? { ...p, budget: updatedBudget } : p);
    updateData({ prototypes: updatedProtos });
  };
  
  const activeBudget = getActiveBudget();
  const mobiliarioItems = activeBudget.filter(i => i.category === BUDGET_SECTIONS.MOBILIARIO);
  const encimerasItems = activeBudget.filter(i => i.category === BUDGET_SECTIONS.ENCIMERAS);
  const accesoriosItems = activeBudget.filter(i => i.category === BUDGET_SECTIONS.ACCESORIOS);
  
  const calculateBudgetTotal = (items: LineItem[]) => items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
  let subtotalGlobal = (data.prototypes || []).reduce((acc, p) => acc + (calculateBudgetTotal(p.budget) * p.quantity), 0);
  const montoDescuento = subtotalGlobal * ((data.showDiscount ? data.discountValue : 0) / 100);
  const subtotalNeto = subtotalGlobal - montoDescuento;
  const montoIva = subtotalNeto * (data.showIva ? data.ivaRate : 0);
  const totalGlobal = subtotalNeto + montoIva;
  const activeProto = data.prototypes?.find(p => p.id === activeProtoId);
  
  // NUEVA ACTUALIZACIÓN: Calcular total sumando todo el mobiliario para reflejar el valor real del lote
  const mobiliarioVentaTotal = mobiliarioItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-56">
      
      {/* SELECTOR DE ÁREAS / PROTOTIPOS */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0"><Layout size={18} /></div>
          <div className="flex-1 min-w-0 overflow-x-auto scroll-smooth pb-3 pt-1 px-1 custom-scrollbar">
            <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF6B35; }`}} />
            <div className="flex gap-3">
              {data.prototypes.map(p => (
                <button key={p.id} onClick={() => setActiveProtoId(p.id)} className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center shrink-0 border-2 ${activeProtoId === p.id ? 'bg-brand-dark border-brand-orange text-white shadow-lg shadow-brand-orange/10' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-orange/30 hover:text-brand-dark hover:shadow-sm'}`}>
                  <span className="truncate max-w-[160px]">{p.name}</span>
                  <span className="text-[7px] opacity-60 mt-1">{p.quantity} {data.projectType === 'PROYECTO' ? 'UNID.' : 'VECES'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {activeProto && (
          <div className="px-6 py-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-2 duration-300">
             <div className="flex items-center gap-6 w-full sm:w-auto flex-1">
                <div className="hidden md:flex items-center gap-2 text-brand-orange"><ChevronRight size={16} /><span className="text-[9px] font-black uppercase tracking-widest">Ajustes de Modelo</span></div>
                <div className="flex-1 sm:max-w-md">
                  <div className="relative group/edit"><Edit2 size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange" /><input type="text" value={activeProto.name} onChange={(e) => updateActiveProtoName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-[11px] font-black text-brand-dark uppercase tracking-widest outline-none focus:border-brand-orange focus:bg-white transition-all shadow-inner" placeholder="CAMBIAR NOMBRE DEL MODELO..." /></div>
                </div>
             </div>
             <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
               <div className="flex flex-col text-right hidden lg:block"><span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Inversión actual</span><span className="text-xs font-black text-brand-dark">{formatCurrency(calculateBudgetTotal(activeProto.budget), data.currency)}</span></div>
               <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>
               <button onClick={copyActivePrototype} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/20"><Copy size={14} /> Duplicar Modelo</button>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 sm:px-8 py-4 bg-brand-dark rounded-3xl border border-brand-orange/20 shadow-xl animate-in zoom-in-95">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg"><Target size={20} /></div>
           <div>
             <h4 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] leading-none mb-1">Prototipo Seleccionado</h4>
             <p className="text-lg font-black text-white uppercase tracking-tighter">{activeProto?.name || 'DISEÑO ÚNICO'}</p>
           </div>
         </div>
         <div className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
           <span className="hidden sm:inline text-[8px] font-black text-white/30 uppercase tracking-widest">Contenido actual:</span>
           <span className="text-[10px] font-black text-brand-orange uppercase">{activeBudget.length} Conceptos</span>
         </div>
      </div>

      {/* SECCIÓN MOBILIARIO */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-800 p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"><div className="flex items-center gap-4 flex-1"><div className="w-14 h-14 bg-brand-orange text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0"><Hammer size={28} /></div><div className="flex-1 min-w-0"><h3 className="font-black uppercase tracking-widest text-lg text-white">MOBILIARIO Y HERRAJES</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Suministro de carpintería técnica</p></div></div><div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto"><div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col min-w-[240px]"><label className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Inversión Lote Mobiliario</label><div className="flex items-center gap-2"><span className="text-brand-orange font-black text-xl">$</span><input type="number" value={mobiliarioVentaTotal || ''} onChange={(e) => updateMobiliarioGlobalPrice('unitPrice', parseFloat(e.target.value) || 0)} className="bg-transparent border-none focus:ring-0 p-0 text-2xl font-black text-white w-full" placeholder="0.00" /></div></div><button onClick={() => onOpenPicker(BUDGET_SECTIONS.MOBILIARIO, activeProtoId)} className="w-14 h-14 bg-brand-orange text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl shrink-0"><Plus size={28} strokeWidth={3} /></button></div></div>
        <div className="p-4 sm:p-6"><div className="grid grid-cols-1 gap-4">
            {mobiliarioItems.length === 0 ? (<div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[32px] group hover:border-brand-orange/20 transition-all cursor-pointer" onClick={() => onOpenPicker(BUDGET_SECTIONS.MOBILIARIO, activeProtoId)}><p className="text-xs font-black text-gray-300 uppercase tracking-widest group-hover:text-brand-orange text-center">Importar componentes desde el catálogo</p></div>) : (mobiliarioItems.map((item, index) => (
              <div key={item.id} draggable onDragStart={() => handleDragStart(index, BUDGET_SECTIONS.MOBILIARIO)} onDragEnter={() => handleDragEnter(index, BUDGET_SECTIONS.MOBILIARIO)} onDragOver={(e) => e.preventDefault()} onDragEnd={() => { setDraggedIndex(null); setDraggedCategory(null); }} className={`group bg-gray-50/60 p-4 rounded-[24px] border border-gray-100 flex items-start gap-4 hover:border-brand-orange/40 transition-all ${draggedIndex === index && draggedCategory === BUDGET_SECTIONS.MOBILIARIO ? 'opacity-30' : ''}`}><div className="text-gray-300 pt-1 cursor-grab active:cursor-grabbing"><GripVertical size={20} /></div><div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 shrink-0 shadow-sm">{item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="text-[10px] font-black text-gray-300 uppercase">{index+1}</div>}</div><div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center bg-brand-dark px-2 py-0.5 rounded text-brand-orange shrink-0"><Hash size={10} className="mr-1" /><input type="text" value={item.codigo || ''} onChange={(e) => updateRow(item.id, 'codigo', e.target.value.toUpperCase())} className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-mono font-black w-24 uppercase" placeholder="CÓDIGO" /></div>
                  <input type="text" value={item.concept} onChange={(e) => updateRow(item.id, 'concept', e.target.value)} className="flex-1 font-black text-xs md:text-sm bg-transparent border-none p-0 focus:ring-0 uppercase text-brand-dark" placeholder="CONCEPTO..." />
                </div>
                <textarea value={item.description} onChange={(e) => updateRow(item.id, 'description', e.target.value)} className="w-full text-[10px] md:text-[11px] font-bold text-gray-400 bg-transparent border-none p-0 focus:ring-0 uppercase resize-none h-auto leading-snug" rows={2} placeholder="DESCRIPCIÓN TÉCNICA..."/>
              </div><button onClick={() => deleteRow(item.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button></div>
            )))}
        </div></div>
      </div>

      {/* REFACTOR: SECCIONES ENCIMERAS Y ACCESORIOS CON TARJETAS RESPONSIVAS */}
      {[ { title: BUDGET_SECTIONS.ENCIMERAS, items: encimerasItems, color: 'brand-orange', icon: BookOpen }, { title: BUDGET_SECTIONS.ACCESORIOS, items: accesoriosItems, color: 'brand-dark', icon: Package } ].map(section => (
        <div key={section.title} className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className={`bg-gray-50 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100`}><div className="flex items-center gap-4"><div className={`w-2 h-10 bg-${section.color} rounded-full`}></div><div><h3 className="font-black uppercase tracking-widest text-lg text-brand-dark">{section.title}</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Componentes Adicionales</p></div></div><div className="flex gap-3 flex-wrap"><button onClick={() => onOpenPicker(section.title, activeProtoId)} className={`px-6 py-3 bg-${section.color === 'brand-orange' ? 'brand-orange' : 'brand-dark'} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}><section.icon size={16} /> Catálogo</button><button onClick={() => addRow(section.title)} className="px-6 py-3 bg-gray-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> Manual</button></div></div>
          <div className="p-4 sm:p-6 space-y-4">
            {section.items.map((item, index) => (
              <div key={item.id} draggable onDragStart={() => handleDragStart(index, section.title)} onDragEnter={() => handleDragEnter(index, section.title)} onDragOver={(e) => e.preventDefault()} onDragEnd={() => { setDraggedIndex(null); setDraggedCategory(null); }} className={`group bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-4 hover:border-brand-orange/40 transition-all ${draggedIndex === index && draggedCategory === section.title ? 'opacity-30' : ''}`}><div className="flex items-start gap-4 w-full"><div className="text-gray-300 pt-1 cursor-grab active:cursor-grabbing"><GripVertical size={20} /></div><div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 shrink-0 shadow-sm">{item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <ImageIcon size={20} className="text-gray-300"/>}</div><div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-brand-dark shrink-0"><Hash size={10} className="mr-1 opacity-40" /><input type="text" value={item.codigo || ''} onChange={(e) => updateRow(item.id, 'codigo', e.target.value.toUpperCase())} className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-mono font-black w-24 uppercase" placeholder="CÓDIGO" /></div>
                  <input type="text" value={item.concept} onChange={(e) => updateRow(item.id, 'concept', e.target.value)} className="flex-1 font-black text-xs md:text-sm bg-transparent border-none p-0 focus:ring-0 uppercase text-brand-dark" placeholder="CONCEPTO..." />
                </div>
                <input type="text" value={item.description} onChange={(e) => updateRow(item.id, 'description', e.target.value)} className="w-full text-[10px] md:text-[11px] font-bold text-gray-400 bg-transparent border-none p-0 focus:ring-0 uppercase" placeholder="NOTAS ADICIONALES..." />
              </div><button onClick={() => deleteRow(item.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button></div><div className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-gray-100"><div className="flex flex-col"><label className="text-[8px] font-black text-gray-400 uppercase mb-1">Cantidad</label><input type="number" value={item.quantity} onChange={(e) => updateRow(item.id, 'quantity', parseFloat(e.target.value) || 1)} className="w-full text-center font-black text-brand-dark bg-gray-50 rounded-lg border-none p-2 text-sm" /></div><div className="flex flex-col"><label className="text-[8px] font-black text-gray-400 uppercase mb-1">Precio Unit.</label><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span><input type="number" value={item.unitPrice || ''} onChange={(e) => updateRow(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full text-right font-black text-brand-dark bg-gray-50 rounded-lg border-none pl-5 pr-2 py-2 text-sm" /></div></div><div className="flex flex-col text-right items-end"><label className="text-[8px] font-black text-gray-400 uppercase mb-1">Subtotal</label><span className="font-black text-brand-dark text-lg h-full flex items-center pr-2">{formatCurrency(item.quantity * item.unitPrice, data.currency)}</span></div></div></div>
            ))}
          </div>
        </div>
      ))}
      
      {/* FOOTER FIJO */}
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 z-[50] w-full max-w-5xl sm:w-[95%]">
        <div className="bg-brand-dark text-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden"><div className="px-4 py-4 sm:px-8 sm:py-5 flex items-center justify-between bg-black/20"><div className="flex flex-col"><span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Inversión Final del Proyecto</span><span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">{formatCurrency(totalGlobal, data.currency)}</span></div><button onClick={() => setIsExpanded(!isExpanded)} className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isExpanded ? 'bg-brand-orange border-brand-orange text-white' : 'bg-white/5 border-white/10'}`}>{isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}<span className="hidden sm:inline">{isExpanded ? 'Ocultar' : 'Detalles de Inversión'}</span></button></div>{isExpanded && (<div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 animate-in slide-in-from-bottom-6"><div className="space-y-6"><div className="flex items-center gap-3"><Box size={16} className="text-brand-orange" /><span className="text-[10px] font-black uppercase text-white/30">Desglose</span></div><div className="bg-white/5 p-4 rounded-2xl border border-white/10 max-h-40 overflow-y-auto scrollbar-hide">{data.prototypes.map(p => <div key={p.id} className="flex justify-between text-[10px] font-black mb-2 border-b border-white/5 pb-2"><span>{p.name}</span><span className="text-brand-orange">{p.quantity} unid.</span></div>)}</div></div><div className="space-y-4"><div className="flex items-center gap-3"><Tag size={16} className="text-brand-orange" /><span className="text-[10px] font-black uppercase text-white/30">Opciones</span></div><div className="space-y-3"><button onClick={() => updateData({ showIva: !data.showIva })} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-black uppercase">I.V.A. (16%)</span>{data.showIva ? <ToggleRight className="text-brand-orange" size={24} /> : <ToggleLeft className="text-white/20" size={24} />}</button>
      
      {/* CAMBIO MANTENIDO: Campo de descuento editable con toggle */}
      <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
        <button onClick={() => updateData({ showDiscount: !data.showDiscount })} className="w-full flex items-center justify-between p-4 bg-transparent border-none">
          <span className="text-[10px] font-black uppercase">Descuento Global</span>
          {data.showDiscount ? <ToggleRight className="text-brand-orange" size={24} /> : <ToggleLeft className="text-white/20" size={24} />}
        </button>
        {data.showDiscount && (
           <div className="px-4 pb-4 animate-in slide-in-from-top-2">
             <div className="relative">
                <input 
                  type="number" 
                  value={data.discountValue || ''} 
                  onChange={(e) => updateData({ discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-4 pr-10 py-3 bg-black/20 rounded-lg text-white font-black text-sm outline-none border border-white/10 focus:border-brand-orange transition-all placeholder:text-white/20"
                  placeholder="0"
                  min="0"
                  max="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/40">%</span>
             </div>
           </div>
        )}
      </div>

      </div></div><div className="text-right flex flex-col justify-end space-y-3"><div className="space-y-2 pb-3 border-b border-white/5"><div className="flex justify-between text-[10px] font-black text-white/30 uppercase"><span>Subtotal:</span><span>{formatCurrency(subtotalGlobal, data.currency)}</span></div>{data.showDiscount && <div className="flex justify-between text-[10px] font-black text-brand-orange uppercase"><span>Descuento ({data.discountValue}%):</span><span>- {formatCurrency(montoDescuento, data.currency)}</span></div>}<div className={`flex justify-between text-[10px] font-black uppercase ${data.showIva ? 'text-white/60' : 'text-white/10'}`}><span>I.V.A.:</span><span>{formatCurrency(montoIva, data.currency)}</span></div></div><div className="flex justify-between items-baseline pt-2"><span className="text-md font-black text-white/20 uppercase tracking-[0.3em]">TOTAL</span><span className="text-4xl font-black text-brand-orange tracking-tighter">{formatCurrency(totalGlobal, data.currency)}</span></div></div></div>)}</div>
      </div>
    </div>
  );
};
