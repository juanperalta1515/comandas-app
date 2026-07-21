-- ============================================================================
-- COMANDAFLOW SAAS - ESQUEMA DE BASE DE DATOS DE PRODUCCIÓN
-- SISTEMA MULTI-TENANT OPTIMIZADO PARA ESCALA Y ALTO VOLUMEN DE COMANDAS
-- ============================================================================

-- Habilitar extensión UUID para identificadores seguros y no predecibles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLA: SUPERADMINISTRADORES
-- dueños de la plataforma SaaS (ComandaFlow Owners)
-- ----------------------------------------------------------------------------
CREATE TABLE superadmins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. TABLA: RESTAURANTES (TENANTS / INQUILINOS)
-- Cada restaurant posee sus propios datos independientes (Data Segregation)
-- ----------------------------------------------------------------------------
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL, -- Identificador amigable para la URL de la carta digital
    nombre VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    cuit VARCHAR(20) UNIQUE NOT NULL,
    alias_cbu VARCHAR(100), -- Cuenta de cobro del restaurant para transferencias directas de clientes
    logo VARCHAR(10) DEFAULT '🍕',
    estado VARCHAR(30) DEFAULT 'Pendiente' NOT NULL, -- 'Activo', 'Inactivo', 'Pendiente'
    plan VARCHAR(30) DEFAULT 'Premium' NOT NULL, -- 'Básico', 'Premium'
    onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL,
    metodo_pago_registro VARCHAR(30) NOT NULL, -- 'MercadoPago', 'Transferencia'
    comprobante_registro VARCHAR(100), -- Referencia / número de comprobante de la transferencia si aplica
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. TABLA: USUARIOS DE RESTAURANTE (ADMINISTRADORES Y STAFF)
-- ----------------------------------------------------------------------------
CREATE TABLE restaurant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) DEFAULT 'admin' NOT NULL, -- 'admin', 'waiter', 'kitchen'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. TABLA: MENÚ / PLATOS
-- ----------------------------------------------------------------------------
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(50) NOT NULL, -- 'Entrada', 'Principal', 'Postre', 'Bebida'
    disponible BOOLEAN DEFAULT TRUE NOT NULL,
    imagen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. TABLA: COMANDAS / PEDIDOS
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_pedido VARCHAR(15) NOT NULL, -- Código corto legible (ej. PED-4829) para cantada de cocina
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    tipo_entrega VARCHAR(20) NOT NULL, -- 'envio', 'retiro', 'mesa'
    direccion_entrega VARCHAR(255),
    nro_mesa INT,
    subtotal NUMERIC(12, 2) NOT NULL,
    costo_envio NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL, -- 'efectivo', 'debito', 'credito'
    plataforma VARCHAR(30), -- 'pedidosya', 'rappi', NULL para pedido interno
    estado VARCHAR(30) DEFAULT 'Pendiente' NOT NULL, -- 'Pendiente', 'Confirmado', 'En Preparación', 'Listo para Entregar', 'En Camino', 'Entregado', 'Anulado'
    cobrado BOOLEAN DEFAULT FALSE NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. TABLA: DETALLE DE ARTÍCULOS EN COMANDAS (ORDER ITEMS)
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    nombre VARCHAR(150) NOT NULL, -- Copia desnormalizada para auditoría histórica de precios
    precio NUMERIC(12, 2) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0)
);

-- ----------------------------------------------------------------------------
-- 7. TABLA: TRANSACCIONES DE CAJA CHICA SEGREGADA
-- ----------------------------------------------------------------------------
CREATE TABLE caja_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    descripcion VARCHAR(255) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(50) NOT NULL,
    canal VARCHAR(20) NOT NULL CHECK (canal IN ('salon', 'plataformas', 'directo')),
    estado_cierre VARCHAR(30) DEFAULT 'abierta' NOT NULL, -- 'abierta', 'cerrada_parcial', 'archivada'
    id_cierre_jornada VARCHAR(20), -- Agrupador del cierre diario
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================================
-- ESTRATEGIA DE INDEXACIÓN (ESCABILIDAD Y PREVENCIÓN DE SECUENTIAL SCANS)
-- ============================================================================

-- 1. Indexar el correo electrónico del staff del restaurant para Login rápido
CREATE INDEX idx_restaurant_users_email ON restaurant_users(email);

-- 2. Indexar slug del local para despachar la carta digital QR instantáneamente
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- 3. Índice compuesto para listar el menú de un restaurant filtrado por su categoría
-- Evita escanear platos de otros locales y optimiza el filtro por secciones (Entradas, Bebidas)
CREATE INDEX idx_menu_items_res_cat ON menu_items(restaurant_id, categoria);

-- 4. Índice compuesto altamente crítico para el Tablero Kanban de cocina:
-- Las cocinas sólo consultan los pedidos activos (Pendiente, Confirmado, En Preparación, etc.)
-- de su propio local. Esto reduce el escaneo de millones de órdenes históricas a sólo unas decenas.
CREATE INDEX idx_orders_res_estado_fecha ON orders(restaurant_id, estado, fecha_hora DESC);

-- 5. Indexar detalle de platos por comanda para acelerar la carga del modal de consumos
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 6. Índice para cálculos agregados en el módulo financiero y arqueo de caja
CREATE INDEX idx_caja_tx_res_canal_cierre ON caja_transactions(restaurant_id, canal, estado_cierre, fecha_hora DESC);


-- ============================================================================
-- PROCEDIMIENTO ALMACENADO CON TABLA TEMPORAL
-- Importación segura y sanitizada del catálogo inicial de platos del menú
-- ============================================================================

CREATE OR REPLACE FUNCTION sp_import_initial_menu(
    p_restaurant_id UUID,
    p_menu_json JSONB
)
RETURNS TABLE (
    platos_insertados INT,
    advertencias TEXT
) AS $$
DECLARE
    v_insert_count INT := 0;
    v_errors TEXT := '';
BEGIN
    -- 1. Crear Tabla Temporal en memoria para almacenar provisionalmente la carga
    -- Esto aísla la carga masiva y previene bloqueos de exclusión en la tabla de producción
    CREATE TEMP TABLE temp_menu_import (
        nombre VARCHAR(150),
        descripcion TEXT,
        precio NUMERIC(12,2),
        categoria VARCHAR(50),
        disponible BOOLEAN,
        imagen TEXT
    ) ON COMMIT DROP; -- Se destruye automáticamente al finalizar la transacción

    -- 2. Parsear el JSON e insertar en la tabla temporal
    INSERT INTO temp_menu_import (nombre, descripcion, precio, categoria, disponible, imagen)
    SELECT 
        (item->>'nombre')::VARCHAR,
        (item->>'descripcion')::TEXT,
        (item->>'precio')::NUMERIC,
        (item->>'categoria')::VARCHAR,
        COALESCE((item->>'disponible')::BOOLEAN, TRUE),
        (item->>'imagen')::TEXT
    FROM jsonb_array_elements(p_menu_json) AS item;

    -- 3. Sanitizar y Validar Datos en la Tabla Temporal
    -- Regla 1: Descartar o advertir platos con precios inválidos (menores a cero)
    IF EXISTS (SELECT 1 FROM temp_menu_import WHERE precio < 0) THEN
        v_errors := v_errors || 'Se detectaron platos con precios negativos. Fueron ajustados a $0. ';
        UPDATE temp_menu_import SET precio = 0 WHERE precio < 0;
    END IF;

    -- Regla 2: Completar categorías huérfanas con 'Principal' por defecto
    UPDATE temp_menu_import 
    SET categoria = 'Principal' 
    WHERE categoria IS NULL OR categoria = '';

    -- Regla 3: Sanitizar nombres eliminando espacios redundantes
    UPDATE temp_menu_import 
    SET nombre = TRIM(nombre);

    -- 4. Insertar atómicamente a la tabla permanente desde la tabla temporal filtrada
    -- Optimizado con SELECT de conjunto de datos y JOIN, evitando bucles fila a fila (RBAR)
    INSERT INTO menu_items (restaurant_id, nombre, descripcion, precio, categoria, disponible, imagen)
    SELECT 
        p_restaurant_id,
        nombre,
        descripcion,
        precio,
        categoria,
        disponible,
        COALESCE(imagen, 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80')
    FROM temp_menu_import
    WHERE nombre IS NOT NULL AND nombre <> '';

    GET DIAGNOSTICS v_insert_count = ROW_COUNT;

    -- 5. Devolver resultados de la ejecución
    RETURN QUERY SELECT v_insert_count, COALESCE(v_errors, 'Sin advertencias');

END;
$$ LANGUAGE plpgsql;
