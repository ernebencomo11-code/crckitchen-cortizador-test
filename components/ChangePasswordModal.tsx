
import React, { useState } from 'react';
import { X, Lock, Save, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { AppUser } from '../types';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUpdatePassword: (newPassword: string) => Promise<void>;
}

export const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose, currentUser, onUpdatePassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 3) {
      setError('La contraseña es demasiado corta.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdatePassword(newPassword);
      onClose();
      toast.success('Contraseña actualizada con éxito.');
    } catch (err) {
      setError('Error al actualizar la contraseña.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Cambiar Clave</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Seguridad de la cuenta</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-brand-dark"><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-500" />
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Estás cambiando la clave de @{currentUser.username}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirmar Contraseña</label>
              <input
                type={showPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest text-center animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest">Cancelar</button>
            <button
              type="submit"
              disabled={isSaving || !newPassword}
              className="flex-[2] py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-brand-dark/20 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Actualizar Clave
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
