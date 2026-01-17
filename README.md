# 🚀 CR Kitchen & Design - Sistema de Cotización Inteligente

Plataforma profesional de gestión comercial diseñada específicamente para la industria de cocinas, closets y baños de lujo. Este sistema permite transformar presupuestos técnicos en propuestas comerciales de alto impacto visual.

## 🌟 Características Principales

### 1. Gestión Comercial (Dashboard)
*   **Pipeline de Ventas:** Visualización de cotizaciones por estados (Borrador, Enviada, Aceptada, Rechazada).
*   **Estadísticas en Tiempo Real:** Indicadores de tasa de conversión e inversión total aceptada.
*   **Filtros Inteligentes:** Búsqueda avanzada por cliente, proyecto, categoría o fecha.
*   **Multiusuario:** Sistema de roles (Administrador, Diseñador, Vendedor) con control de acceso.

### 2. Editor de Cotizaciones Pro
*   **Flujo en 4 Pasos:** General, Galería/Diseño, Presupuesto y Condiciones.
*   **Gestión de Prototipos:** Capacidad para manejar múltiples modelos (ej. Prototipo A, B, C) dentro de una misma cotización para proyectos masivos.
*   **Motor Financiero:** Cálculo automático de IVA, descuentos globales y precios por lote en mobiliario.

### 3. Inteligencia Artificial y Diseño
*   **IA Descriptive Memory:** Generación automática de memorias descriptivas profesionales usando **Google Gemini API**.
*   **Editor de Imágenes:** Cropper integrado con ajustes de brillo, contraste y nitidez tipo PowerPoint.
*   **Planimetría:** Soporte para pegado directo desde portapapeles (AutoCAD/Renders).

### 4. PDF Pro Generator
*   **Personalización Total:** Temas visuales (Moderno, Ejecutivo, Industrial), tipografías y colores de marca.
*   **Estructura Premium:** Portada, carta de bienvenida, galería de renders a página completa y desglose de inversión tipo matriz.

## 🛠️ Especificaciones Técnicas

*   **Frontend:** React 19 + TypeScript + Tailwind CSS.
*   **Iconografía:** Lucide React.
*   **Backend:** Node.js + Express.
*   **Base de Datos:** MySQL (Optimizado para hosting Neubox).
*   **IA:** Google GenAI SDK (Gemini 3 Flash).
*   **PWA:** Instalable en dispositivos móviles con soporte offline.

## 🚀 Instalación y Configuración

### 1. Requisitos Previos
*   Node.js instalado.
*   Base de Datos MySQL activa.

### 2. Configuración del Servidor
En la raíz del proyecto, crea o edita el archivo `.env`:
```env
API_KEY=tu_clave_gemini_aqui
PORT=5000
```

### 3. Instalación
```bash
# Instalar dependencias
npm install

# Iniciar servidor backend
npm run start:server

# Iniciar aplicación frontend
npm run dev
```

## 🏗️ Estructura de Base de Datos (MySQL)

El sistema utiliza una estructura de almacenamiento JSON flexible sobre MySQL para máxima compatibilidad:

*   **Tablas requeridas:**
    *   `quotes`: Almacena el cuerpo completo de las cotizaciones y versiones.
    *   `inventory`: Maestro de productos y materiales con imágenes Base64.
    *   *   `clients`: Directorio central de clientes.
    *   `users`: Usuarios y credenciales de acceso.
    *   `settings`: Configuración de marca y API Keys.
    *   `categories`: Tipos de proyectos (Cocinas, Baños, etc).

## 📱 Funcionalidad PWA
La aplicación está optimizada para ser "Añadida a la pantalla de inicio". Esto permite:
1.  Acceso rápido sin usar el navegador.
2.  Carga instantánea de la interfaz.
3.  Uso fluido en dispositivos móviles para vendedores en campo.

---
**CR Kitchen & Design** - *Transformando espacios en experiencias de vida.*