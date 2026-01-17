
export type QuoteStatus = 'BORRADOR' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA';
export type ProjectCategory = string;
export type UserRole = 'ADMINISTRADOR' | 'DISEÑADOR' | 'VENDEDOR';
export type ProjectType = 'PARTICULAR' | 'PROYECTO';

export interface Category {
  id: string;
  name: string;
  icon: 'Utensils' | 'Bath' | 'DoorOpen' | 'Layers' | 'Home' | 'Armchair';
  isActive: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
}

export interface Client {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ClientProfile extends Client {
  id: string;
  isActive: boolean;
  createdAt: string;
  notes?: string;
}

export interface Project {
  name: string;
  address: string;
  date: string;
  quoteNumber: string;
}

export interface PreviewSettings {
  theme: 'modern' | 'classic' | 'technical' | 'minimal' | 'executive_noir' | 'industrial';
  baseFontSize: number;
  accentColor: string;
  secondaryColor: string;
  backgroundColor: string;
  gradientBackground: boolean;
  titleFont: 'Inter' | 'Playfair Display' | 'Montserrat' | 'Roboto Mono';
  borderRadius: number;
  borderWidth: number;
  headerOpacity: number;
  showGallery: boolean;
  showBudget: boolean;
  showTerms: boolean;
  showDescriptions: boolean;
  showCover: boolean;
  footerText?: string;
}

export interface Branding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  legalName: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  pdfSettings?: PreviewSettings;
  geminiApiKey?: string;
}

export interface QuoteImage {
  id: string;
  url: string;
  category: 'Render' | 'Plano' | 'Alzado' | 'Referencia';
  title: string;
  description?: string;
}

export interface LineItem {
  id: string;
  codigo?: string;
  selected: boolean;
  category: string;
  concept: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface Prototype {
  id: string;
  name: string;
  quantity: number;
  budget: LineItem[];
}

export interface CatalogItem {
  codigo: string;
  descripcion: string;
  unidad: string;
  precio: number;
  categoria?: string;
  marca?: string;
  image?: string;
}

export interface Terms {
  text: string;
  warranty: string;
  deliveryTime: string;
  paymentCount: number;
  advancePercent: number;
  midPaymentPercent: number;
  finalPaymentPercent: number;
}

export interface InternalNote {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  timestamp: string;
}

export interface QuoteData {
  id: string;
  status: QuoteStatus;
  category: ProjectCategory;
  projectType: ProjectType;
  prototypeQuantity: number;
  prototypes: Prototype[];
  lastModified: string;
  client: Client;
  project: Project;
  gallery: QuoteImage[];
  budget: LineItem[];
  terms: Terms;
  currency: 'MXN' | 'USD' | 'EUR';
  ivaRate: number;
  showIva: boolean;
  discountValue: number;
  showDiscount: boolean;
  createdBy?: AppUser;
  lastEditedBy?: AppUser;
  notes?: InternalNote[];
  auditLog?: AuditEntry[];
  versions?: QuoteVersion[];
  previewSettings?: PreviewSettings;
}

export interface QuoteVersion {
  id: string;
  timestamp: string;
  data: Omit<QuoteData, 'versions'>;
  note: string;
  total: number;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  createdAt: string;
  budget: LineItem[];
  terms: Terms;
}

export type Step = 'general' | 'gallery' | 'budget' | 'terms';
export type AppView = 'dashboard' | 'editor' | 'login' | 'portal';