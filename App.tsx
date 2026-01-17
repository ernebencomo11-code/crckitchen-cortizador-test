
import React, { useState, useEffect } from 'react';
import {
  QuoteData, AppView, AppUser, Branding, Category,
  CatalogItem, LineItem, ClientProfile, Step, PreviewSettings,
  QuoteVersion, Terms
} from './types';
import { storage } from './storage';
import { DEFAULT_QUOTE, DEFAULT_BRANDING, BUDGET_SECTIONS, MOCK_USERS } from './constants';
import { generateId } from './utils/helpers';
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, History, Save, Eye, Check, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Components
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { StepNavigator } from './components/StepNavigator';
import { Step1General } from './components/steps/Step1General';
import { Step2Gallery } from './components/steps/Step2Gallery';
import { Step3Budget } from './components/steps/Step3Budget';
import { Step4Terms } from './components/steps/Step4Terms';
import { CatalogModal } from './components/CatalogModal';
import { PreviewModal } from './components/PreviewModal';
import { BrandingModal } from './components/BrandingModal';
import { DatabaseManager } from './components/DatabaseManager';
import { ClientManager } from './components/ClientManager';
import { UserManager } from './components/UserManager';
import { CategoryManager } from './components/CategoryManager';
import { ServerSettingsModal } from './components/ServerSettingsModal';
import { PDFSettingsModal } from './components/PDFSettingsModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { TemplateModal } from './components/TemplateModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [activeQuote, setActiveQuote] = useState<QuoteData>(DEFAULT_QUOTE);
  const [currentStep, setCurrentStep] = useState<Step>('general');
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);

  // Modal states
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isServerOpen, setIsServerOpen] = useState(false);
  const [isPDFSettingsOpen, setIsPDFSettingsOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // NUEVOS ESTADOS RESTAURADOS
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [targetCategory, setTargetCategory] = useState<string>('');
  const [activeProtoId, setActiveProtoId] = useState<string>('');

  const stepsOrder: Step[] = ['general', 'gallery', 'budget', 'terms'];

  useEffect(() => {
    const init = async () => {
      const savedUser = await storage.getLastUser();
      if (savedUser) {
        setCurrentUser(savedUser);
        setView('dashboard');
      }

      const [q, b, cat, cli, categ, u] = await Promise.all([
        storage.getQuotes(),
        storage.getBranding(),
        storage.getCatalog(),
        storage.getClients(),
        storage.getCategories(),
        storage.getUsers()
      ]);

      setQuotes(q || []);
      if (b) setBranding(b);
      setCatalog(cat || []);
      setClients(cli || []);
      setCategories(categ || []);
      if (u) setUsers(u);
    };
    init();
  }, []);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    storage.saveLastUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hybrid_last_user');
    setView('login');
  };

  const updateQuote = (updates: Partial<QuoteData>) => {
    setActiveQuote(prev => ({ ...prev, ...updates }));
  };

  const handleEditQuote = (quote: QuoteData) => {
    setActiveQuote(quote);
    setView('editor');
    setCurrentStep('general');
  };

  const handleCreateNew = () => {
    const newQuote: QuoteData = {
      ...DEFAULT_QUOTE,
      id: generateId(),
      project: { ...DEFAULT_QUOTE.project, quoteNumber: `QT-${Date.now()}` },
      createdBy: currentUser || undefined
    };
    setActiveQuote(newQuote);
    setView('editor');
    setCurrentStep('general');
  };

  const handleSaveQuote = async () => {
    // Crear una versión antes de guardar si hay cambios significativos (opcional)
    const currentVersion: QuoteVersion = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      data: activeQuote,
      note: 'Guardado manual',
      total: activeQuote.budget.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    };

    const updatedQuoteWithVersion = {
      ...activeQuote,
      versions: [...(activeQuote.versions || []), currentVersion],
      lastModified: new Date().toISOString(),
      lastEditedBy: currentUser || undefined
    };

    const updatedQuotes = quotes.some(q => q.id === activeQuote.id)
      ? quotes.map(q => q.id === activeQuote.id ? updatedQuoteWithVersion : q)
      : [...quotes, updatedQuoteWithVersion];

    setActiveQuote(updatedQuoteWithVersion);
    setQuotes(updatedQuotes);

    setIsSaving(true);
    try {
      await storage.saveQuotes(updatedQuotes);
      // No salimos al dashboard, solo guardamos
      setIsSaved(true);
      toast.success("Proyecto guardado correctamente.");
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Error al guardar el proyecto.");
    } finally {
      setIsSaving(false);
    }
  };

  const openPicker = (category: string, protoId?: string) => {
    setTargetCategory(category);
    if (protoId) setActiveProtoId(protoId);
    setIsCatalogOpen(true);
  };

  const handleSelectItem = (item: CatalogItem) => {
    const newItem: LineItem = {
      id: generateId(),
      codigo: item.codigo,
      selected: true,
      category: targetCategory || BUDGET_SECTIONS.MOBILIARIO,
      concept: item.descripcion,
      description: '',
      unit: item.unidad || 'pza',
      quantity: 1,
      unitPrice: item.precio,
      image: item.image || ''
    };

    const updatedProtos = (activeQuote.prototypes || []).map(p => {
      if (p.id === activeProtoId) return { ...p, budget: [...p.budget, newItem] };
      return p;
    });

    updateQuote({ prototypes: updatedProtos });
    setIsCatalogOpen(false);
  };

  // Lógica para cargar plantilla
  const handleLoadTemplate = (budget: LineItem[], terms: Terms) => {
    // Asumimos que la plantilla carga en el primer prototipo o crea uno
    const updatedProtos = activeQuote.prototypes.length > 0
      ? [{ ...activeQuote.prototypes[0], budget: [...activeQuote.prototypes[0].budget, ...budget] }]
      : [{ id: generateId(), name: 'MODELO PLANTILLA', quantity: 1, budget }];

    updateQuote({ prototypes: updatedProtos, terms });
  };

  // Lógica para revertir versión
  const handleRevertVersion = (version: QuoteVersion) => {
    if (confirm('¿Estás seguro de revertir a esta versión? Se perderán los cambios actuales no guardados.')) {
      updateQuote({ ...version.data });
      setIsHistoryOpen(false);
    }
  };

  // Navegación secuencial
  const handlePrevStep = () => {
    const idx = stepsOrder.indexOf(currentStep);
    if (idx > 0) setCurrentStep(stepsOrder[idx - 1]);
  };

  const handleNextStep = () => {
    const idx = stepsOrder.indexOf(currentStep);
    if (idx < stepsOrder.length - 1) setCurrentStep(stepsOrder[idx + 1]);
  };

  if (view === 'login') return <Login onLoginSuccess={handleLogin} branding={branding} />;

  if (view === 'dashboard') {
    return (
      <>
        <Dashboard
          isOnline={true}
          quotes={quotes}
          branding={branding}
          currentUser={currentUser!}
          users={users}
          categories={categories}
          onLogout={handleLogout}
          onCreateNew={handleCreateNew}
          onEdit={handleEditQuote}
          onDuplicate={(q) => handleEditQuote({ ...q, id: generateId(), project: { ...q.project, quoteNumber: q.project.quoteNumber + '-COPY' } })}
          onDelete={async (id) => {
            if (confirm('¿Seguro que deseas eliminar esta cotización?')) {
              const filtered = quotes.filter(q => q.id !== id);
              setQuotes(filtered);
              await storage.deleteQuote(id);
            }
          }}
          onUpdateStatus={(id, status) => {
            const updated = quotes.map(q => q.id === id ? { ...q, status } : q);
            setQuotes(updated);
            storage.saveQuotes(updated);
          }}
          onOpenBranding={() => setIsBrandingOpen(true)}
          onOpenDatabase={() => setIsDatabaseOpen(true)}
          onOpenCategories={() => setIsCategoriesOpen(true)}
          onOpenClients={() => setIsClientsOpen(true)}
          onOpenUsers={() => setIsUsersOpen(true)}
          onOpenChangePassword={() => setIsPasswordOpen(true)}
          onOpenServerSettings={() => setIsServerOpen(true)}
          onOpenPDFSettings={() => setIsPDFSettingsOpen(true)}
          installPromptEvent={null}
          onInstallPWA={() => { }}
          onViewHistory={(quote) => {
            setActiveQuote(quote);
            setIsHistoryOpen(true);
          }}
        />

        {/* Modales Administrativos */}
        {isClientsOpen && <ClientManager clients={clients} onClose={() => setIsClientsOpen(false)} onUpdateClients={(c) => { setClients(c); storage.saveClients(c); }} onDeleteClient={(id) => { const filtered = clients.filter(c => c.id !== id); setClients(filtered); storage.saveClients(filtered); }} />}
        {isUsersOpen && <UserManager users={users} currentUser={currentUser!} onClose={() => setIsUsersOpen(false)} onUpdateUsers={(u) => { setUsers(u); storage.saveUsers(u); }} />}
        {isCategoriesOpen && <CategoryManager categories={categories} onClose={() => setIsCategoriesOpen(false)} onUpdateCategories={(c) => { setCategories(c); storage.saveCategories(c); }} />}

        {/* NUEVA ACTUALIZACIÓN: DatabaseManager optimizado con métodos granulares */}
        {isDatabaseOpen && (
          <DatabaseManager
            catalog={catalog}
            onClose={() => setIsDatabaseOpen(false)}
            onUpdateCatalog={(c) => { setCatalog(c); storage.saveCatalog(c); }}
            onSaveItem={(item) => {
              const exists = catalog.some(i => i.codigo === item.codigo);
              const newCatalog = exists
                ? catalog.map(i => i.codigo === item.codigo ? item : i)
                : [...catalog, item];
              setCatalog(newCatalog);
              // Actualizar almacenamiento local para consistencia inmediata
              localStorage.setItem('hybrid_inventory', JSON.stringify(newCatalog));
              // Guardar ítem individual en servidor
              storage.saveCatalogItem(item);
            }}
            onDeleteItem={(item) => {
              const newCatalog = catalog.filter(i => i.codigo !== item.codigo);
              setCatalog(newCatalog);
              localStorage.setItem('hybrid_inventory', JSON.stringify(newCatalog));
              storage.deleteCatalogItem(item.codigo);
            }}
          />
        )}

        {isBrandingOpen && <BrandingModal isOpen={isBrandingOpen} onClose={() => setIsBrandingOpen(false)} branding={branding} onSave={(b) => { setBranding(b); storage.saveBranding(b); }} />}
        {isServerOpen && <ServerSettingsModal isOpen={isServerOpen} onClose={() => setIsServerOpen(false)} onSaved={() => { }} />}
        {isPDFSettingsOpen && <PDFSettingsModal isOpen={isPDFSettingsOpen} onClose={() => setIsPDFSettingsOpen(false)} branding={branding} onSave={(s) => { const newB = { ...branding, pdfSettings: s }; setBranding(newB); storage.saveBranding(newB); }} />}
        {isPasswordOpen && <ChangePasswordModal isOpen={isPasswordOpen} currentUser={currentUser!} onClose={() => setIsPasswordOpen(false)} onUpdatePassword={async (p) => { const updatedUsers = users.map(u => u.id === currentUser!.id ? { ...u, password: p } : u); setUsers(updatedUsers); await storage.saveUsers(updatedUsers); }} />}

        {/* Modal de Historial en Dashboard */}
        {isHistoryOpen && (
          <VersionHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            versions={activeQuote.versions || []}
            onRevert={(version) => {
              if (confirm('¿Estás seguro de revertir a esta versión? Se abrirá en el editor para revisión.')) {
                updateQuote({ ...version.data });
                setIsHistoryOpen(false);
                setView('editor');
                setCurrentStep('general');
              }
            }}
            onDelete={async (id) => {
              if (confirm('¿Seguro que deseas eliminar esta versión del historial?')) {
                const updatedVersions = activeQuote.versions?.filter(v => v.id !== id) || [];
                const updatedQuote = { ...activeQuote, versions: updatedVersions };

                // Actualizar estado local
                setActiveQuote(updatedQuote);

                // Actualizar lista global de quotes y almacenamiento
                const updatedQuotesList = quotes.map(q => q.id === activeQuote.id ? updatedQuote : q);
                setQuotes(updatedQuotesList);
                await storage.saveQuotes(updatedQuotesList);
              }
            }}
          />
        )}      </>
    );
  }

  const isFirstStep = currentStep === stepsOrder[0];
  const isLastStep = currentStep === stepsOrder[stepsOrder.length - 1];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">

        {/* BOTÓN REGRESO AL DASHBOARD */}
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 group transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-white transition-all shadow-sm">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-dark transition-colors">Volver al</span>
            <span className="text-[10px] font-black uppercase tracking-tighter text-brand-dark">Dashboard</span>
          </div>
        </button>

        {/* NAVEGADOR CENTRAL CON FLECHAS */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handlePrevStep}
            disabled={isFirstStep}
            className={`p-2 rounded-full border transition-all ${isFirstStep ? 'opacity-30 border-transparent cursor-not-allowed' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
          >
            <ChevronLeft size={20} />
          </button>

          <StepNavigator currentStep={currentStep} setStep={setCurrentStep} />

          <button
            onClick={handleNextStep}
            disabled={isLastStep}
            className={`p-2 rounded-full border transition-all ${isLastStep ? 'opacity-30 border-transparent cursor-not-allowed' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* ACCIONES FINALES RESTAURADAS: PLANTILLAS -> HISTORIAL -> GUARDAR -> PREVIEW */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-orange/10 hover:text-brand-orange transition-all"
            title="Plantillas"
          >
            <FileText size={18} />
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-orange/10 hover:text-brand-orange transition-all relative"
            title="Historial de Versiones"
          >
            <History size={18} />
            {activeQuote.versions && activeQuote.versions.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full"></span>}
          </button>

          <button
            onClick={handleSaveQuote}
            disabled={isSaved || isSaving}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all shadow-lg ${isSaved ? 'bg-emerald-500 scale-110' : (isSaving ? 'bg-gray-400 cursor-wait' : 'bg-brand-dark hover:bg-black')}`}
            title="Guardar Proyecto"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isSaved ? <Check size={20} /> : <Save size={18} />)}
          </button>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-brand-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all whitespace-nowrap"
          >
            <Eye size={16} /> <span className="hidden sm:inline">Vista Previa</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 scrollbar-hide">
        <div className="max-w-7xl mx-auto">
          {currentStep === 'general' && <Step1General data={activeQuote} updateData={updateQuote} clients={clients} categories={categories} currentUser={currentUser!} onSaveClient={(c) => { const newClients = [...clients, c]; setClients(newClients); storage.saveClients(newClients); }} />}
          {currentStep === 'gallery' && <Step2Gallery data={activeQuote} updateData={updateQuote} />}
          {currentStep === 'budget' && <Step3Budget data={activeQuote} updateData={updateQuote} onOpenPicker={openPicker} currentUser={currentUser!} />}
          {currentStep === 'terms' && <Step4Terms data={activeQuote} updateData={updateQuote} />}
        </div>
      </main>

      <CatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} onSelectItem={handleSelectItem} catalog={catalog} />
      {isPreviewOpen && <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} data={activeQuote} updateData={updateQuote} branding={branding} onDownload={() => { }} isGenerating={false} />}

      {/* Modales Restaurados */}
      {isTemplateOpen && <TemplateModal isOpen={isTemplateOpen} onClose={() => setIsTemplateOpen(false)} currentData={activeQuote} onLoadTemplate={handleLoadTemplate} />}
      {isHistoryOpen && <VersionHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} versions={activeQuote.versions || []} onRevert={handleRevertVersion} onDelete={(id) => updateQuote({ versions: activeQuote.versions?.filter(v => v.id !== id) })} />}
      <Toaster richColors position="bottom-right" duration={2000} toastOptions={{ style: { maxWidth: '300px', fontSize: '14px' } }} />
    </div>
  );
};

export default App;
