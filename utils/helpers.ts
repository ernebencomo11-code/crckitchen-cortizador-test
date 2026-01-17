
export const formatCurrency = (amount: number, currency: string = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const parseExcelClipboard = (text: string): any[] => {
  if (!text || !text.trim()) return [];
  
  // Dividir por filas (soportando diferentes saltos de línea)
  const rows = text.trim().split(/\r?\n/);
  
  return rows.map(row => {
    // Dividir por tabuladores (estándar de Excel al copiar)
    const columns = row.split('\t');
    
    // Mapeo basado en el orden solicitado: Concepto | Descripción | Unidad | Cantidad | Precio
    const concept = columns[0]?.trim() || '';
    const description = columns[1]?.trim() || '';
    const unit = columns[2]?.trim() || 'pza';
    
    // Limpiar números de símbolos de moneda, comas y espacios
    const cleanNumber = (val: string) => {
      if (!val) return 0;
      return parseFloat(val.replace(/[^-0-9.]/g, "")) || 0;
    };

    const quantity = cleanNumber(columns[3]) || 1;
    const unitPrice = cleanNumber(columns[4]) || 0;

    return {
      concept,
      description,
      unit,
      quantity,
      unitPrice
    };
  }).filter(item => item.concept !== ''); // Evitar filas vacías
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const isValidImageUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.trim();
  return cleanUrl.startsWith('http') || cleanUrl.startsWith('data:image') || cleanUrl.startsWith('blob:');
};

/**
 * Calcula un puntaje de coincidencia difusa entre una cadena y una consulta.
 * Útil para búsquedas que toleran errores tipográficos leves.
 */
export const getFuzzyScore = (text: string, query: string): number => {
  const target = text.toLowerCase();
  const search = query.toLowerCase();

  if (target === search) return 100;
  if (target.startsWith(search)) return 80;
  if (target.includes(search)) return 60;

  // Algoritmo simple de coincidencia de caracteres en orden
  let score = 0;
  let textIdx = 0;
  for (let i = 0; i < search.length; i++) {
    const char = search[i];
    const foundIdx = target.indexOf(char, textIdx);
    if (foundIdx !== -1) {
      score++;
      textIdx = foundIdx + 1;
    }
  }

  // Si no coincide ni la mitad de los caracteres en orden, el puntaje es muy bajo
  if (score < search.length / 2) return 0;

  return (score / search.length) * 40;
};
