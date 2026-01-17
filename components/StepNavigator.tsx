
import React from 'react';
import { Step } from '../types';
import { Check, User, Image, DollarSign, FileText } from 'lucide-react';

interface Props {
  currentStep: Step;
  setStep: (step: Step) => void;
}

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'GENERAL', icon: User },
  { id: 'gallery', label: 'DISEÑO', icon: Image },
  { id: 'budget', label: 'COTIZACIÓN', icon: DollarSign },
  { id: 'terms', label: 'CONDICIONES', icon: FileText },
];

export const StepNavigator: React.FC<Props> = ({ currentStep, setStep }) => {
  const stepOrder: Step[] = ['general', 'gallery', 'budget', 'terms'];
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="w-full px-2 md:px-6 no-print">
      {/* NUEVA ACTUALIZACIÓN: Se aumentó el max-w y el gap para separar más los elementos visualmente */}
      <div className="max-w-6xl mx-auto bg-gray-100/80 backdrop-blur-sm rounded-2xl p-2 shadow-inner border border-gray-200 flex items-center justify-between gap-4">
          {steps.map((s) => {
            const isActive = s.id === currentStep;
            const isCompleted = stepOrder.indexOf(s.id) < currentIndex;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                // NUEVA ACTUALIZACIÓN: Aumentado el padding horizontal (px-6) y el gap (gap-4) para dar aire a los textos
                className={`
                  flex-1 flex items-center justify-center gap-4 py-3 rounded-xl transition-all duration-300 relative group
                  ${isActive ? 'bg-white text-brand-dark shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:bg-white/60'}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                  ${isActive ? 'bg-brand-orange text-white' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200/50 text-gray-400 group-hover:bg-white group-hover:text-brand-orange'}
                `}>
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />}
                </div>
                
                {/* NUEVA ACTUALIZACIÓN: Aumentado tracking a 0.3em para separar las letras del texto drásticamente */}
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] hidden md:block transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
