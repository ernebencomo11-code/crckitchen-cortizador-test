
# 🚀 CR Kitchen & Design - Guía de Configuración de Base de Datos

Para que la aplicación pueda guardar datos, debes configurar manualmente las colecciones en tu panel de PocketBase (`http://127.0.0.1:8090/_/`).

## 1. Crear Colecciones (Tablas)
Entra al panel y crea las siguientes colecciones con estos campos exactos:

### Colección: `quotes` (Cotizaciones)
*   `quoteNumber` (Texto) - **Marcar como No vacío**
*   `status` (Texto)
*   `category` (Texto)
*   `client_data` (JSON)
*   `project_data` (JSON)
*   `budget` (JSON)
*   `terms` (JSON)
*   `gallery` (JSON)
*   `currency` (Texto)
*   `ivaRate` (Número)
*   `showIva` (Bool)
*   `discountValue` (Número)
*   `showDiscount` (Bool)

### Colección: `inventory` (Inventario)
*   `codigo` (Texto) - **Marcar como No vacío**
*   `descripcion` (Texto)
*   `unidad` (Texto)
*   `precio` (Número)
*   `categoria` (Texto)
*   `marca` (Texto)
*   `image` (Texto) - *Nota: Aquí se guardan los datos de imagen base64.*

### Colección: `clients` (Directorio de Clientes)
*   `name` (Texto)
*   `email` (Texto)
*   `phone` (Texto)
*   `address` (Texto)
*   `isActive` (Bool)
*   `notes` (Texto)

### Colección: `branding` (Configuración de Marca)
*   `companyName` (Texto)
*   `logo` (Texto)
*   `primaryColor` (Texto)
*   `secondaryColor` (Texto)
*   ... (Añadir los demás campos de contacto si deseas sincronizarlos)

### Colección: `app_users` (Usuarios del sistema)
*   `name` (Texto)
*   `role` (Texto)

## 2. Permisos (API Rules)
Por defecto, PocketBase bloquea el acceso público. Para pruebas rápidas:
1.  En cada colección, ve a la pestaña **"API Rules"**.
2.  Haz clic en el botón de **candado** para todas las reglas (`List`, `View`, `Create`, `Update`, `Delete`) y déjalas vacías (esto permite acceso público sin token).
3.  *En producción deberás configurar usuarios reales.*

## 3. ¿Cómo saber si falló algo?
Si presionas "Guardar" y no aparece en la otra PC:
1.  Presiona **F12** en tu navegador.
2.  Ve a la pestaña **Consola**.
3.  Verás mensajes rojos de "Error en Colección". Ahí te dirá si falta un campo o si el nombre está mal escrito.
