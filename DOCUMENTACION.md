# Documentación Funcional y Técnica - ComandaFlow / ComandasApp

Esta documentación resume los aspectos funcionales y técnicos de la plataforma **ComandaFlow**, un sistema SaaS de gestión de comandas y carta digital QR para restaurantes.

---

## 1. Documentación Funcional

ComandaFlow está diseñado como una plataforma multi-inquilino (SaaS) que permite a los restaurantes registrarse, configurar su menú digital y gestionar sus pedidos en tiempo real.

### Módulos Principales:

#### A. Landing Page (`index.html`)
* **Presentación del Servicio**: Información sobre características, planes y precios de suscripción.
* **Registro de Comercios**: Formulario de alta para nuevos restaurantes con selección de plan (Básico/Premium) e integración con métodos de pago (MercadoPago para débito automático o Transferencia Bancaria CBU).
* **Botón de Arrepentimiento (Baja)**: Enlace en el footer que permite a los clientes dar de baja su suscripción ingresando sus credenciales de administrador, enviando una confirmación por correo y suspendiendo el servicio inmediatamente.

#### B. Carta Digital del Cliente (`menu.html`)
* **Menú Autogestionado**: Los clientes del restaurante pueden escanear el código QR y ver la carta digital en tiempo real con categorías (Entradas, Principales, Postres, Bebidas) y disponibilidad de stock.
* **Carrito de Compras Deslizable**:
  * Selección del método de entrega: Retiro en local, Envío a domicilio (con cálculo dinámico de costo y barra de progreso de envío gratis) o Consumo en Mesa.
  * Resumen de costos.
  * Formulario de checkout interactivo para ingresar datos del cliente (nombre, teléfono, mesa/dirección) y simulación de pago con tarjeta.

#### C. Panel de Administración del Comercio (`admin.html`)
* **Tablero Kanban de Comandas**: Visualización en tiempo real de los pedidos distribuidos por estados (`Pendiente`, `Confirmado`, `En Preparación`, `Listo para Entregar`, `En Camino`, `Entregado`).
* **Control de Salón y Mesas**: Monitoreo de ocupación (mesas libres, ocupadas, pidiendo la cuenta). Permite a los meseros simular la apertura de mesas, agregar consumos adicionales y mandar pedidos directos a cocina.
* **Módulo de Cobranza**: Tabla con estados de cobro y registro de transacciones asociadas a métodos de pago (efectivo, débito, crédito).
* **Gestión de Menú (CRUD)**: Panel para agregar, editar y eliminar platos del menú de manera dinámica.
* **Caja y Finanzas**: Control de turnos de caja chica (apertura, cierre y arqueo con gráficos de ingresos/egresos por canal y método de pago).
* **Simuladores**: Integración simulada de notificaciones por WhatsApp Cloud API y pedidos de plataformas externas (Rappi, PedidosYa).

#### D. Panel de SuperAdministrador (`superadmin.html`)
* **Monitoreo Global**: Vista consolidada de locales registrados, cálculo del MRR (Ingreso Mensual Recurrente) y tasa de actividad.
* **Gestión de Suscripciones**: Aprobación de clearing de transferencias CBU, reactivación de débitos y suspensiones manuales.
* **Simulaciones de Base de Datos**: Pruebas de rendimiento de índices (Index Scan vs. Seq Scan) e importación de catálogo con tablas temporales.

---

## 2. Documentación Técnica

### Arquitectura de la Aplicación (Frontend-Only Mock)
La aplicación actual funciona como una maqueta interactiva 100% funcional del lado del cliente, utilizando:
* **HTML5 Semántico**: Para estructurar el contenido de cada página de manera accesible y optimizada para SEO.
* **CSS3 Vanilla**: Estilos estructurados con variables personalizadas (tokens de diseño HSL), layouts responsivos (CSS Grid y Flexbox) y transiciones fluidas de micro-interacciones.
* **JavaScript Moderno (ES6)**:
  * **Persistencia**: Simulación de base de datos relacional persistida localmente a través de `localStorage` y `sessionStorage`.
  * **Sincronización en Tiempo Real**: Uso de eventos de almacenamiento (`storage` events) para replicar en tiempo real los cambios en la base de datos simulada entre diferentes pestañas abiertas (ej. al agregar un plato en el panel administrador, se actualiza instantáneamente la carta digital del cliente en la otra pestaña).

### Seguridad y Aislamiento (Multi-Tenant)
* **Autenticación JWT**: Generación y decodificación de JSON Web Tokens (JWT) firmados en el cliente para simular las sesiones de Auth0 tanto para los administradores de los locales como para los superadministradores.
* **Criptografía**: Ofuscación reversible simple utilizando compresión XOR con una semilla y codificación Base64 para almacenar contraseñas y alias de CBU de manera segura en el almacenamiento local.
* **Aislamiento de Inquilino (Tenant Isolation)**: Validación automática en tiempo real que compara el ID del local activo en el navegador con el ID del inquilino incrustado en el token JWT para prevenir vulnerabilidades de secuestro de cuenta (IDOR / Tenant Mismatch).

### Estructura de Base de Datos Relacional (`schema.sql`)
La estructura de producción diseñada para PostgreSQL incluye las siguientes tablas normalizadas:
1. `superadmins`: Datos de acceso de los dueños de la plataforma.
2. `restaurants`: Entidad de Inquilinos (Tenants) con atributos de plan, estado del servicio, CUIT e información de cobro CBU.
3. `restaurant_users`: Administradores y staff de cada local (roles: admin, waiter, kitchen).
4. `menu_items`: Platos asociados al menú de cada local (con exclusión lógica mediante flag `disponible`).
5. `orders`: Comandas de los clientes con información de canal, estado y cobro.
6. `order_items`: Desglose de artículos comprados (desnormalizado para auditoría de precios históricos).
7. `caja_transactions`: Libro contable de caja chica de salón, delivery y plataformas.

*Estrategias de Indexación:* Índices B-Tree compuestos (`idx_orders_res_estado_fecha`, `idx_menu_items_res_cat`) y parciales creados estratégicamente para evitar escaneos secuenciales (Sequential Scans) a gran escala.

---

## Descarga y Acceso

Esta documentación se encuentra guardada en el archivo `DOCUMENTACION.md` en el directorio raíz de tu proyecto. Podés abrirla en cualquier lector de Markdown (como VS Code) o descargarla/copiarla directamente para tus registros funcionales o técnicos.
