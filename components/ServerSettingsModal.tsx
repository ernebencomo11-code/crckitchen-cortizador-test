import React, { useState } from 'react';
import { X, Server, Database, Save, Globe, Info, CheckCircle2, Monitor, Terminal, Download, ExternalLink, AlertCircle, Activity } from 'lucide-react';
import { storage } from '../storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ServerSettingsModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [url, setUrl] = useState(storage.getServerUrl());
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState('');

  if (!isOpen) return null;

  const handleTest = async () => {
    setStatus('testing');
    setErrorDetail('');
    try {
      const res = await fetch(`${url}/health`, { mode: 'cors' });
      const data = await res.json();

      if (res.ok && data.status === 'ok') {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorDetail('El Bridge PHP respondió pero con un error interno.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorDetail('No se pudo contactar al Bridge PHP. Verifica que api.php y .htaccess estén en la raíz.');
    }
  };

  const handleSave = () => {
    storage.setServerUrl(url);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-brand-dark/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 animate-in zoom-in-95 flex flex-col md:flex-row max-h-[90vh]">
        
        <div className="w-full md:w-2/5 bg-gray-50 p-10 border-r border-gray-100 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-brand-orange" size={24} />
            <h3 className="text-lg font-black text-brand-dark uppercase tracking-tighter">Estado en Neubox</h3>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-brand-dark">Base de Datos MySQL</span>
               </div>
               <p className="text-[11px] text-gray-500 leading-tight">Conectado a thenetgu_crkitchen mediante PDO.</p>
            </div>

            <div className={`p-5 rounded-3xl border transition-all ${status === 'success' ? 'bg-emerald-50 border-emerald-200' : status === 'error' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
               <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'success' ? 'bg-emerald-500 text-white' : status === 'error' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Server size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-brand-dark">Bridge PHP</span>
               </div>
               <p className="text-[11px] text-gray-500 leading-tight">
                 {status === 'success' ? '¡API Activa en Neubox!' : status === 'error' ? 'Error de enlace.' : 'Pendiente de prueba.'}
               </p>
               {status === 'error' && (
                 <div className="mt-3 text-[9px] font-bold text-red-600 bg-white/50 p-2 rounded-lg border border-red-100 uppercase tracking-tighter">
                   {errorDetail}
                 </div>
               )}
            </div>

            <div className="pt-6 border-t border-gray-200 space-y-4">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instrucciones Neubox:</h4>
               <div className="flex gap-3">
                  <div className="bg-brand-orange/10 p-2 rounded-lg text-brand-orange h-fit">
                    <Monitor size={14} />
                  </div>
                  <p className="text-[10px] text-gray-600 leading-snug">
                    Sube el contenido de la carpeta <code className="bg-gray-200 px-1 rounded">dist</code> junto con <code className="bg-gray-200 px-1 rounded">api.php</code> y <code className="bg-gray-200 px-1 rounded">.htaccess</code> a tu <code className="bg-gray-200 px-1 rounded">public_html</code>.
                  </p>
               </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-10 flex flex-col justify-center bg-white">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-dark text-white rounded-2xl flex items-center justify-center shadow-xl shadow-brand-dark/20">
                <Globe size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Enlace de Servidor</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Conexión PHP nativa</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-brand-dark transition-all">
              <X size={28} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-brand-orange/5 p-8 rounded-[32px] border border-brand-orange/10">
              <label className="block text-[11px] font-black text-brand-orange uppercase tracking-widest mb-4 ml-1">URL de la API (Producción)</label>
              <div className="relative">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" size={24} />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-white border-2 border-transparent rounded-[24px] focus:border-brand-orange shadow-inner outline-none transition-all font-bold text-xl text-brand-dark"
                  placeholder="https://tudominio.com/api"
                />
              </div>
              <p className="mt-4 text-[10px] text-gray-400 font-medium leading-relaxed">
                Por defecto es <span className="font-mono font-bold text-brand-dark">/api</span> (relativo). Solo cámbialo si tu API está en otro servidor o carpeta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleTest}
                disabled={status === 'testing'}
                className={`flex items-center justify-center gap-3 py-6 rounded-[24px] font-black text-[12px] uppercase tracking-widest border-2 transition-all ${
                  status === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                  status === 'error' ? 'bg-red-50 border-red-500 text-red-600' :
                  'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {status === 'testing' ? 'Probando...' : 'Probar Conexión'}
              </button>

              <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-3 py-6 bg-brand-dark text-white rounded-[24px] font-black text-[12px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
              >
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};