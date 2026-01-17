
import React, { useState } from 'react';
import { QuoteData } from '../../types';
import { Sparkles, Loader2, Wand2, ShieldCheck, Clock, CreditCard, AlignLeft, FileText, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  data: QuoteData;
  updateData: (data: Partial<QuoteData>) => void;
}

export const Step4Terms: React.FC<Props> = ({ data, updateData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStyle, setAiStyle] = useState<'resumido' | 'detallado'>('detallado');

  const updateTerm = (field: keyof QuoteData['terms'], value: any) => {
    updateData({ terms: { ...data.terms, [field]: value } });
  };

  const handlePaymentCountChange = (count: number) => {
    const updates: Partial<QuoteData['terms']> = { paymentCount: count };
    if (count === 2) {
      updates.midPaymentPercent = (data.terms.midPaymentPercent + data.terms.finalPaymentPercent);
      updates.finalPaymentPercent = 0;
    } else {
      if (data.terms.finalPaymentPercent === 0) {
        updates.midPaymentPercent = 25;
        updates.finalPaymentPercent = 5;
      }
    }
    updateData({ terms: { ...data.terms, ...updates } });
  };

  const generateWithAI = async () => {
    if (data.budget.length === 0) {
      alert("Por favor, añade algunos elementos al presupuesto primero para que la IA tenga contexto sobre el proyecto.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: data.client.name || 'Cliente CR Kitchen',
          projectCategory: data.category,
          projectName: data.project.name || 'Residencia CR',
          budgetItems: data.budget,
          style: aiStyle
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const result = await response.json();
      
      if (result.description) {
        updateTerm('text', result.description.trim());
      } else {
        throw new Error("La IA no devolvió un texto válido.");
      }
    } catch (err: any) {
      console.error("Error en la generación con IA:", err);
      setError(err.message || "No se pudo conectar con el asistente de IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const paymentCount = data.terms.paymentCount || 3;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-8 mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">Memoria Descriptiva</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Introducción comercial inteligente</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-2 rounded-[24px] border border-gray-100 w-full sm:w-auto">
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100 w-full sm:w-auto">
               <button onClick={() => setAiStyle('resumido')} className={`flex-1 sm:flex-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${aiStyle === 'resumido' ? 'bg-brand-dark text-white' : 'text-gray-400 hover:text-brand-dark'}`}><FileText size={12} /> Resumido</button>
               <button onClick={() => setAiStyle('detallado')} className={`flex-1 sm:flex-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${aiStyle === 'detallado' ? 'bg-brand-dark text-white' : 'text-gray-400 hover:text-brand-dark'}`}><AlignLeft size={12} /> Detallado</button>
            </div>

            <button onClick={generateWithAI} disabled={isGenerating} className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${isGenerating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-orange text-white hover:bg-orange-600 hover:scale-105 active:scale-95 shadow-orange-500/20'}`}>
              {isGenerating ? (<><Loader2 size={16} className="animate-spin" /> Redactando...</>) : (<><Sparkles size={16} /> Magia con IA <ChevronRight size={14} className="opacity-50" /></>)}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-300">
             <AlertCircle size={18} />
             <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
             <button onClick={() => setError(null)} className="ml-auto text-[9px] font-black underline">Cerrar</button>
          </div>
        )}

        <div className="relative">
          <textarea value={data.terms.text} onChange={(e) => updateTerm('text', e.target.value)} className="w-full h-80 p-6 sm:p-10 bg-gray-50/50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-brand-orange/30 outline-none transition-all text-gray-700 leading-relaxed font-medium resize-none text-base sm:text-lg shadow-inner" placeholder="Describe el proyecto o usa la IA..." />
          {isGenerating && (<div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-[32px] flex items-center justify-center"><div className="flex flex-col items-center gap-6 text-brand-orange text-center px-10"><div className="relative"><div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-2xl animate-pulse"></div><Wand2 size={56} className="animate-bounce relative z-10" /></div><div><span className="font-black text-[11px] uppercase tracking-[0.4em] block mb-2">Diseñando Narrativa</span><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">La IA está analizando tu proyecto...</p></div></div></div>)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100">
           <div className="flex items-center gap-4 mb-8"><div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><ShieldCheck size={20} /></div><h4 className="font-black text-brand-dark uppercase tracking-widest text-sm">Garantía y Entrega</h4></div>
           <div className="space-y-6">
              <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tiempo de Entrega</label><div className="relative"><Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" /><input type="text" value={data.terms.deliveryTime} onChange={(e) => updateTerm('deliveryTime', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-brand-dark focus:ring-2 focus:ring-brand-orange" /></div></div>
              <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Garantía</label><div className="relative"><ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" /><input type="text" value={data.terms.warranty} onChange={(e) => updateTerm('warranty', e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold text-brand-dark focus:ring-2 focus:ring-brand-orange" /></div></div>
           </div>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><CreditCard size={20} /></div><h4 className="font-black text-brand-dark uppercase tracking-widest text-sm">Estructura de Pago</h4></div>
              
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 w-full sm:w-auto">
                 <button onClick={() => handlePaymentCountChange(2)} className={`flex-1 sm:flex-auto px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${paymentCount === 2 ? 'bg-brand-dark text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'}`}>2 PAGOS</button>
                 <button onClick={() => handlePaymentCountChange(3)} className={`flex-1 sm:flex-auto px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${paymentCount === 3 ? 'bg-brand-dark text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'}`}>3 PAGOS</button>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className={`grid gap-3 ${paymentCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Anticipo</label>
                    <div className="relative">
                      <input type="number" value={data.terms.advancePercent} onChange={(e) => updateTerm('advancePercent', parseFloat(e.target.value) || 0)} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl font-black text-brand-dark focus:ring-2 focus:ring-brand-orange text-sm" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-gray-300 text-[10px]">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      {paymentCount === 2 ? 'Finiquito' : '2do Pago'}
                    </label>
                    <div className="relative">
                      <input type="number" value={data.terms.midPaymentPercent} onChange={(e) => updateTerm('midPaymentPercent', parseFloat(e.target.value) || 0)} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl font-black text-brand-dark focus:ring-2 focus:ring-brand-orange text-sm" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-gray-300 text-[10px]">%</span>
                    </div>
                  </div>
                  {paymentCount === 3 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Finiquito</label>
                      <div className="relative">
                        <input type="number" value={data.terms.finalPaymentPercent} onChange={(e) => updateTerm('finalPaymentPercent', parseFloat(e.target.value) || 0)} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl font-black text-brand-dark focus:ring-2 focus:ring-brand-orange text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-gray-300 text-[10px]">%</span>
                      </div>
                    </div>
                  )}
              </div>
              
              {(data.terms.advancePercent + data.terms.midPaymentPercent + (paymentCount === 3 ? data.terms.finalPaymentPercent : 0)) !== 100 && (
                <p className="text-[9px] font-bold text-red-400 uppercase text-center animate-pulse">La suma de porcentajes debe ser 100% (Actual: {data.terms.advancePercent + data.terms.midPaymentPercent + (paymentCount === 3 ? data.terms.finalPaymentPercent : 0)}%)</p>
              )}
           </div>
        </section>
      </div>

      <div className="p-6 bg-brand-dark rounded-3xl text-center mt-8">
         <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
           Texto generado por IA optimizado para CR Kitchen.
         </p>
      </div>
    </div>
  );
};
