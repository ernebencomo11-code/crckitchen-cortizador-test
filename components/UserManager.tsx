
import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import { X, UserPlus, ShieldCheck, User, Trash2, Edit3, Save, ShieldAlert, Fingerprint, AlertTriangle, Check, RotateCcw, Lock, Eye, EyeOff } from 'lucide-react';
import { generateId } from '../utils/helpers';
import { toast } from 'sonner';

interface Props {
  users: AppUser[];
  onUpdateUsers: (newUsers: AppUser[]) => void;
  onClose: () => void;
  currentUser: AppUser;
}

export const UserManager: React.FC<Props> = ({ users, onUpdateUsers, onClose, currentUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [formData, setFormData] = useState<Partial<AppUser>>({ name: '', username: '', password: '', role: 'VENDEDOR' });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!formData.name || !formData.role || !formData.username || !formData.password) {
      toast.warning("Todos los campos, incluyendo la contraseña, son obligatorios.");
      return;
    }

    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...formData as AppUser } : u);
      onUpdateUsers(updated);
    } else {
      const newUser: AppUser = {
        id: generateId(),
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role as UserRole
      };
      onUpdateUsers([...users, newUser]);
    }
    closeForm();
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingUser(null);
    setShowPwd(false);
    setFormData({ name: '', username: '', password: '', role: 'VENDEDOR' });
  };

  const startEdit = (user: AppUser) => {
    setEditingUser(user);
    setFormData(user);
    setIsAdding(true);
  };

  const executeDelete = (id: string, role: UserRole) => {
    if (id === currentUser.id) {
      toast.error("No puedes eliminar tu propio acceso.");
      setConfirmDeleteId(null);
      return;
    }

    const admins = users.filter(u => u.role === 'ADMINISTRADOR');
    if (role === 'ADMINISTRADOR' && admins.length <= 1) {
      toast.error("Debe quedar al menos un Administrador en el sistema.");
      setConfirmDeleteId(null);
      return;
    }

    const filteredUsers = users.filter(u => u.id !== id);
    onUpdateUsers(filteredUsers);
    setConfirmDeleteId(null);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMINISTRADOR': return 'bg-red-50 text-red-600 border-red-100';
      case 'DISEÑADOR': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'VENDEDOR': return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">

        <header className="p-4 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-dark text-white rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-brand-dark uppercase tracking-tighter leading-none mb-1">Colaboradores</h2>
              <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Control de accesos y contraseñas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 p-3 md:px-6 md:py-3 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-orange/20"
            >
              <UserPlus size={16} /> <span className="hidden md:inline">AGREGAR PERSONAL</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-500"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 bg-[#F8FAFC]">
          {users.map(user => (
            <div key={user.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative flex flex-col h-64">

              {confirmDeleteId === user.id && (
                <div className="absolute inset-0 z-50 bg-red-600 rounded-[32px] p-6 flex flex-col items-center justify-center text-center text-white animate-in zoom-in duration-200">
                  <AlertTriangle size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4">¿Confirmar eliminación?</p>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-black uppercase transition-all">
                      <RotateCcw size={14} className="mx-auto" />
                    </button>
                    <button onClick={() => executeDelete(user.id, user.role)} className="flex-1 py-3 bg-white text-red-600 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase transition-all">
                      <Check size={14} className="mx-auto" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-brand-dark font-black text-xl">
                  {user.name.charAt(0)}
                </div>

                <div className="flex gap-1 relative z-10">
                  <button type="button" onClick={() => startEdit(user)} className="p-2.5 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/5 rounded-xl transition-all"><Edit3 size={18} /></button>
                  <button type="button" onClick={() => setConfirmDeleteId(user.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-black text-brand-dark uppercase tracking-tight text-lg leading-tight mb-2 line-clamp-2">{user.name}</h3>
                <p className="text-[10px] text-gray-400 font-mono mb-2">@{user.username}</p>
                <div className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getRoleBadgeStyle(user.role)}`}>
                  {user.role}
                </div>
              </div>

              {user.id === currentUser.id && (
                <div className="mt-auto flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-100">
                  <Fingerprint size={12} /> ERES TÚ (SESIÓN ACTIVA)
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="p-6 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
          <p className="text-[10px] font-bold text-amber-800 leading-tight uppercase tracking-wider">
            Seguridad: Las contraseñas establecidas aquí son almacenadas en la base de datos central. El administrador tiene la facultad de resetear claves de cualquier colaborador.
          </p>
        </footer>

        {isAdding && (
          <div className="fixed inset-0 z-[400] bg-brand-dark/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter">
                  {editingUser ? 'Perfil del Colaborador' : 'Nuevo Colaborador'}
                </h3>
                <button type="button" onClick={closeForm} className="text-gray-400 hover:text-brand-dark transition-all"><X size={24} /></button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                    <input type="text" autoFocus value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark" placeholder="Ej. Carlos Mendoza" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Usuario (Login)</label>
                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark" placeholder="Ej. cmendoza" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña de Acceso</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark">
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Rol y Permisos</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['ADMINISTRADOR', 'DISEÑADOR', 'VENDEDOR'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r })}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.role === r ? 'bg-brand-dark border-brand-dark text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <User size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">{r}</span>
                        </div>
                        {formData.role === r && <ShieldAlert size={14} className="text-brand-orange" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={closeForm} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest">Cancelar</button>
                  <button type="button" onClick={handleSave} disabled={!formData.name || !formData.username || !formData.password} className="flex-[2] py-5 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-brand-orange/20 disabled:opacity-50">
                    <Save size={20} className="inline mr-2" /> {editingUser ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
