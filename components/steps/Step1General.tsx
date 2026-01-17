
import React, { useState } from 'react';
import { QuoteData, ProjectCategory, ClientProfile, Client, ProjectType, QuoteStatus, InternalNote, AppUser, Category, Prototype } from '../../types';
import { User, Briefcase, Calendar, Coins, Hash, Home, Bath, DoorOpen, Layers, Search, UserPlus, CheckCircle2, Building, Layout, Info, Tag, MessageSquare, Send, Trash2, Utensils, Armchair, PlusCircle, MinusCircle, Copy } from 'lucide-react';
import { generateId } from '../../utils/helpers';
import { toast } from 'sonner';

interface Props {
  data: QuoteData;
  updateData: (data: Partial<QuoteData>) => void;
  clients: ClientProfile[];
  categories: Category[];
  onSaveClient: (client: ClientProfile) => void;
  currentUser: AppUser;
}

const ICON_MAP = {
  Utensils: Utensils,
  Bath: Bath,
  DoorOpen: DoorOpen,
  Layers: Layers,
  Home: Home,
  Armchair: Armchair
};

export const Step1General: React.FC<Props> = ({ data, updateData, clients, categories, onSaveClient, currentUser }) => {
  const [showClientList, setShowClientList] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [newNote, setNewNote] = useState('');

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ client: { ...data.client, [e.target.name]: e.target.value } });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ project: { ...data.project, [e.target.name]: e.target.value } });
  };

  const selectClient = (profile: ClientProfile) => {
    updateData({
      client: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      }
    });
    setShowClientList(false);
    setClientSearch('');
  };

  // GESTIÓN DE PROTOTIPOS (Ahora disponible para todos)
  const addPrototype = () => {
    const newProto: Prototype = {
      id: generateId(),
      name: `MODELO ${String.fromCharCode(65 + (data.prototypes?.length || 0))}`,
      quantity: 1,
      budget: []
    };
    updateData({ prototypes: [...(data.prototypes || []), newProto] });
  };

  const updatePrototype = (id: string, updates: Partial<Prototype>) => {
    const updated = (data.prototypes || []).map(p => p.id === id ? { ...p, ...updates } : p);
    updateData({ prototypes: updated });
  };

  const deletePrototype = (id: string) => {
    // No permitir borrar si es el único
    if ((data.prototypes || []).length <= 1) {
      toast.warning("Debe existir al menos un modelo o área en la propuesta.");
      return;
    }
    updateData({ prototypes: (data.prototypes || []).filter(p => p.id !== id) });
  };

  const duplicatePrototype = (proto: Prototype) => {
    const newProto = { ...proto, id: generateId(), name: `${proto.name} (COPIA)` };
    updateData({ prototypes: [...(data.prototypes || []), newProto] });
  };

  const handleRegisterAsNew = () => {
    if (!data.client.name) return;
    const newProfile: ClientProfile = {
      ...data.client,
      id: generateId(),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    onSaveClient(newProfile);
    toast.success(`Cliente "${newProfile.name}" registrado en el directorio.`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: InternalNote = {
      id: generateId(),
      text: newNote,
      authorId: currentUser.id,
      authorName: currentUser.name,
      timestamp: new Date().toISOString()
    };
    const updatedNotes = [...(data.notes || []), note];
    updateData({ notes: updatedNotes });
    setNewNote('');
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = (data.notes || []).filter(n => n.id !== noteId);
    updateData({ notes: updatedNotes });
  };

  const filteredDirectory = clients.filter(c =>
    c.isActive && (
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase())
    )
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

        <div className="lg:col-span-2 space-y-8">

          <section className="bg-white p-6 sm:p-8 lg:p-10 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <User size={120} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">Información del Cliente</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Personalización</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowClientList(!showClientList)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100"
                >
                  <Search size={14} /> Directorio
                </button>

                {showClientList && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <input type="text" autoFocus placeholder="Nombre o email..." className="w-full px-4 py-2 bg-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-orange border-none shadow-inner" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredDirectory.length === 0 ? (<p className="p-6 text-center text-xs text-gray-400 italic">No se encontraron clientes</p>) : (
                        filteredDirectory.map(c => (
                          <button key={c.id} onClick={() => selectClient(c)} className="w-full px-6 py-4 text-left hover:bg-brand-orange/5 transition-colors border-b border-gray-50 flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black group-hover:bg-brand-orange/10 group-hover:text-brand-orange">{c.name.charAt(0)}</div>
                            <div><p className="text-xs font-black text-brand-dark uppercase tracking-tight">{c.name}</p><p className="text-[10px] text-gray-400 font-medium">{c.email || c.phone}</p></div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="group">
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-brand-orange transition-colors">Nombre del Cliente</label>
                  {data.client.name && !clients.some(c => c.name === data.client.name) && (<button onClick={handleRegisterAsNew} className="text-[9px] font-black text-brand-orange uppercase hover:underline flex items-center gap-1"><UserPlus size={10} /> Registrar</button>)}
                </div>
                <input type="text" name="name" value={data.client.name} onChange={handleClientChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all text-lg font-bold text-brand-dark placeholder:text-gray-300" placeholder="Ej. Arq. Rodrigo Mendoza" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Correo</label><input type="email" name="email" value={data.client.email} onChange={handleClientChange} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-brand-orange outline-none transition-all text-sm font-bold" /></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label><input type="text" name="phone" value={data.client.phone} onChange={handleClientChange} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-brand-orange outline-none transition-all text-sm font-bold" /></div>
                <div className="sm:col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Dirección</label><input type="text" name="address" value={data.client.address} onChange={handleClientChange} className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-brand-orange outline-none transition-all text-sm font-bold" /></div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 lg:p-10 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Briefcase size={120} /></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-brand-dark/5 rounded-2xl flex items-center justify-center text-brand-dark shrink-0"><Briefcase size={24} /></div>
              <div><h3 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">Detalles del Proyecto</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Referencia técnica</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 group"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre de la Obra / Edificio</label><input type="text" name="name" value={data.project.name} onChange={handleProjectChange} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-brand-orange outline-none transition-all text-lg font-bold text-brand-dark" placeholder="Ej. Residencia Playa del Carmen" /></div>
              <div className="md:col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Categoría</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {categories.filter(c => c.isActive).map(cat => {
                    const IconComp = ICON_MAP[cat.icon as keyof typeof ICON_MAP] || Layers;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => updateData({ category: cat.name })}
                        className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all gap-2 ${data.category === cat.name ? 'bg-brand-dark border-brand-dark text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                      >
                        <IconComp size={16} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* NUEVA ACTUALIZACIÓN: SECTOR DE MODELOS/ÁREAS UNIVERSALES (Particular y Proyecto) */}
          <section className="bg-white p-6 sm:p-8 lg:p-10 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Layout size={24} /></div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tighter">Modelos / Áreas</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    {data.projectType === 'PROYECTO' ? 'Desglose de prototipos del edificio' : 'Desglose de espacios de la residencia'}
                  </p>
                </div>
              </div>
              <button onClick={addPrototype} className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">
                <PlusCircle size={16} /> {data.projectType === 'PROYECTO' ? 'Añadir Prototipo' : 'Añadir Área'}
              </button>
            </div>

            <div className="space-y-4">
              {(data.prototypes || []).length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No hay áreas definidas aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {data.prototypes.map((proto, idx) => (
                    <div key={proto.id} className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-6 rounded-[24px] border border-gray-100 group hover:border-blue-200 hover:bg-white transition-all">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-500 shadow-sm">{idx + 1}</div>
                      <div className="flex-1 w-full">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre del Modelo / Espacio</label>
                        <input type="text" value={proto.name} onChange={(e) => updatePrototype(proto.id, { name: e.target.value.toUpperCase() })} className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-black text-brand-dark uppercase" placeholder="Ej. COCINA PRINCIPAL" />
                      </div>
                      <div className="w-full sm:w-40">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Cantidad</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updatePrototype(proto.id, { quantity: Math.max(1, proto.quantity - 1) })} className="text-gray-300 hover:text-brand-dark"><MinusCircle size={18} /></button>
                          <span className="text-xl font-black text-brand-dark w-10 text-center">{proto.quantity}</span>
                          <button onClick={() => updatePrototype(proto.id, { quantity: proto.quantity + 1 })} className="text-gray-300 hover:text-brand-dark"><PlusCircle size={18} /></button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => duplicatePrototype(proto)} className="p-3 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Duplicar"><Copy size={18} /></button>
                        <button onClick={() => deletePrototype(proto.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.projectType === 'PROYECTO' && (
                <div className="mt-6 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Total Unidades del Edificio:</span>
                  <span className="text-2xl font-black text-blue-600">{(data.prototypes || []).reduce((acc, p) => acc + p.quantity, 0)}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6"><Hash size={18} className="text-brand-orange" /><h4 className="font-black text-brand-dark uppercase tracking-widest text-[10px]">Identificación</h4></div>
            <div className="space-y-4">
              <div><label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Folio</label><input type="text" name="quoteNumber" value={data.project.quoteNumber} onChange={handleProjectChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-black text-brand-dark focus:ring-2 focus:ring-brand-orange" /></div>
              <div><label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fecha</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} /><input type="date" name="date" value={data.project.date} onChange={handleProjectChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-brand-dark focus:ring-2 focus:ring-brand-orange" /></div></div>
            </div>
          </section>

          <section className="bg-brand-dark p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-xl text-white">
            <div className="flex items-center gap-3 mb-6"><Coins size={18} className="text-brand-orange" /><h4 className="font-black text-white uppercase tracking-widest text-[10px]">Régimen de Proyecto</h4></div>
            <div className="flex p-1 bg-white/5 rounded-2xl mb-6">
              <button onClick={() => updateData({ projectType: 'PARTICULAR' })} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${data.projectType === 'PARTICULAR' ? 'bg-white text-brand-dark' : 'text-white/40 hover:text-white'}`}>Particular</button>
              <button onClick={() => updateData({ projectType: 'PROYECTO' })} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${data.projectType === 'PROYECTO' ? 'bg-white text-brand-dark' : 'text-white/40 hover:text-white'}`}>Masivo (Proyectos)</button>
            </div>
            {data.projectType === 'PARTICULAR' && (
              <div className="animate-in fade-in duration-300">
                <p className="text-[10px] text-white/40 font-bold uppercase leading-relaxed">Usa este modo para cotizaciones residenciales directas a un solo cliente. Ahora puedes desglosar por áreas.</p>
              </div>
            )}
            {data.projectType === 'PROYECTO' && (
              <div className="animate-in fade-in duration-300">
                <p className="text-[10px] text-white/60 font-bold uppercase leading-relaxed">Activado modo Prototipos. Podrás desglosar múltiples modelos de departamentos.</p>
              </div>
            )}
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-gray-100 flex flex-col h-[50vh] md:h-[400px]">
            <div className="flex items-center gap-3 mb-4"><MessageSquare size={18} className="text-brand-orange" /><h4 className="font-black text-brand-dark uppercase tracking-widest text-[10px]">Notas Internas</h4></div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-hide">
              {[...(data.notes || [])].reverse().map(note => (<div key={note.id} className="group flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-gray-100 text-[10px] font-black flex items-center justify-center shrink-0">{note.authorName.charAt(0)}</div><div className="flex-1 bg-gray-50 rounded-2xl p-4"><div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-brand-dark uppercase">{note.authorName}</span>{(currentUser.role === 'ADMINISTRADOR' || currentUser.id === note.authorId) && (<button onClick={() => handleDeleteNote(note.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>)}</div><p className="text-xs text-gray-600 leading-snug">{note.text}</p></div></div>))}
              {(!data.notes || data.notes.length === 0) && (<div className="text-center py-10 text-xs text-gray-300 font-bold uppercase">Sin notas</div>)}
            </div>
            <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-100">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }} placeholder="Escribe un comentario..." className="flex-1 bg-gray-50 rounded-xl border-none text-xs focus:ring-2 focus:ring-brand-orange resize-none h-12 py-3" />
              <button onClick={handleAddNote} className="w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-black transition-all"><Send size={16} /></button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
