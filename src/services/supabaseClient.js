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

/**
 * Helper de sincronización para cargar datos iniciales de Supabase si está disponible
 */
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

/**
 * Suscripción en Tiempo Real para Pedidos de un Restaurante
 */
export function subscribeToOrders(restaurantId, onInsert, onUpdate) {
    if (!isSupabaseConfigured() || !supabase) return () => {};

    const channel = supabase
        .channel(`orders-${restaurantId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`
        }, payload => {
            if (onInsert) onInsert(payload.new);
        })
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`
        }, payload => {
            if (onUpdate) onUpdate(payload.new);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
