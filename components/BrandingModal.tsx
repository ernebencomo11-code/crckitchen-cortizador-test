
import React, { useState } from 'react';
import { Branding } from '../types';
import { X, Upload, Palette, Building2, Globe, Mail, Phone, MapPin, Save, Trash2, Wand2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branding: Branding;
  onSave: (newBranding: Branding) => void;
}

export const BrandingModal: React.FC<Props> = ({ isOpen, onClose, branding, onSave }) => {
  const [localBranding, setLocalBranding] = useState<Branding>(branding);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalBranding(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 2MB para evitar saturar localStorage)
      if (file.size > 2 * 1024 * 1024) {
        toast.warning("El logo es demasiado pesado. Por favor usa una imagen menor a 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalBranding(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalBranding(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localBranding);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-orange rounded-2xl text-white">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Configuración de Marca</h2>
              <p className="text-sm text-gray-500 font-medium">Personaliza el aspecto y datos de tu empresa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Logotipo de Empresa</label>
                {localBranding.logo && (
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                )}
              </div>
              <div className="relative group aspect-video bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-brand-orange">
                {localBranding.logo ? (
                  <img src={localBranding.logo} alt="Preview" className="max-h-full max-w-full p-6 object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <Upload size={40} />
                    <span className="text-[10px] font-bold uppercase">Subir Archivo</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs uppercase z-10 pointer-events-none">
                  {localBranding.logo ? 'Cambiar Logotipo' : 'Seleccionar Imagen'}
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-6">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Paleta de Colores</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Color Primario</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="primaryColor"
                      value={localBranding.primaryColor}
                      onChange={handleChange}
                      className="w-12 h-12 border-none cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-sm font-bold uppercase">{localBranding.primaryColor}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Color Secundario</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={localBranding.secondaryColor}
                      onChange={handleChange}
                      className="w-12 h-12 border-none cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-sm font-bold uppercase">{localBranding.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Información de Contacto y Legal</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="companyName" value={localBranding.companyName} onChange={handleChange} placeholder="Nombre Comercial" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange transition-all" />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">RS</div>
                <input type="text" name="legalName" value={localBranding.legalName} onChange={handleChange} placeholder="Razón Social" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange transition-all" />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="website" value={localBranding.website} onChange={handleChange} placeholder="Sitio Web" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange transition-all" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" name="email" value={localBranding.email} onChange={handleChange} placeholder="Email de Contacto" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange transition-all" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="phone" value={localBranding.phone} onChange={handleChange} placeholder="Teléfono" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange transition-all" />
              </div>
              <div className="relative md:col-span-2">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="address" value={localBranding.address} onChange={handleChange} placeholder="Dirección Física Completa" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Wand2 size={16} className="text-brand-orange" />
              <label className="text-sm font-black uppercase tracking-widest text-brand-dark">Asistente de IA</label>
            </div>
            <p className="text-xs text-gray-400 -mt-2">
              Introduce tu clave de API de Google Gemini para activar la generación de texto automática en el paso de "Condiciones".
            </p>
            <div className="relative group">
              <input
                type={showApiKey ? 'text' : 'password'}
                name="geminiApiKey"
                value={localBranding.geminiApiKey || ''}
                onChange={handleChange}
                placeholder="Clave API de Google Gemini"
                className="w-full px-5 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark"
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-8 py-3 text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition-all">Cancelar</button>
            <button type="submit" className="flex items-center gap-2 px-10 py-3 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-brand-orange/20 transition-all">
              <Save size={18} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};