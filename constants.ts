
import { QuoteData, Branding, ProjectCategory, AppUser, PreviewSettings, Category, CatalogItem } from './types';

export const OFFICIAL_LOGO_DEFAULT = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfI37z_0M9f6r5X0j-eX70Vv2rG4v6G4v6G4v6G4v6&s`;

export const DEFAULT_PDF_SETTINGS: PreviewSettings = {
  theme: 'modern',
  baseFontSize: 12,
  accentColor: '#FF6B35',
  secondaryColor: '#2D3748',
  backgroundColor: '#FFFFFF',
  gradientBackground: false,
  titleFont: 'Inter',
  borderRadius: 16,
  borderWidth: 1,
  headerOpacity: 1,
  showGallery: true,
  showBudget: true,
  showTerms: true,
  showDescriptions: true,
  showCover: true
};

export const DEFAULT_BRANDING: Branding = {
  logo: OFFICIAL_LOGO_DEFAULT,
  primaryColor: '#FF6B35',
  secondaryColor: '#2D3748',
  companyName: 'CR Kitchen & Design',
  legalName: 'CR Kitchen & Design S.A. de C.V.',
  website: 'crkitchencancun.com',
  email: 'ventas@crkitchencancun.com',
  phone: '(998) 882.0840',
  address: 'Cancún, Quintana Roo, México',
  pdfSettings: DEFAULT_PDF_SETTINGS,
  geminiApiKey: ''
};

export const MOCK_USERS: AppUser[] = [
  { id: 'u1', name: 'Administrador CR', username: 'admin', role: 'ADMINISTRADOR', password: 'admin' },
  { id: 'u2', name: 'Diseñador 1', username: 'diseno1', role: 'DISEÑADOR', password: '123' },
  { id: 'u3', name: 'Ventas Cancun', username: 'ventas1', role: 'VENDEDOR', password: '123' }
];

export const BUDGET_SECTIONS = {
  MOBILIARIO: 'MOBILIARIO Y HERRAJES',
  ENCIMERAS: 'ENCIMERAS',
  ACCESORIOS: 'ACCESORIOS'
} as const;

export const CATEGORIES_LIST = [BUDGET_SECTIONS.MOBILIARIO, BUDGET_SECTIONS.ENCIMERAS, BUDGET_SECTIONS.ACCESORIOS];

// Categorías iniciales de proyecto
export const INITIAL_PROJECT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'COCINAS', icon: 'Utensils', isActive: true },
  { id: 'c2', name: 'BAÑOS', icon: 'Bath', isActive: true },
  { id: 'c3', name: 'CLOSETS', icon: 'DoorOpen', isActive: true },
  { id: 'c4', name: 'CLOSETS Y BAÑOS', icon: 'Layers', isActive: true }
];

export const DEFAULT_QUOTE: QuoteData = {
  id: '',
  status: 'BORRADOR',
  category: 'COCINAS',
  projectType: 'PARTICULAR',
  prototypeQuantity: 1,
  // NUEVA ACTUALIZACIÓN: Siempre iniciamos con al menos un modelo base
  prototypes: [{
    id: 'p-base',
    name: 'MODELO BASE',
    quantity: 1,
    budget: []
  }], 
  lastModified: new Date().toISOString(),
  client: { name: '', email: '', phone: '', address: '' },
  project: { 
    name: '', 
    address: '', 
    date: new Date().toISOString().split('T')[0], 
    quoteNumber: ''
  },
  gallery: [],
  budget: [],
  terms: {
    text: 'Agradecemos la oportunidad de presentarle nuestra propuesta técnica y económica para la realización de su proyecto.',
    warranty: '1 año en mano de obra y herrajes.',
    deliveryTime: '35 a 45 días hábiles.',
    paymentCount: 3,
    advancePercent: 70,
    midPaymentPercent: 25,
    finalPaymentPercent: 5,
  },
  currency: 'MXN',
  ivaRate: 0.16,
  showIva: false,
  discountValue: 0,
  showDiscount: false,
  notes: [], 
  versions: [],
};

export const UNITS = ['pza', 'm²', 'ml', 'juego', 'LOTE'];
export const IMAGE_CATEGORIES = ['Render', 'Plano', 'Alzado', 'Referencia'];

// ACTUALIZACIÓN: Catálogo exacto solicitado por el usuario CON IMÁGENES
export const INITIAL_CATALOG: CatalogItem[] = [
  {
    codigo: "COPAL",
    descripcion: "AGLOMERADO MELAMINICO HIDROFUGO COPAL ARAUCO 16 MM",
    unidad: "pza",
    precio: 0,
    categoria: "MOBILIARIO Y HERRAJES",
    marca: "ARAUCO",
    image: "https://arauco.com/mexico/wp-content/uploads/sites/16/2018/06/Copal_Chic.jpg"
  },
  {
    codigo: "GRANITO GRIS OXFORD",
    descripcion: "GRANITO GRIS OXFORD",
    unidad: "ml",
    precio: 0,
    categoria: "ENCIMERAS",
    marca: "GENÉRICO",
    image: "https://st.hzcdn.com/simgs/2451f28b0662d98d_4-4279/home-design.jpg"
  },
  {
    codigo: "BOTE DOBLE",
    descripcion: "BOTE BASURERO EXTRAÍBLE EURO CARGO-ST PARA GABINETE DE 450 MM, CAP TOTAL 76 L/ 2 BOTES DE 38 L",
    unidad: "pza",
    precio: 0,
    categoria: "ACCESORIOS",
    marca: "HAFELE",
    image: "https://m.media-amazon.com/images/I/51wXk-Q+yvL.jpg"
  }
];
