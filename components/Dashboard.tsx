
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { QuoteData, Branding, QuoteStatus, ProjectCategory, AppUser, Category } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Search, Plus, Edit2, Copy, Trash2, Home, Database, Settings, Check, ShieldCheck, LogOut, Menu, X, Share2, ChevronDown, ChevronUp, MessageCircle, Link, Layout, TrendingUp, BarChart3, Target, Filter, XCircle, Utensils, Bath, DoorOpen, Layers, Armchair, User, History, Wifi, WifiOff, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface Props {
  isOnline: boolean;
  quotes: QuoteData[];
  branding: Branding;
  users: AppUser[];
  currentUser: AppUser;
  categories: Category[];
  onLogout: () => void;
  onCreateNew: () => void;
  onEdit: (quote: QuoteData) => void;
  onDuplicate: (quote: QuoteData) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: QuoteStatus) => void;
  onOpenBranding: () => void;
  onOpenDatabase: () => void;
  onOpenCategories: () => void;
  onOpenClients: () => void;
  onOpenUsers: () => void;
  onOpenChangePassword: () => void;
  onOpenServerSettings: () => void;
  onOpenPDFSettings: () => void;
  installPromptEvent: any;
  onInstallPWA: () => void;
  isIOS?: boolean;
  onViewHistory?: (quote: QuoteData) => void;
}

const ICON_MAP = {
  Utensils: Utensils,
  Bath: Bath,
  DoorOpen: DoorOpen,
  Layers: Layers,
  Home: Home,
  Armchair: Armchair
};

export const Dashboard: React.FC<Props> = ({
  isOnline, quotes, branding, users, currentUser, categories, onLogout, onCreateNew, onEdit, onDuplicate, onDelete, onUpdateStatus, onOpenBranding, onOpenDatabase, onOpenCategories, onOpenClients, onOpenUsers, onOpenChangePassword, onOpenServerSettings, onOpenPDFSettings, installPromptEvent, onInstallPWA, isIOS, onViewHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const [openShareMenuId, setOpenShareMenuId] = useState<string | null>(null);
  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);

  // States for Secure Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  const statusMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === 'ADMINISTRADOR';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setOpenStatusMenuId(null);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setOpenShareMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    const accepted = quotes.filter(q => q.status === 'ACEPTADA');
    const totalValue = accepted.reduce((acc, q) => {
      const quoteTotal = q.budget.reduce((bAcc, item) => bAcc + (item.quantity * item.unitPrice), 0);
      return acc + quoteTotal;
    }, 0);

    const conversionRate = quotes.length > 0 ? (accepted.length / quotes.length) * 100 : 0;
    const statusCounts = quotes.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    }, {} as Record<QuoteStatus, number>);

    return { totalValue, conversionRate, statusCounts, totalCount: quotes.length };
  }, [quotes]);

  const toggleStatusFilter = (status: QuoteStatus) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleCategoryFilter = (cat: ProjectCategory) => {
    setCategoryFilter(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setCategoryFilter([]);
    setSearchTerm('');
  };

  const handleCopyLink = (quote: QuoteData) => {
    const hash = btoa(quote.id);
    const url = `${window.location.origin}${window.location.pathname}#view/${hash}`;
    navigator.clipboard.writeText(url);
    toast.success(`Enlace copiado con éxito.`);
    setOpenShareMenuId(null);
  };

  const handleWhatsAppShare = (quote: QuoteData) => {
    const hash = btoa(quote.id);
    const url = `${window.location.origin}${window.location.pathname}#view/${hash}`;
    const text = encodeURIComponent(`Hola ${quote.client.name}, adjunto la propuesta de CR Kitchen & Design para el proyecto "${quote.project.name}". Puedes verla aquí: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setOpenShareMenuId(null);
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = !searchTerm ||
        q.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.project.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(q.status);
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(q.category);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [quotes, searchTerm, statusFilter, categoryFilter]);

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case 'BORRADOR': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'ENVIADA': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'ACEPTADA': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'RECHAZADA': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  const statusOptions: { id: QuoteStatus; label: string; color: string }[] = [
    { id: 'BORRADOR', label: 'BORRADOR', color: 'bg-slate-400' },
    { id: 'ENVIADA', label: 'ENVIADA', color: 'bg-blue-500' },
    { id: 'ACEPTADA', label: 'ACEPTADA', color: 'bg-emerald-500' },
    { id: 'RECHAZADA', label: 'RECHAZADA', color: 'bg-red-500' },
  ];

  const groupedQuotesByDate = useMemo(() => {
    const groups: Record<string, QuoteData[]> = {};
    filteredQuotes.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).forEach(q => {
      const date = new Date(q.lastModified).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase();
      if (!groups[date]) groups[date] = [];
      groups[date].push(q);
    });
    return groups;
  }, [filteredQuotes]);

  const getCategoryIcon = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return <Layers size={12} />;
    const IconComp = ICON_MAP[cat.icon as keyof typeof ICON_MAP] || Layers;
    return <IconComp size={12} />;
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#F9FAFB] relative font-sans">

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#FEECE5] flex flex-col p-6 space-y-6 flex-shrink-0 border-r border-orange-100 shadow-xl lg:shadow-sm transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto scrollbar-hide`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm"><img src={branding.logo} className="w-8 h-8 object-contain" /></div>
            <div><h1 className="font-black text-brand-dark uppercase tracking-tight text-[11px] leading-none mb-0.5">CR DASHBOARD</h1></div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 lg:hidden text-gray-400"><X size={20} /></button>
        </div>

        {/* Buscador */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Buscador Rápido</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
            <input
              type="text"
              placeholder="Folio, Cliente o Proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-orange-100 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-orange-100/50">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Filtros Activos</label>
            {(statusFilter.length > 0 || categoryFilter.length > 0) && (
              <button onClick={clearFilters} className="text-[8px] font-black text-brand-orange uppercase hover:underline">Limpiar</button>
            )}
          </div>

          {/* Filtros por Estado */}
          <div className="space-y-2">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Filter size={10} /> Status del Pipeline</span>
            <div className="grid grid-cols-2 gap-1.5">
              {statusOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => toggleStatusFilter(opt.id)}
                  className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${statusFilter.includes(opt.id) ? 'bg-brand-dark border-brand-dark text-white' : 'bg-white/40 border-orange-50 text-gray-400 hover:bg-white'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${opt.color}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros por Categoría */}
          <div className="space-y-2">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Layout size={10} /> Tipo de Proyecto</span>
            <div className="grid grid-cols-1 gap-1.5">
              {categories.filter(c => c.isActive).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategoryFilter(cat.name)}
                  className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${categoryFilter.includes(cat.name) ? 'bg-brand-orange border-brand-orange text-white' : 'bg-white/40 border-orange-50 text-gray-400 hover:bg-white'}`}
                >
                  {getCategoryIcon(cat.name)}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-orange-100/50">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Administración</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onOpenClients} className="flex flex-col items-center justify-center p-3 bg-white/60 border border-orange-50 rounded-xl hover:bg-white hover:shadow-md transition-all group text-gray-500"><Home size={14} className="mb-1 group-hover:text-brand-orange" /><span className="text-[8px] font-black uppercase">Clientes</span></button>
            <button onClick={onOpenDatabase} className="flex flex-col items-center justify-center p-3 bg-white/60 border border-orange-50 rounded-xl hover:bg-white hover:shadow-md transition-all group text-gray-500"><Database size={14} className="mb-1 group-hover:text-brand-orange" /><span className="text-[8px] font-black uppercase">Catálogo</span></button>
            {isAdmin && (
              <>
                <button onClick={onOpenCategories} className="flex flex-col items-center justify-center p-3 bg-white/60 border border-orange-50 rounded-xl hover:bg-white hover:shadow-md transition-all group text-gray-500"><Layers size={14} className="mb-1 group-hover:text-brand-orange" /><span className="text-[8px] font-black uppercase">Categorías</span></button>
                <button onClick={onOpenUsers} className="flex flex-col items-center justify-center p-3 bg-white/60 border border-orange-50 rounded-xl hover:bg-white hover:shadow-md transition-all group text-gray-500"><ShieldCheck size={14} className="mb-1 group-hover:text-brand-orange" /><span className="text-[8px] font-black uppercase">Personal</span></button>
              </>
            )}
            <button onClick={onOpenBranding} className="flex flex-col items-center justify-center p-3 bg-white/60 border border-orange-50 rounded-xl hover:bg-white hover:shadow-md transition-all group text-gray-500"><Settings size={14} className="mb-1 group-hover:text-brand-orange" /><span className="text-[8px] font-black uppercase">Empresa</span></button>
            {isAdmin && <button onClick={onOpenPDFSettings} className="flex flex-col items-center justify-center p-3 bg-white/60 border border-orange-50 rounded-xl hover:bg-white hover:shadow-md transition-all group text-gray-500"><Layout size={14} className="mb-1 group-hover:text-brand-orange" /><span className="text-[8px] font-black uppercase">Diseño PDF</span></button>}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-orange-100/50">
          <div className="bg-white/40 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-dark text-white rounded-xl flex items-center justify-center font-black">{currentUser.name.charAt(0)}</div>
              <div className="overflow-hidden"><p className="text-[10px] font-black text-brand-dark truncate">{currentUser.name}</p><span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white">{currentUser.role}</span></div>
              <button onClick={onLogout} className="ml-auto text-gray-300 hover:text-red-400"><LogOut size={14} /></button>
            </div>

            {/* NUEVA ACTUALIZACIÓN: Indicador de conexión Minimalista */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">
                {isOnline ? 'Sincronizado' : 'Offline'}
              </span>
              {isOnline ? <Wifi size={8} className="text-emerald-500" /> : <WifiOff size={8} className="text-red-400" />}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB]">
        <header className="flex-shrink-0 px-6 md:px-10 pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 lg:hidden text-brand-dark hover:bg-gray-100 rounded-lg transition-colors"><Menu size={28} strokeWidth={2.5} /></button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-brand-dark uppercase tracking-tighter mb-1">GESTIÓN COMERCIAL</h2>
              <div className="flex items-center gap-3">
                <div className="h-1 w-10 bg-brand-orange rounded-full"></div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">PROYECTOS ACTIVOS</p>
                <button
                  onClick={() => setIsAnalyticsVisible(!isAnalyticsVisible)}
                  className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${isAnalyticsVisible ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  <BarChart3 size={12} /> {isAnalyticsVisible ? 'Ocultar Resumen' : 'Ver Resumen'}
                  {isAnalyticsVisible ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={onCreateNew} className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.1em] shadow-xl shadow-brand-orange/30 hover:scale-105 transition-all"><Plus size={18} strokeWidth={4} /> NUEVA PROPUESTA</button>
        </header>

        <div className={`px-6 md:px-10 transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0 ${isAnalyticsVisible ? 'max-h-[500px] pt-8 opacity-100' : 'max-h-0 pt-0 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all"><TrendingUp size={24} /></div>
              <div><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Inversión Aceptada</p><h4 className="text-lg font-black text-brand-dark leading-tight">{formatCurrency(stats.totalValue, 'MXN')}</h4></div>
            </div>
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all"><Target size={24} /></div>
              <div><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Tasa de Efectividad</p><h4 className="text-lg font-black text-brand-dark leading-tight">{stats.conversionRate.toFixed(1)}%</h4></div>
            </div>
            <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col justify-center col-span-1 lg:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={12} className="text-brand-orange" /> Composición del Pipeline</p>
                <span className="text-[9px] font-black text-brand-dark">{stats.totalCount} Cotizaciones</span>
              </div>
              <div className="flex h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(stats.statusCounts['ACEPTADA'] || 0) / stats.totalCount * 100}%` }} title={`Aceptadas: ${stats.statusCounts['ACEPTADA'] || 0}`} />
                <div className="h-full bg-blue-500 rounded-full mx-0.5 transition-all duration-700 delay-100" style={{ width: `${(stats.statusCounts['ENVIADA'] || 0) / stats.totalCount * 100}%` }} title={`Enviadas: ${stats.statusCounts['ENVIADA'] || 0}`} />
                <div className="h-full bg-slate-300 rounded-full transition-all duration-700 delay-200" style={{ width: `${(stats.statusCounts['BORRADOR'] || 0) / stats.totalCount * 100}%` }} title={`Borrador: ${stats.statusCounts['BORRADOR'] || 0}`} />
                <div className="h-full bg-red-400 rounded-full transition-all duration-700 delay-300" style={{ width: `${(stats.statusCounts['RECHAZADA'] || 0) / stats.totalCount * 100}%` }} title={`Rechazada: ${stats.statusCounts['RECHAZADA'] || 0}`} />
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-[7px] font-black text-gray-400 uppercase">Aceptada</span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div><span className="text-[7px] font-black text-gray-400 uppercase">Enviada</span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div><span className="text-[7px] font-black text-gray-400 uppercase">Borrador</span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div><span className="text-[7px] font-black text-gray-400 uppercase">Rechazada</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 mt-8 flex-shrink-0 flex justify-between items-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Mostrando <span className="text-brand-dark">{filteredQuotes.length}</span> de {quotes.length} proyectos
            {(statusFilter.length > 0 || categoryFilter.length > 0 || searchTerm) && <span className="text-brand-orange ml-2">• FILTROS ACTIVOS</span>}
          </p>
          {(statusFilter.length > 0 || categoryFilter.length > 0 || searchTerm) && (
            <button onClick={clearFilters} className="text-[9px] font-black text-brand-orange uppercase flex items-center gap-1.5 hover:scale-105 transition-transform"><XCircle size={14} /> Mostrar todos</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 scrollbar-hide">
          {filteredQuotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
                <Search size={40} />
              </div>
              <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">Sin coincidencias</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-xs uppercase font-bold tracking-widest leading-relaxed">No encontramos proyectos con los criterios seleccionados.</p>
              <button onClick={clearFilters} className="mt-8 px-8 py-3 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Restablecer vista</button>
            </div>
          ) : (
            (Object.entries(groupedQuotesByDate) as [string, QuoteData[]][]).map(([month, monthQuotes]) => (
              <div key={month} className="mb-12">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">{month} <div className="h-px flex-1 bg-gray-100"></div></h3>
                <div className="space-y-4">
                  {monthQuotes.map(quote => (
                    <div key={quote.id} className="group bg-white p-5 rounded-[24px] border border-gray-100 hover:border-brand-orange/40 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5 flex-1 min-w-0 w-full">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 shrink-0 group-hover:bg-brand-orange/5 group-hover:text-brand-orange">
                          <span className="text-sm font-black leading-none">{new Date(quote.lastModified).getDate()}</span>
                          <span className="text-[7px] font-black uppercase">{new Date(quote.lastModified).toLocaleString('es-MX', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1.5 flex-wrap">
                            <h3 className="font-black text-brand-dark uppercase tracking-tight truncate text-lg leading-none">{quote.project.name || 'SIN NOMBRE'}</h3>
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenStatusMenuId(openStatusMenuId === quote.id ? null : quote.id); }}
                                className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition-all hover:shadow-md ${getStatusColor(quote.status)}`}
                              >
                                {quote.status} <ChevronDown size={8} />
                              </button>
                              {openStatusMenuId === quote.id && (
                                <div ref={statusMenuRef} className="absolute top-full left-0 mt-2 w-36 bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                                  {statusOptions.map(option => (
                                    <button
                                      key={option.id}
                                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(quote.id, option.id); setOpenStatusMenuId(null); }}
                                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0 hover:bg-gray-50 flex items-center justify-between ${quote.status === option.id ? 'text-brand-dark bg-gray-50' : 'text-gray-400'}`}
                                    >
                                      {option.label}
                                      {quote.status === option.id && <Check size={10} className="text-brand-orange" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-full text-[7px] font-black uppercase flex items-center gap-1.5">
                              {getCategoryIcon(quote.category)} {quote.category}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[9px] font-bold text-gray-400">
                            <span className="flex items-center gap-1.5 uppercase tracking-tighter"><div className="w-1 h-1 rounded-full bg-brand-orange"></div> {quote.project.quoteNumber}</span>
                            <span className="flex items-center gap-1.5 uppercase tracking-tighter truncate text-slate-600 font-extrabold"><User size={11} className="text-brand-orange" /> {quote.client.name || 'SIN NOMBRE'}</span>
                            {quote.lastEditedBy && (
                              <span className="flex items-center gap-1.5 uppercase tracking-tighter text-blue-500/80 font-black ml-auto border-l border-gray-200 pl-4 hidden md:flex">
                                <Edit2 size={10} /> Editado por: {quote.lastEditedBy.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full lg:w-auto gap-4 mt-2 lg:mt-0">
                        <div className="text-left lg:text-right flex-shrink-0">
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] block mb-0.5">Inversión</span>
                          <span className="text-xl lg:text-2xl font-black text-brand-dark tracking-tighter">{formatCurrency(quote.budget.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0), quote.currency)}</span>
                        </div>
                        <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => onViewHistory?.(quote)} className="p-2.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Ver Bitácora de Cambios"><History size={18} /></button>
                          <button onClick={() => onEdit(quote)} className="p-2.5 text-gray-300 hover:text-brand-orange hover:bg-brand-orange/5 rounded-xl transition-all" title="Editar"><Edit2 size={18} /></button>
                          <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setOpenShareMenuId(openShareMenuId === quote.id ? null : quote.id); }} className="p-2.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Compartir"><Share2 size={18} /></button>
                            {openShareMenuId === quote.id && (
                              <div ref={shareMenuRef} className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[60] animate-in fade-in slide-in-from-top-2">
                                <button onClick={() => handleCopyLink(quote)} className="w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 text-blue-600 transition-all flex items-center gap-3 mb-1"><Link size={14} /> Copiar Enlace</button>
                                <button onClick={() => handleWhatsAppShare(quote)} className="w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 text-emerald-600 transition-all flex items-center gap-3"><MessageCircle size={14} /> WhatsApp</button>
                              </div>
                            )}
                          </div>
                          <button onClick={() => onDuplicate(quote)} className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Duplicar"><Copy size={18} /></button>
                          <button onClick={() => { setQuoteToDelete(quote.id); setIsDeleteModalOpen(true); }} className="p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Borrar"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Botón Flotante para Instalar PWA - Lógica corregida */}
      {installPromptEvent && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-500">
          <button
            onClick={onInstallPWA}
            title="Instalar aplicación en tu dispositivo"
            className="flex items-center justify-center gap-3 w-16 h-16 md:w-auto md:px-6 md:py-4 bg-brand-orange text-white rounded-full font-black uppercase text-xs tracking-widest shadow-2xl shadow-brand-orange/30 hover:scale-105 transition-all"
          >
            <Download size={24} className="md:size-16" />
            <span className="hidden md:inline ml-2">Instalar App</span>
          </button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setQuoteToDelete(null); }}
        onConfirm={async () => {
          if (quoteToDelete) {
            await onDelete(quoteToDelete);
            setQuoteToDelete(null);
          }
        }}
        currentUser={currentUser}
        title="Eliminar Proyecto"
      />
    </div>
  );
};
