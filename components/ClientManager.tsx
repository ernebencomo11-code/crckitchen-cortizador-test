
import React, { useState, useMemo } from 'react';
import { ClientProfile } from '../types';
import { Search, Plus, UserPlus, Edit3, Trash2, X, Save, Mail, Phone, MapPin, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateId } from '../utils/helpers';

interface Props {
  clients: ClientProfile[];
  onUpdateClients: (newClients: ClientProfile[]) => void;
  // Fix: Changed onDeleteClient signature to take an ID for better consistency with the backend API
  onDeleteClient: (id: string) => void;
  onClose: () => void;
}

export const ClientManager: React.FC<Props> = ({ clients, onUpdateClients, onDeleteClient, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<ClientProfile | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    name: '', email: '', phone: '', address: '', notes: ''
  });

  const filteredClients = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(lower) || 
      c.email.toLowerCase().includes(lower) ||
      c.phone.toLowerCase().includes(lower)
    ).sort((a, b) => (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1);
  }, [clients, searchTerm]);

  const handleSave = () => {
    if (!formData.name) return;

    if (isEditing) {
      const updated = clients.map(c => c.id === isEditing.id ? { ...c, ...formData } : c);
      onUpdateClients(updated);
    } else {
      const newClient: ClientProfile = {
        id: generateId(),
        isActive: true,
        createdAt: new Date().toISOString(),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        notes: formData.notes
      };
      onUpdateClients([...clients, newClient]);
    }
    closeForm();
  };

  const closeForm = () => {
    setIsEditing(null);
    setIsAdding(false);
    setFormData({ name: '', email: '', phone: '', address: '', notes: '' });
  };

  const startEdit = (client: ClientProfile) => {
    setIsEditing(client);
    setFormData(client);
    setIsAdding(true);
  };

  const toggleStatus = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    if (confirm(`¿Deseas eliminar definitivamente a ${client.name}?`)) {
      const updated = clients.filter(c => c.id !== id);
      onUpdateClients(updated);
      // Fix: Now passing the client.id instead of name
      onDeleteClient(client.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
      <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Directorio de Clientes</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{clients.filter(c => c.isActive).length} Clientes Registrados</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
            <UserPlus size={16} /> Nuevo Cliente
          </button>
          <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="p-8 bg-[#F8FAFC] flex-1 overflow-y-auto space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-16 pr-6 py-5 bg-white rounded-[24px] border-none shadow-sm outline-none focus:ring-2 focus:ring-brand-orange transition-all font-medium text-brand-dark"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className={`bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all group hover:shadow-xl ${!client.isActive && 'opacity-60 grayscale'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-dark font-black text-xl group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-brand-dark uppercase tracking-tight line-clamp-1">{client.name}</h3>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${client.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {client.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(client)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all"><Edit3 size={16} /></button>
                  <button onClick={() => toggleStatus(client.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <Mail size={14} className="text-gray-300" /> <span className="truncate">{client.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <Phone size={14} className="text-gray-300" /> <span>{client.phone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium pt-3 border-t border-gray-50">
                  <MapPin size={14} className="text-brand-orange flex-shrink-0" /> 
                  <span className="line-clamp-2 leading-tight">{client.address || 'Sin dirección registrada'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[250] bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">
                  {isEditing ? 'Editar Perfil' : 'Registro de Cliente'}
               </h3>
               <button onClick={closeForm} className="text-gray-400 hover:text-brand-dark transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                  placeholder="Ej. Arq. Claudia Rodríguez"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                    placeholder="(998) 123.4567"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Dirección / Obra</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                  placeholder="Av. Bonampak, SM 4, Cancún"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={!formData.name}
                className="w-full mt-6 py-5 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-brand-orange/20 disabled:opacity-50"
              >
                <Save size={20} className="inline mr-2" /> {isEditing ? 'Actualizar Cliente' : 'Guardar en Directorio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
