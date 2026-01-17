
import React, { useState, useMemo, useRef } from 'react';
import { CatalogItem } from '../types';
import { Search, Plus, Trash2, Edit3, Save, X, ClipboardPaste, Database, Package, AlertCircle, Upload, ImageOff, ChevronDown, ArrowLeft, Hammer, Layers, AlertTriangle, ShieldAlert, Download, FileSpreadsheet, FileUp, ImageIcon } from 'lucide-react';
import { BUDGET_SECTIONS } from '../constants';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface Props {
  catalog: CatalogItem[];
  onUpdateCatalog: (newCatalog: CatalogItem[]) => void;
  onClose: () => void;
  // NUEVA ACTUALIZACIÓN: Props opcionales para gestión granular
  onSaveItem?: (item: CatalogItem) => void;
  onDeleteItem?: (item: CatalogItem) => void;
}

export const DatabaseManager: React.FC<Props> = ({ catalog, onUpdateCatalog, onClose, onSaveItem, onDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState<CatalogItem>({
    codigo: '',
    descripcion: '',
    unidad: 'pza',
    precio: 0,
    categoria: BUDGET_SECTIONS.MOBILIARIO,
    image: ''
  });

  const filteredCatalog = useMemo(() => {
    const lower = searchTerm.toLowerCase().trim();
    if (!lower) return catalog;
    return catalog.filter(i =>
      i.codigo.toLowerCase().includes(lower) ||
      i.descripcion.toLowerCase().includes(lower) ||
      (i.categoria && i.categoria.toLowerCase().includes(lower))
    );
  }, [catalog, searchTerm]);

  const handleExportExcel = () => {
    try {
      if (!catalog || catalog.length === 0) {
        toast.error("El catálogo está vacío.");
        return;
      }

      const dataToExport = catalog.map(item => ({
        'CÓDIGO': item.codigo,
        'DESCRIPCIÓN': item.descripcion,
        'MARCA': item.marca || 'CR KITCHEN',
        'PRECIO VENTA': item.precio,
        'CATEGORÍA': item.categoria || BUDGET_SECTIONS.MOBILIARIO,
        'UNIDAD': item.unidad,
        'IMAGEN': item.image ? (item.image.startsWith('http') ? item.image : 'CON IMAGEN (BASE64)') : 'SIN IMAGEN'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
      XLSX.writeFile(workbook, `catalogo_cr_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      toast.error("Error al exportar el catálogo.");
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'CÓDIGO': 'MOD-001',
        'DESCRIPCIÓN': 'GABINETE ALTO 60CM BLANCO',
        'MARCA': 'CR KITCHEN',
        'PRECIO VENTA': 2850.00,
        'CATEGORÍA': BUDGET_SECTIONS.MOBILIARIO,
        'UNIDAD': 'pza',
        'IMAGEN (URL / BASE64)': 'https://crkitchen.com/foto.jpg'
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla_importacion_cr.xlsx");
  };

  const processImportedData = (importedItems: CatalogItem[]) => {
    if (importedItems.length > 0) {
      const currentCodes = new Set(importedItems.map(p => p.codigo));
      const filteredOld = catalog.filter(c => !currentCodes.has(c.codigo));
      onUpdateCatalog([...filteredOld, ...importedItems]);
      toast.success(`Sincronizados ${importedItems.length} productos correctamente.`);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newItems: CatalogItem[] = json.map(row => {
          const normalizedRow = Object.keys(row).reduce((acc, key) => {
            acc[key.toLowerCase().trim()] = row[key];
            return acc;
          }, {} as Record<string, any>);

          const precioNum = parseFloat(String(normalizedRow['precio venta'] || normalizedRow['precio'] || '0').replace(/[^0-9.-]+/g, "")) || 0;
          let imageVal = String(normalizedRow['imagen (url / base64)'] || normalizedRow['imagen'] || '').trim();

          return {
            codigo: String(normalizedRow['código'] || normalizedRow['codigo'] || `ID-${Date.now()}`).trim(),
            descripcion: String(normalizedRow['descripción'] || normalizedRow['descripcion'] || 'SIN DESCRIPCIÓN').trim(),
            marca: String(normalizedRow['marca'] || '').trim(),
            precio: precioNum,
            categoria: (String(normalizedRow['categoría'] || normalizedRow['categoria'] || BUDGET_SECTIONS.MOBILIARIO).trim() as any),
            unidad: String(normalizedRow['unidad'] || 'pza').trim(),
            image: imageVal
          };
        }).filter(item => item.codigo && item.descripcion);

        processImportedData(newItems);
      } catch (error) {
        toast.error("Error al procesar el Excel.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.warning("La imagen es muy pesada (máx 1MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEditing && editingItem) setEditingItem({ ...editingItem, image: base64 });
        else setNewItem({ ...newItem, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    // NUEVA ACTUALIZACIÓN: Usar onSaveItem si está disponible (optimización granular)
    if (onSaveItem) {
      onSaveItem(editingItem);
    } else {
      onUpdateCatalog(catalog.map(i => i.codigo === editingItem.codigo ? editingItem : i));
    }
    setEditingItem(null);
  };

  const openAddForm = (category: string) => {
    setNewItem({ codigo: '', descripcion: '', unidad: 'pza', precio: 0, categoria: category, image: '' });
    setIsAdding(true);
  };

  const handleAddNew = () => {
    if (!newItem.codigo || !newItem.descripcion) {
      toast.warning("Código y Descripción son obligatorios.");
      return;
    }
    // NUEVA ACTUALIZACIÓN: Usar onSaveItem si está disponible
    if (onSaveItem) {
      onSaveItem(newItem);
    } else {
      onUpdateCatalog([...catalog, newItem]);
    }
    setIsAdding(false);
  };

  const handleDelete = (item: CatalogItem) => {
    if (confirm(`¿Eliminar ${item.descripcion}?`)) {
      if (onDeleteItem) {
        onDeleteItem(item);
      } else {
        onUpdateCatalog(catalog.filter(i => i.codigo !== item.codigo));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls, .csv" className="hidden" />

      <header className="flex-shrink-0 bg-white p-8 border-b border-gray-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-brand-orange/10 hover:text-brand-orange text-gray-400 rounded-2xl transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-orange">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-1">Inventario Maestro</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{catalog.length} Materiales</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownloadTemplate} className="px-6 py-3 bg-white border border-gray-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-50 flex items-center gap-2">
            <FileSpreadsheet size={14} /> Plantilla
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-50 flex items-center gap-2">
            <FileUp size={14} /> Importar
          </button>
          <button onClick={handleExportExcel} className="px-6 py-3 bg-brand-dark text-white rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all shadow-lg shadow-brand-dark/20 flex items-center gap-2">
            <Download size={14} /> Exportar Excel
          </button>
        </div>
      </header>

      <div className="bg-white px-8 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => openAddForm(BUDGET_SECTIONS.MOBILIARIO)} className="px-5 py-3 bg-brand-dark text-white rounded-2xl font-black text-[9px] uppercase">+ Mobiliario</button>
            <button onClick={() => openAddForm(BUDGET_SECTIONS.ENCIMERAS)} className="px-5 py-3 bg-brand-orange text-white rounded-2xl font-black text-[9px] uppercase">+ Encimera</button>
            <button onClick={() => openAddForm(BUDGET_SECTIONS.ACCESORIOS)} className="px-5 py-3 bg-slate-500 text-white rounded-2xl font-black text-[9px] uppercase">+ Accesorio</button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input type="text" placeholder="Filtrar catálogo..." className="w-full pl-16 pr-6 py-4 bg-gray-50 rounded-[20px] outline-none border-2 border-transparent focus:border-brand-orange/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-7xl mx-auto bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Item</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Precio Venta</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCatalog.map(item => (
                <tr key={item.codigo} className="group hover:bg-brand-orange/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <Package size={18} className="text-gray-300" />}
                      </div>
                      <span className="font-mono font-black text-brand-dark text-xs">{item.codigo}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-gray-600 uppercase line-clamp-1">{item.descripcion}</p>
                    <span className="text-[8px] px-2 py-0.5 bg-gray-100 rounded text-gray-400 font-black uppercase">{item.categoria}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-brand-dark">
                    ${item.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setEditingItem(item)} className="p-2 text-gray-300 hover:text-brand-orange transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(item)} className="p-2 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REDISEÑADO */}
      {(editingItem || isAdding) && (
        <div className="fixed inset-0 z-[250] bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border border-white/20">

            {/* Sector Izquierdo: Imagen */}
            <div className="w-full md:w-72 bg-gray-50 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative group">
              <div className="text-center mb-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Imagen del Producto</h4>
                <div className="relative aspect-square w-48 bg-white rounded-[32px] shadow-inner border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-brand-orange/50">
                  {(isAdding ? newItem.image : editingItem?.image) ? (
                    <img src={isAdding ? newItem.image : editingItem?.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                      <ImageIcon size={48} strokeWidth={1.5} />
                      <span className="text-[9px] font-black uppercase">Subir Foto</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, !!editingItem)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                </div>
              </div>
              <p className="text-[8px] text-gray-400 font-bold uppercase text-center leading-relaxed">Formatos: JPG, PNG<br />Tamaño Máx: 1MB</p>
            </div>

            {/* Sector Derecho: Formulario */}
            <div className="flex-1 p-8 md:p-12 bg-white">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter leading-none mb-1">
                    {isAdding ? 'Crear Nuevo Item' : 'Editar Información'}
                  </h3>
                  <p className="text-[10px] text-brand-orange font-bold uppercase tracking-widest">
                    {isAdding ? newItem.categoria : editingItem?.categoria}
                  </p>
                </div>
                <button
                  onClick={() => { setEditingItem(null); setIsAdding(false); }}
                  className="p-2 bg-gray-50 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Campo Código */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-brand-orange">Código de Referencia</label>
                  <input
                    type="text"
                    readOnly={!isAdding}
                    placeholder="EJ: MOD-001"
                    value={isAdding ? newItem.codigo : editingItem?.codigo}
                    onChange={(e) => isAdding && setNewItem({ ...newItem, codigo: e.target.value.toUpperCase() })}
                    className={`w-full px-6 py-4 rounded-2xl border-2 transition-all font-black text-sm outline-none ${!isAdding ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-100 focus:border-brand-orange text-brand-dark shadow-sm'}`}
                  />
                </div>

                {/* Campo Descripción */}
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-brand-orange">Descripción Técnica</label>
                  <textarea
                    placeholder="Escribe el nombre y especificaciones..."
                    value={isAdding ? newItem.descripcion : editingItem?.descripcion}
                    onChange={(e) => isAdding ? setNewItem({ ...newItem, descripcion: e.target.value.toUpperCase() }) : setEditingItem({ ...editingItem!, descripcion: e.target.value.toUpperCase() })}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 bg-white focus:border-brand-orange text-brand-dark font-bold text-sm h-32 resize-none outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Campo Precio */}
                <div className="group">
                  <label className="block text-[10px] font-black text-brand-orange uppercase tracking-widest mb-2 ml-1">Precio Unitario de Venta ($)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xl">$</span>
                    <input
                      type="number"
                      value={isAdding ? newItem.precio : editingItem?.precio}
                      onChange={(e) => isAdding ? setNewItem({ ...newItem, precio: parseFloat(e.target.value) || 0 }) : setEditingItem({ ...editingItem!, precio: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-12 pr-6 py-5 rounded-2xl border-2 border-gray-100 bg-white focus:border-brand-orange text-brand-dark font-black text-2xl outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => { setEditingItem(null); setIsAdding(false); }}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                >
                  Descartar
                </button>
                <button
                  onClick={isAdding ? handleAddNew : handleSaveEdit}
                  className="flex-[2] py-5 bg-brand-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-brand-dark/20 flex items-center justify-center gap-3"
                >
                  <Save size={18} /> {isAdding ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
