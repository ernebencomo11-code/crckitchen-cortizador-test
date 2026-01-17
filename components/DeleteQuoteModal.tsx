
import React, { useState } from 'react';
import { X, Trash2, Lock, Eye, EyeOff, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { QuoteData } from '../types';

interface Props {
  quote: QuoteData;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteQuoteModal: React.FC<Props> = ({ quote, onConfirm, onCancel, isDeleting }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError('');
    
    try {
      await onConfirm(password);
    } catch (err: any) {
      setError(err.message || 'Contraseña incorrecta o error de servidor.');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-red-100">
        
        <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
          <div className="flex items-center gap-4 text-red-600">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Eliminar Proyecto</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Acción irreversible</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-brand-dark transition-all">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4">
             <AlertTriangle className="text-brand-orange shrink-0" size={20} />
             <div>
                <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-1">¿Estás seguro?</p>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                   Vas a eliminar la cotización <span className="font-black text-brand-dark">{quote.project.quoteNumber}</span> para <span className="font-black text-brand-dark">{quote.client.name || 'SIN NOMBRE'}</span>.
                </p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} /> Confirma tu contraseña
              </label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-red-400 focus:bg-white transition-all font-bold text-brand-dark"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand-dark transition-all"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                 <ShieldAlert size={16} className="text-red-600" />
                 <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onCancel} 
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isDeleting || !password}
                className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Eliminar Ahora
              </button>
            </div>
          </form>
        </div>

        <footer className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">
            Seguridad CR Kitchen & Design • Protocolo de Borrado
          </p>
        </footer>
      </div>
    </div>
  );
};
