import { createClient } from '@supabase/supabase-js';

// Variables de entorno de Supabase configuradas en Netlify o .env local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
    return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

export const supabase = isSupabaseConfigured() 
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    })
    : null;

// ==========================================
// RESTAURANTES
// ==========================================
export async function fetchRemoteRestaurants() {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*');
        if (error) {
            console.warn('Error al obtener restaurantes de Supabase:', error.message);
            return null;
        }
        return data;
    } catch (e) {
        console.warn('Error de conexión a Supabase:', e);
        return null;
    }
}

export async function syncRestaurantToSupabase(restaurant) {
    if (!isSupabaseConfigured() || !supabase || !restaurant) return;
    try {
        await supabase.from('restaurants').upsert({
            id: restaurant.id,
            nombre: restaurant.nombre,
            email: restaurant.email,
            password_hash: restaurant.password || restaurant.password_hash || '',
            whatsapp: restaurant.whatsapp || '',
            alias_cbu: restaurant.alias_cbu || '',
            logo: restaurant.logo || '🍔',
            plan: restaurant.plan || 'Premium',
            estado: restaurant.estado || 'Activo',
            onboarding_complete: restaurant.onboarding_complete ?? true,
            metodo_pago_registro: restaurant.metodo_pago_registro || 'MercadoPago',
            comprobante_registro: restaurant.comprobante_registro || '',
            referral_code: restaurant.referral_code || ''
        });
    } catch (e) {
        console.warn('Error syncing restaurant to Supabase:', e);
    }
}

// ==========================================
// PEDIDOS / COMANDAS (CRUD + REALTIME)
// ==========================================
export async function fetchOrdersFromSupabase(restaurantId) {
    if (!isSupabaseConfigured() || !supabase || !restaurantId) return null;
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });
        if (error) {
            console.warn('Error al obtener pedidos de Supabase:', error.message);
            return null;
        }
        return data.map(p => ({
            id_pedido: p.id,
            nombre_cliente: p.nombre_cliente,
            telefono_cliente: p.telefono_cliente,
            tipo_entrega: p.tipo_entrega,
            nro_mesa: p.nro_mesa,
            direccion_entrega: p.direccion_entrega,
            items: p.items || [],
            subtotal: Number(p.subtotal),
            costo_envio: Number(p.costo_envio),
            total: Number(p.total),
            metodo_pago: p.metodo_pago,
            financiacion: p.financiacion,
            estado: p.estado,
            cobrado: Boolean(p.cobrado),
            fecha_hora: p.fecha_hora,
            fecha_hora_entrega: p.fecha_hora_entrega
        }));
    } catch (e) {
        console.warn('Error fetchOrdersFromSupabase:', e);
        return null;
    }
}

export async function syncOrderToSupabase(order, restaurantId) {
    if (!isSupabaseConfigured() || !supabase || !order || !restaurantId) return;
    try {
        await supabase.from('orders').upsert({
            id: String(order.id_pedido),
            restaurant_id: restaurantId,
            nombre_cliente: order.nombre_cliente || 'Cliente',
            telefono_cliente: order.telefono_cliente || '',
            tipo_entrega: order.tipo_entrega || 'salon',
            nro_mesa: order.nro_mesa ? Number(order.nro_mesa) : null,
            direccion_entrega: order.direccion_entrega || '',
            items: order.items || [],
            subtotal: Number(order.subtotal || order.total || 0),
            costo_envio: Number(order.costo_envio || 0),
            total: Number(order.total || 0),
            metodo_pago: order.metodo_pago || 'efectivo',
            financiacion: order.financiacion || null,
            estado: order.estado || 'Pendiente',
            cobrado: Boolean(order.cobrado),
            fecha_hora: order.fecha_hora || new Date().toLocaleTimeString('es-AR'),
            fecha_hora_entrega: order.fecha_hora_entrega || 'Lo antes posible'
        });
    } catch (e) {
        console.warn('Error syncOrderToSupabase:', e);
    }
}

export async function updateOrderStatusInSupabase(orderId, updates) {
    if (!isSupabaseConfigured() || !supabase || !orderId) return;
    try {
        await supabase
            .from('orders')
            .update(updates)
            .eq('id', String(orderId));
    } catch (e) {
        console.warn('Error updateOrderStatusInSupabase:', e);
    }
}

export function subscribeToOrders(restaurantId, onInsert, onUpdate) {
    if (!isSupabaseConfigured() || !supabase || !restaurantId) return () => {};

    const channel = supabase
        .channel(`realtime-orders-${restaurantId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`
        }, payload => {
            if (onInsert && payload.new) {
                const p = payload.new;
                onInsert({
                    id_pedido: p.id,
                    nombre_cliente: p.nombre_cliente,
                    telefono_cliente: p.telefono_cliente,
                    tipo_entrega: p.tipo_entrega,
                    nro_mesa: p.nro_mesa,
                    direccion_entrega: p.direccion_entrega,
                    items: p.items || [],
                    subtotal: Number(p.subtotal),
                    costo_envio: Number(p.costo_envio),
                    total: Number(p.total),
                    metodo_pago: p.metodo_pago,
                    financiacion: p.financiacion,
                    estado: p.estado,
                    cobrado: Boolean(p.cobrado),
                    fecha_hora: p.fecha_hora,
                    fecha_hora_entrega: p.fecha_hora_entrega
                });
            }
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`
        }, payload => {
            if (onUpdate && payload.new) {
                const p = payload.new;
                onUpdate({
                    id_pedido: p.id,
                    nombre_cliente: p.nombre_cliente,
                    telefono_cliente: p.telefono_cliente,
                    tipo_entrega: p.tipo_entrega,
                    nro_mesa: p.nro_mesa,
                    direccion_entrega: p.direccion_entrega,
                    items: p.items || [],
                    subtotal: Number(p.subtotal),
                    costo_envio: Number(p.costo_envio),
                    total: Number(p.total),
                    metodo_pago: p.metodo_pago,
                    financiacion: p.financiacion,
                    estado: p.estado,
                    cobrado: Boolean(p.cobrado),
                    fecha_hora: p.fecha_hora,
                    fecha_hora_entrega: p.fecha_hora_entrega
                });
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// ==========================================
// MESAS (SALÓN)
// ==========================================
export async function syncTablesToSupabase(tables, restaurantId) {
    if (!isSupabaseConfigured() || !supabase || !tables || !restaurantId) return;
    try {
        const rows = tables.map(t => ({
            restaurant_id: restaurantId,
            numero: t.numero,
            estado: t.estado || 'Libre',
            pedido_activo: t.pedido_activo ? String(t.pedido_activo) : null
        }));
        await supabase.from('restaurant_tables').upsert(rows, { onConflict: 'restaurant_id,numero' });
    } catch (e) {
        console.warn('Error syncTablesToSupabase:', e);
    }
}

// ==========================================
// DIAGNÓSTICO Y TEST DE SALUD CLOUD
// ==========================================
export async function testSupabaseHealthCheck() {
    const report = {
        configured: isSupabaseConfigured(),
        url: supabaseUrl ? supabaseUrl.replace(/(https:\/\/[^.]+).*/, '$1.supabase.co') : 'No configurada',
        connected: false,
        latencyMs: 0,
        tests: {
            restaurants: { ok: false, count: 0, error: null },
            orders: { ok: false, error: null },
            realtime: { ok: false, error: null }
        },
        error: null
    };

    if (!isSupabaseConfigured() || !supabase) {
        report.error = 'Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no están definidas en el entorno.';
        return report;
    }

    const start = performance.now();
    try {
        // Test 1: Lectura de tabla restaurants
        const { data: restData, error: restErr } = await supabase
            .from('restaurants')
            .select('id, nombre, email')
            .limit(5);

        if (restErr) {
            report.tests.restaurants.error = restErr.message;
        } else {
            report.tests.restaurants.ok = true;
            report.tests.restaurants.count = restData ? restData.length : 0;
        }

        // Test 2: Lectura de tabla orders
        const { error: ordErr } = await supabase
            .from('orders')
            .select('id')
            .limit(1);

        if (ordErr) {
            report.tests.orders.error = ordErr.message;
        } else {
            report.tests.orders.ok = true;
        }

        // Test 3: Realtime channel handshake
        try {
            const channel = supabase.channel('health-check-channel');
            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    report.tests.realtime.ok = true;
                }
            });
            setTimeout(() => {
                supabase.removeChannel(channel);
            }, 1000);
            report.tests.realtime.ok = true;
        } catch (rtErr) {
            report.tests.realtime.error = rtErr.message;
        }

        report.latencyMs = Math.round(performance.now() - start);
        report.connected = report.tests.restaurants.ok && report.tests.orders.ok;

    } catch (e) {
        report.error = e.message || 'Error general al conectar con Supabase';
    }

    return report;
}

export async function syncTransactionToSupabase(tx, restaurantId) {
    if (!isSupabaseConfigured() || !supabase || !tx || !restaurantId) return;
    try {
        await supabase.from('caja_transactions').upsert({
            id: String(tx.id),
            restaurant_id: restaurantId,
            tipo: tx.tipo,
            descripcion: tx.descripcion,
            monto: Number(tx.monto),
            metodo_pago: tx.metodo_pago || 'Efectivo',
            canal: tx.canal || 'salon',
            id_cierre: tx.id_cierre || null
        });
    } catch (e) {
        console.warn('Error syncTransactionToSupabase:', e);
    }
}

export async function syncCierreToSupabase(cierre, restaurantId) {
    if (!isSupabaseConfigured() || !supabase || !cierre || !restaurantId) return;
    try {
        await supabase.from('cierres_jornada').upsert({
            id: String(cierre.id_cierre),
            restaurant_id: restaurantId,
            fecha: cierre.fecha,
            hora: cierre.hora,
            total_salon: Number(cierre.total_salon || 0),
            total_directo: Number(cierre.total_directo || 0),
            total_general: Number(cierre.total_general || 0)
        });
    } catch (e) {
        console.warn('Error syncCierreToSupabase:', e);
    }
}

