-- ====================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE PARA COMANDAFLOW SAAS
-- PostgreSQL 15+ con Soporte Realtime y Multi-Tenant
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: RESTAURANTES (Comercios registrados en la plataforma)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    alias_cbu TEXT,
    logo TEXT DEFAULT '🍔',
    plan TEXT DEFAULT 'Premium',
    estado TEXT DEFAULT 'Activo', -- 'Activo' | 'Suspendido' | 'Pendiente'
    onboarding_complete BOOLEAN DEFAULT true,
    metodo_pago_registro TEXT DEFAULT 'MercadoPago',
    comprobante_registro TEXT,
    referral_code TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CONFIGURACIÓN DE RESTAURANTE
CREATE TABLE IF NOT EXISTS public.restaurant_configs (
    restaurant_id TEXT PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
    costo_envio NUMERIC DEFAULT 800,
    monto_envio_gratis NUMERIC DEFAULT 8000,
    interes_credito NUMERIC DEFAULT 10,
    whatsapp_phone TEXT,
    whatsapp_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: MENÚ Y PLATOS
CREATE TABLE IF NOT EXISTS public.menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL, -- 'Hamburguesas' | 'Pizzas' | 'Bebidas' | etc.
    descripcion TEXT,
    precio NUMERIC NOT NULL,
    imagen TEXT,
    disponible BOOLEAN DEFAULT true,
    opciones JSONB DEFAULT '{}'::jsonb, -- { tamanos: [], adicionales: [] }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: COMANDAS / PEDIDOS (Sincronización en Tiempo Real)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- 'PED-XXXX'
    restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    nombre_cliente TEXT NOT NULL,
    telefono_cliente TEXT,
    tipo_entrega TEXT NOT NULL, -- 'salon' | 'retiro' | 'envio' | 'mesa'
    nro_mesa INT,
    direccion_entrega TEXT,
    items JSONB NOT NULL, -- [{ id, nombre, precio, cantidad, ... }]
    subtotal NUMERIC NOT NULL,
    costo_envio NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    metodo_pago TEXT DEFAULT 'efectivo', -- 'efectivo' | 'debito' | 'credito' | 'mercadopago'
    financiacion JSONB,
    estado TEXT DEFAULT 'Pendiente', -- 'Pendiente' | 'Confirmado' | 'En Preparación' | 'Listo para Entregar' | 'En Camino' | 'Entregado' | 'Anulado'
    cobrado BOOLEAN DEFAULT false,
    fecha_hora TEXT NOT NULL,
    fecha_hora_entrega TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: MESAS DEL SALÓN
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id SERIAL PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    numero INT NOT NULL,
    estado TEXT DEFAULT 'Libre', -- 'Libre' | 'Ocupada' | 'Pidiendo Cuenta'
    pedido_activo TEXT,
    UNIQUE(restaurant_id, numero)
);

-- 7. TABLA: CAJA Y MOVIMIENTOS EN VIVO
CREATE TABLE IF NOT EXISTS public.caja_transactions (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),
    tipo TEXT NOT NULL, -- 'ingreso' | 'egreso'
    descripcion TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    metodo_pago TEXT DEFAULT 'Efectivo',
    canal TEXT NOT NULL, -- 'salon' | 'directo'
    id_cierre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: CIERRES DE JORNADA CONSOLIDADOS
CREATE TABLE IF NOT EXISTS public.cierres_jornada (
    id TEXT PRIMARY KEY, -- 'CIE-XXXX'
    restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    total_salon NUMERIC NOT NULL DEFAULT 0,
    total_directo NUMERIC NOT NULL DEFAULT 0,
    total_general NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ACTIVACIÓN DE REALTIME (Websockets instantáneos para cocina y salón)
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.caja_transactions;

-- ====================================================================
-- POLÍTICAS DE ACCESO PÚBLICO / ANON PARA CLIENTES Y COMERCIOS
-- ====================================================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cierres_jornada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de restaurantes" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Gestión de restaurantes" ON public.restaurants FOR ALL USING (true);

CREATE POLICY "Lectura pública de configs" ON public.restaurant_configs FOR SELECT USING (true);
CREATE POLICY "Gestión de configs" ON public.restaurant_configs FOR ALL USING (true);

CREATE POLICY "Lectura pública de menús" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Gestión de menús" ON public.menu_items FOR ALL USING (true);

CREATE POLICY "Lectura y creación pública de pedidos" ON public.orders FOR ALL USING (true);
CREATE POLICY "Gestión de mesas" ON public.restaurant_tables FOR ALL USING (true);
CREATE POLICY "Gestión de transacciones de caja" ON public.caja_transactions FOR ALL USING (true);
CREATE POLICY "Gestión de cierres de jornada" ON public.cierres_jornada FOR ALL USING (true);

-- ====================================================================
-- DATOS INICIALES DEMOSTRATIVOS
-- ====================================================================
INSERT INTO public.restaurants (id, nombre, email, password_hash, whatsapp, alias_cbu, logo)
VALUES 
('quincho', 'El Quincho Porteño', 'contacto@quincho.com', 'quincho123', '+5491132456789', 'quincho.mp', '🍔'),
('napoli', 'Pizzería Napoli & Pasta', 'contacto@napoli.com', 'napoli123', '+5491145678901', 'napoli.pizzeria.mp', '🍕'),
('sushizen', 'Sushi Zen Nikkei', 'contacto@sushizen.com', 'sushi123', '+5491178901234', 'sushi.zen.cbu', '🍣'),
('juanresto', 'Parrilla & Restó Juan', 'juanperalta2015f@gmail.com', 'juan123', '+5491155556666', 'juan.comandas.mp', '🥩')
ON CONFLICT (id) DO NOTHING;
