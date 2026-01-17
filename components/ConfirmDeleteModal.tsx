import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { AppUser } from '../types';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    currentUser: AppUser;
    title?: string;
}

export const ConfirmDeleteModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, currentUser, title = 'Confirmar Eliminación' }) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError('Ingresa tu contraseña para continuar.');
            return;
        }

        if (password !== currentUser.password) {
            setError('Contraseña incorrecta.');
            toast.error('Contraseña incorrecta. No se puede eliminar.');
            return;
        }

        setIsLoading(true);
        try {
            await onConfirm();
            toast.success('Proyecto eliminado correctamente.');
            onClose();
        } catch (err) {
            toast.error('Error al eliminar el proyecto.');
            setError('Ocurrió un error al procesar la solicitud.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-red-100">
                <header className="p-8 border-b border-red-50 flex justify-between items-center bg-red-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter">{title}</h2>
                            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Zona de Peligro</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-brand-dark"><X size={24} /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                        <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-red-800 leading-relaxed">
                            Esta acción es irreversible. Por seguridad, ingresa tu contraseña para confirmar que deseas eliminar este proyecto permanentemente.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña de Confirmación</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                autoFocus
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-brand-dark"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest text-center animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            Eliminar Proyecto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
