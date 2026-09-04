# ⚡ ComandaFlow — Sistema de Gestión Gastronómica, Carta Digital QR & Comandas en Tiempo Real

<div align="center">

![ComandaFlow Banner](https://img.shields.io/badge/ComandaFlow-SaaS%20Gastronómico-6366f1?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React%2019-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Multi-Tenant](https://img.shields.io/badge/Architecture-Multi--Tenant%20Isolated-7c3aed?style=for-the-badge)
![Netlify](https://img.shields.io/badge/Netlify-Ready%20AutoDeploy-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

**"Automatizá los pedidos y comandas de tu restaurante en tiempo real, sin comisiones abusivas."**
*Software SaaS integral para Restaurantes, Pizzerías, Bares, Cafeterías y Cervecerías.*

</div>

---

## 🍽️ ¿Qué es ComandaFlow?

**ComandaFlow** es una plataforma web integral diseñada para optimizar toda la operativa de un local gastronómico:
1. **Para los Clientes:** Carta digital interactiva mediante código QR en la mesa o web delivery/takeaway, con cálculo de envío y envío a cocina/WhatsApp.
2. **Para la Cocina y Mozo:** Pantalla Kanban de comandas en vivo con cambio de estados instantáneos y alertas sonoras/visuales.
3. **Para la Administración:** Control de mesas de salón, arqueo de caja en vivo (Salón vs Venta Directa), reapertura de cajas y comprobantes de cierre diario con firma contable.
4. **Para los Dueños de la Plataforma (SuperAdmin):** Monitoreo global de suscripciones, estados de restaurantes registrados y diagnóstico de base de datos en la nube.

---

## ✨ Funcionalidades Principales

### 1. 📱 Carta Digital QR & Pedidos Online
- **Carta Digital Interactiva:** Categorías, fotos, descripciones de platos, opciones personalizadas (tamaños, adicionales) y selector de cantidades.
- **Canales de Entrega:**
  - 🍽️ **En Mesa (Salón):** Pedido directo vinculando el número de mesa para atención del salón.
  - 🛵 **Envío a Domicilio:** Formulario de dirección con cálculo de costo de envío y monto de envío gratis.
  - 🏪 **Retiro por Mostrador:** Takeaway programado con aviso al cliente.
- **Notificaciones Automáticas por WhatsApp:** Despacho directo del comprobante y estado del pedido al WhatsApp del local y cliente.

### 2. 📋 Panel de Cocina Kanban en Tiempo Real
- **Flujo Operativo Claro:** Columnas organizadas (*Pendiente* ➔ *Confirmado* ➔ *En Preparación* ➔ *Listo para Entregar* ➔ *En Camino* ➔ *Entregado*).
- **Control de Tiempos:** Cronómetro en vivo de espera por comanda con cambio de color según demora.
- **Sincronización WebSockets (Supabase):** Los pedidos ingresados desde el celular del cliente o mozo aparecen en la pantalla de cocina al instante sin recargar la página.

### 3. 🍽️ Salón y Gestión de Mesas
- **Mapa Visual de Mesas:** Monitoreo del estado de cada mesa (*Libre*, *Ocupada*, *Pidiendo Cuenta*).
- **Cierre y Cobro de Mesas:** Consolidación de items consumidos, emisión de ticket y liberación inmediata de la mesa.

### 4. 📊 Caja, Finanzas y Cierres de Jornada
- **Arqueo en Tiempo Real:** Segmentación de ingresos entre **Salón (Mesas)** y **Venta Directa (Mostrador/Delivery)**.
- **Reapertura de Caja Parcial:** Posibilidad de reabrir canales de caja si surgen pedidos pendientes o cobros tardíos.
- **Cierre de Jornada Oficial:** Archivo histórico con desglose contable, auditoría de transacciones y generación de comprobante imprimible con firma del encargado.

### 5. 🔒 Seguridad, Multi-Tenant & Aislamiento Estricto
- **Aislamiento de Cuentas:** Cada comercio (`merchant`) ingresa con su propio usuario/email y contraseña, accediendo **únicamente a sus datos, menús y comandas**.
- **Ocultamiento de Competencia:** Los restaurantes no pueden ver la lista de otros comercios ni alternar entre ellos.
- **Recuperación de Contraseña por Email:** Envío de código de seguridad de 6 dígitos al correo de contacto registrado con actualización persistente en base de datos.
- **Panel SuperAdmin Maestro:** Vista privilegiada (`/#/superadmin`) para auditar comercios, activar suscripciones y ejecutar diagnósticos de base de datos.

### 6. ☁️ Base de Datos Híbrida (Supabase PostgreSQL + Offline Local Storage)
- **Supabase Cloud:** Base de datos PostgreSQL serverless con soporte de WebSockets Realtime para múltiples pantallas y dispositivos en simultáneo.
- **Modo Offline Fallback:** La aplicación continúa operando localmente mediante Web Storage en caso de intermitencia de red.

---

## 🏗️ Estructura del Proyecto

```text
comandas-app/
├── docs/                        # Build compilado listo para Netlify / GitHub Pages
│   ├── index.html
│   ├── _redirects               # Reglas de SPA Routing
│   └── assets/
├── src/
│   ├── assets/                  # Logos, imágenes y recursos gráficos
│   ├── context/
│   │   └── DbContext.jsx        # Estado global, multi-tenant, autenticación y finanzas
│   ├── pages/
│   │   ├── LandingPage.jsx      # Portal comercial público y registro de locales
│   │   ├── ClientMenu.jsx       # Carta digital QR interactiva para comensales
│   │   ├── AdminDashboard.jsx   # Panel de cocina Kanban, mesas, caja y configuración
│   │   └── SuperAdmin.jsx       # Panel maestro SaaS y diagnóstico de Supabase
│   ├── services/
│   │   └── supabaseClient.js    # Cliente Supabase, helpers de sync y health check
│   ├── App.jsx                  # Enrutador principal (HashRouter)
│   ├── index.css                # Sistema de diseño, temas y responsividad
│   └── main.jsx                 # Punto de entrada de React 19
├── .env.example                 # Plantilla de variables de entorno
├── netlify.toml                 # Configuración de despliegue automático en Netlify
├── supabase_schema.sql          # Script SQL para creación de tablas en Supabase
├── package.json
└── vite.config.js
```

---

## 🚀 Puesta en Marcha Local

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/juanperalta1515/comandas-app.git
cd comandas-app
npm install
```

### 2. Configuración Opcional de Supabase (Cloud)
Copia el archivo de ejemplo:
```bash
cp .env.example .env
```
Completa con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

*(Nota: Si no se configuran las variables, el sistema funcionará automáticamente en modo de almacenamiento local persistente).*

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 4. Compilar para Producción
```bash
npm run build
```
Generará el bundle optimizado en la carpeta `docs/`.

---

## ☁️ Despliegue en Netlify

1. Vincula este repositorio de GitHub en tu cuenta de **Netlify**.
2. Configuración de Build:
   - **Base directory:** *(dejar en blanco o `./`)*
   - **Build command:** `npm run build`
   - **Publish directory:** `docs`
3. Agrega las Variables de Entorno en Netlify (*Site configuration -> Environment variables*):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Netlify desplegará automáticamente el sitio con soporte de rutas SPA (`_redirects`).

---

## 🔑 Credenciales Demostrativas

| Rol / Comercio | Email | Contraseña | Vistas y Permisos |
| :--- | :--- | :--- | :--- |
| 👑 **SuperAdmin Master** | `admin@comandaflow.com` | `admin123` | Control total SaaS, gestión de clientes y diagnóstico Cloud. |
| 🍔 **El Quincho Porteño** | `contacto@quincho.com` | `quincho123` | Panel exclusivo de El Quincho (Kanban, Mesas, Menú, Caja). |
| 🍕 **Pizzería Napoli** | `contacto@napoli.com` | `napoli123` | Panel exclusivo de Pizzería Napoli. |
| 🍣 **Sushi Zen Nikkei** | `contacto@sushizen.com` | `sushi123` | Panel exclusivo de Sushi Zen. |

---

## 📄 Licencia

Desarrollado como solución propietaria para **ComandaFlow SaaS**. Todos los derechos reservados.
