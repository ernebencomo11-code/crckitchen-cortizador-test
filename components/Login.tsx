
import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, AlertTriangle, Settings } from 'lucide-react';
import { storage } from '../storage';
import { AppUser, Branding } from '../types';

interface Props {
  onLoginSuccess: (user: AppUser) => void;
  branding: Branding;
}

export const Login: React.FC<Props> = ({ onLoginSuccess, branding }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsNetworkError(false);

    try {
      const user = await storage.login(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (err: any) {
      if (err.isNetworkError) {
        setIsNetworkError(true);
        setError('El servidor no responde. Verifica que server.js esté corriendo.');
      } else if (err.status === 401) {
        setError('Usuario o contraseña incorrectos.');
      } else {
        setError(err.message || 'Error de conexión inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark relative overflow-hidden">
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-orange/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-white/20">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl p-4 mb-6 shadow-inner flex items-center justify-center">
              <img src={branding.logo} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tighter text-center">
              Acceso al Sistema
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
              Cotizador CR Kitchen & Design
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Usuario</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-brand-orange focus:bg-white transition-all font-bold text-brand-dark"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-brand-orange focus:bg-white transition-all font-bold text-brand-dark"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`p-4 border rounded-2xl flex items-start gap-3 animate-in shake duration-300 ${isNetworkError ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse mt-1.5 ${isNetworkError ? 'bg-amber-500' : 'bg-red-500'}`} />
                <div className="flex-1">
                  <span className={`text-[10px] font-black uppercase leading-tight ${isNetworkError ? 'text-amber-700' : 'text-red-600'}`}>{error}</span>
                  {isNetworkError && (
                    <div className="mt-2 flex items-center gap-2">
                       <Settings size={10} className="text-amber-600" />
                       <span className="text-[9px] font-bold text-amber-600 underline cursor-pointer uppercase" onClick={() => window.location.reload()}>Reintentar conexión</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all group flex items-center justify-center gap-3 ${isNetworkError ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-dark shadow-brand-dark/20 hover:bg-black'}`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  INGRESAR AL PANEL
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Servidor: {storage.getServerUrl().replace('/api', '')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
