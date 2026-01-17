
import React, { useState, useMemo } from 'react';
import { CatalogItem } from '../types';
import { BUDGET_SECTIONS } from '../constants';
import { X, Search, Package, ImageOff, ShoppingCart, ClipboardPaste, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: CatalogItem) => void;
  catalog: CatalogItem[];
  // Opcional: permitir actualizar el catálogo global desde aquí
  onUpdateCatalog?: (newItems: CatalogItem[]) => void;
}

interface ImportError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export const CatalogModal: React.FC<Props> = ({ isOpen, onClose, onSelectItem, catalog, onUpdateCatalog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return catalog;
    const lowerQuery = searchTerm.toLowerCase();
    return catalog.filter(item =>
      item.descripcion.toLowerCase().includes(lowerQuery) ||
      item.codigo.toLowerCase().includes(lowerQuery)
    );
  }, [catalog, searchTerm]);

  const handleQuickPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.warning("El portapapeles está vacío.");
        return;
      }

      const rows = text.trim().split(/\r?\n/);
      const errors: ImportError[] = [];
      const validItems: CatalogItem[] = [];

      rows.forEach((row, index) => {
        const cols = row.split('\t');
        const rowNum = index + 1;

        // Validación de columnas mínimas
        if (cols.length < 2) {
          errors.push({
            row: rowNum,
            column: "Estructura",
            value: row,
            message: "La fila no tiene suficientes columnas. Se requiere al menos Código y Descripción."
          });
          return;
        }

        const codigo = cols[0]?.trim();
        const descripcion = cols[1]?.trim();
        const marca = cols[2]?.trim() || '';
        const precioRaw = cols[3]?.trim() || '0';
        const categoria = cols[4]?.trim() || BUDGET_SECTIONS.MOBILIARIO;

        // Validación de Código
        if (!codigo) {
          errors.push({
            row: rowNum,
            column: "Código",
            value: "Vacío",
            message: "El código es obligatorio para identificar el producto."
          });
        }

        // Validación de Descripción
        if (!descripcion) {
          errors.push({
            row: rowNum,
            column: "Descripción",
            value: "Vacío",
            message: "La descripción es necesaria para el cliente."
          });
        }

        // Validación de Precio
        const precioLimpio = precioRaw.replace(/[^-0-9.]/g, "");
        const precio = parseFloat(precioLimpio);
        if (isNaN(precio)) {
          errors.push({
            row: rowNum,
            column: "Precio",
            value: precioRaw,
            message: "El precio no es un número válido. Elimina símbolos de moneda manuales si es necesario."
          });
        }

        // Fix: Removed non-existent 'costo' property to match CatalogItem interface
        if (codigo && descripcion && !isNaN(precio)) {
          validItems.push({
            codigo,
            descripcion,
            marca,
            precio,
            categoria,
            unidad: 'pza',
            image: ''
          });
        }
      });

      if (errors.length > 0) {
        setImportErrors(errors);
        setShowErrorSummary(true);
      } else if (validItems.length > 0) {
        if (onUpdateCatalog) {
          // Fusionar con el catálogo existente (evitando duplicados por código)
          const currentCodes = new Set(validItems.map(p => p.codigo));
          const filteredOld = catalog.filter(c => !currentCodes.has(c.codigo));
          onUpdateCatalog([...filteredOld, ...validItems]);
          toast.success(`¡Éxito! Se han importado/actualizado ${validItems.length} productos.`);
        } else {
          toast.warning("Los datos son válidos, pero el catálogo no se pudo actualizar en este contexto.");
        }
      }

    } catch (err) {
      toast.error("No se pudo acceder al portapapeles. Verifica los permisos de tu navegador.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-white/10">

        {/* Header con Buscador e Importador */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-orange/20">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Catálogo de Productos</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{catalog.length} productos disponibles</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleQuickPaste}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
              >
                <ClipboardPaste size={16} /> Pegar desde Excel
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                <X size={28} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              autoFocus
              placeholder="Buscar por código o descripción..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-orange transition-all font-medium text-lg shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cuerpo del Catálogo */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 scrollbar-hide">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
              <Package size={64} className="opacity-10 mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <div
                  key={item.codigo}
                  onClick={() => onSelectItem(item)}
                  className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-brand-orange/50 transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                    {!imgErrors[item.codigo] ? (
                      <img
                        src={item.image || `./fotos/${item.codigo}.jpg`}
                        alt={item.descripcion}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={() => setImgErrors(prev => ({ ...prev, [item.codigo]: true }))}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <ImageOff size={40} className="opacity-20" />
                        <span className="text-[40px] font-black opacity-10">{item.descripcion.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-brand-orange shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShoppingCart size={18} />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.codigo}</span>
                    <h4 className="font-bold text-brand-dark text-sm leading-snug mb-3 line-clamp-2 h-10 group-hover:text-brand-orange transition-colors uppercase">
                      {item.descripcion}
                    </h4>

                    <div className="mt-auto flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-300 uppercase leading-none mb-1 tracking-tighter">Precio Unitario</span>
                        <span className="text-xl font-black text-brand-dark">${item.precio.toLocaleString()}</span>
                      </div>
                      <span className="px-2 py-1 bg-gray-50 text-[10px] font-black text-gray-400 rounded-lg border border-gray-100 uppercase">
                        {item.unidad}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Errores de Importación */}
        {showErrorSummary && (
          <div className="fixed inset-0 z-[110] bg-brand-dark/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-red-50">
                <div className="flex items-center gap-4 text-red-600">
                  <AlertTriangle size={32} />
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Errores en Excel</h3>
                    <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Se detectaron {importErrors.length} problemas</p>
                  </div>
                </div>
                <button onClick={() => setShowErrorSummary(false)} className="p-2 hover:bg-red-100 rounded-full transition-all text-red-600">
                  <X size={24} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                  <Info className="text-amber-500 shrink-0" size={20} />
                  <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed tracking-wider">
                    El formato esperado es: <br />
                    <span className="font-black text-brand-dark">CÓDIGO [Tab] DESCRIPCIÓN [Tab] MARCA [Tab] PRECIO [Tab] CATEGORÍA</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {importErrors.map((error, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-brand-orange uppercase">Fila {error.row} • Columna {error.column}</span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[8px] font-black uppercase">Falla</span>
                      </div>
                      <p className="text-xs font-bold text-brand-dark leading-snug">{error.message}</p>
                      <div className="mt-1 text-[9px] font-mono text-gray-400 truncate">Valor detectado: "{error.value}"</div>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowErrorSummary(false)}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  Entendido, corregir Excel
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
