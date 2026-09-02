import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DbContext = createContext();

// Claves secretas de seguridad y cifrado
const SAAS_SECRET_SALT = "ComandaFlowSecureSalt102!";
const JWT_SECRET_KEY = "comandaflow_secret_hash_2026";

// Claves globales de localStorage
const KEY_RESTAURANTS = 'comandas_saas_restaurants';
const KEY_ACTIVE_RESTAURANT = 'comandas_saas_active_restaurant';
const KEY_OFFLINE_SIMULATED = 'comandas_offline_simulated';
const KEY_OFFLINE_QUEUE = 'comandas_offline_queue';
const KEY_EMAIL_LOGS = 'comandas_email_logs';
const KEY_SAAS_CONFIG = 'comandas_saas_config';

// Helper para obtener claves por restaurante (Multi-Tenancy aislado)
export function getStoreKey(restaurantId, keyName) {
    const cleanId = (restaurantId || 'quincho').toLowerCase().trim();
    return `comandas_tenant_${cleanId}_${keyName}`;
}

const SAAS_CONFIG_DEFECTO = {
    owner_mp_public_key: 'APP_USR-67890123-bcde-4567-8901-23456789abcd',
    owner_mp_access_token: 'APP_USR-1234567890123456-082517-74ea8234850937a7b830495204859bc3-987654321',
    plan_basico_id: 'plan_basico_cf_prod',
    plan_premium_id: 'plan_premium_cf_prod',
    owner_cbu: '0170259240000007239234',
    owner_banco: 'BBVA'
};

// Criptografía y ofuscación de datos
export function ofuscarDatoSensible(texto) {
    if (!texto) return "";
    if (texto.startsWith("enc::")) return texto;
    
    let resultado = "";
    for (let i = 0; i < texto.length; i++) {
        const charCode = texto.charCodeAt(i);
        const saltChar = SAAS_SECRET_SALT.charCodeAt(i % SAAS_SECRET_SALT.length);
        const cipheredVal = charCode ^ saltChar;
        resultado += String.fromCharCode(cipheredVal);
    }
    return "enc::" + btoa(unescape(encodeURIComponent(resultado)));
}

export function desofuscarDatoSensible(textoOfuscado) {
    if (!textoOfuscado) return "";
    if (!textoOfuscado.startsWith("enc::")) return textoOfuscado;
    
    try {
        const ciphertext = textoOfuscado.substring(5);
        const raw = decodeURIComponent(escape(atob(ciphertext)));
        let resultado = "";
        for (let i = 0; i < raw.length; i++) {
            const charCode = raw.charCodeAt(i);
            const saltChar = SAAS_SECRET_SALT.charCodeAt(i % SAAS_SECRET_SALT.length);
            const decipheredVal = charCode ^ saltChar;
            resultado += String.fromCharCode(decipheredVal);
        }
        return resultado;
    } catch (e) {
        console.error("Error al desofuscar dato sensible:", e.message);
        return "";
    }
}

export function escaparHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function(match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#x27;';
            default: return match;
        }
    });
}

// Catálogos iniciales por restaurante
const PLATOS_QUINCHO = [
    { 
        id: 1, 
        nombre: 'Pizza Especial de Muzzarella y Jamón', 
        descripcion: 'Muzzarela premium, jamón cocido, morrones asados y aceitunas verdes.', 
        precio: 6500, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
        opciones: {
            tamanos: [
                { nombre: 'Chica', recargo: 0 },
                { nombre: 'Mediana', recargo: 1500 },
                { nombre: 'Familiar', recargo: 3000 }
            ],
            adicionales: [
                { nombre: 'Extra Queso', recargo: 800 },
                { nombre: 'Huevo Frito', recargo: 500 },
                { nombre: 'Panceta', recargo: 1000 }
            ]
        }
    },
    { 
        id: 2, 
        nombre: 'Pizza Fugazzeta Rellena (Porción)', 
        descripcion: 'Abundante cebolla caramelizada, doble muzzarela y orégano.', 
        precio: 2200, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 3, 
        nombre: 'Empanada de Carne Cortada a Cuchillo', 
        descripcion: 'Frita o al horno. Relleno jugoso de carne vacuna con verdeo y comino.', 
        precio: 950, 
        categoria: 'Entrada', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1556040885-3571d79435b6?auto=format&fit=crop&w=400&q=80',
        opciones: {
            tamanos: [],
            adicionales: [
                { nombre: 'Frita', recargo: 0, exclusivo: true },
                { nombre: 'Al Horno', recargo: 0, exclusivo: true }
            ]
        }
    },
    { 
        id: 4, 
        nombre: 'Milanesa de Ternera Napolitana con Fritas', 
        descripcion: 'Milanesa gigante, salsa de tomate de la casa, jamón, muzzarela y papas fritas bastón.', 
        precio: 7800, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 5, 
        nombre: 'Flan Casero con Dulce de Leche', 
        descripcion: 'El clásico postre argentino hecho con 8 yemas y dulce de leche colonial.', 
        precio: 2200, 
        categoria: 'Postre', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 6, 
        nombre: 'Cerveza Quilmes Clásica 1L', 
        descripcion: 'Cerveza lager argentina helada, ideal para compartir.', 
        precio: 2500, 
        categoria: 'Bebida', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1608270176054-8a3a38d1723a?auto=format&fit=crop&w=400&q=80'
    }
];

const PLATOS_NAPOLI = [
    { 
        id: 101, 
        nombre: 'Pizza Margherita Verace Napoletana', 
        descripcion: 'Pomodoro San Marzano D.O.P., mozzarella fior di latte, albahaca fresca y aceite de oliva virgen extra.', 
        precio: 8200, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80',
        opciones: {
            tamanos: [
                { nombre: 'Individual', recargo: 0 },
                { nombre: 'Grande (8 porciones)', recargo: 3200 }
            ],
            adicionales: [
                { nombre: 'Prosciutto di Parma', recargo: 1800 },
                { nombre: 'Burrata entera', recargo: 2500 }
            ]
        }
    },
    { 
        id: 102, 
        nombre: 'Calzone Relleno Tradizionale', 
        descripcion: 'Masa madre horneada a leña, rellena de ricotta fresca, jamón cocido y pimienta negra molida.', 
        precio: 7500, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 103, 
        nombre: 'Sorrentinos Caseros de Ricota y Nuez', 
        descripcion: 'Pasta rellena artesanal con salsa bolognesa pomodoro y queso reggianito rallado.', 
        precio: 6900, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 104, 
        nombre: 'Tiramisú Tradicional Italiano', 
        descripcion: 'Bizcochuelo savoiardi bañado en espresso ristretto, queso mascarpone y cacao amargo.', 
        precio: 2800, 
        categoria: 'Postre', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 105, 
        nombre: 'Vino Tinto Malbec Reserva 750ml', 
        descripcion: 'Vino mendocino con paso por roble, notas a ciruela y chocolate.', 
        precio: 4500, 
        categoria: 'Bebida', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=80'
    }
];

const PLATOS_SUSHI = [
    { 
        id: 201, 
        nombre: 'Tabla Tokio Premium 20 Piezas', 
        descripcion: '5 Philadelphia Roll, 5 Salmon Skin Roll, 5 Niguiris de Salmón Flambeado y 5 Geishas con palta y philadelphia.', 
        precio: 14500, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80',
        opciones: {
            tamanos: [
                { nombre: '20 Piezas', recargo: 0 },
                { nombre: '30 Piezas', recargo: 6500 }
            ],
            adicionales: [
                { nombre: 'Salsa Buenos Aires', recargo: 600 },
                { nombre: 'Jengibre Extra', recargo: 400 },
                { nombre: 'Wasabi Premium', recargo: 400 }
            ]
        }
    },
    { 
        id: 202, 
        nombre: 'Gyozas de Cerdo y Verdeo (6u)', 
        descripcion: 'Empanaditas japonesas al vapor y doradas a la plancha, acompañadas de salsa ponzu.', 
        precio: 4200, 
        categoria: 'Entrada', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 203, 
        nombre: 'Wok Nikkei de Lomo y Vegetales', 
        descripcion: 'Lomo saltado al fuego con cebolla morada, morrones, fideos soba y salsa teriyaki.', 
        precio: 8900, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 204, 
        nombre: 'Mousse Cremoso de Maracuyá', 
        descripcion: 'Postre fresco oriental con pulpa de maracuyá y semillas crocantes.', 
        precio: 2500, 
        categoria: 'Postre', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 205, 
        nombre: 'Cerveza Asahi Super Dry 500ml', 
        descripcion: 'Cerveza japonesa importada de sabor fresco y final seco.', 
        precio: 3800, 
        categoria: 'Bebida', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1608270176054-8a3a38d1723a?auto=format&fit=crop&w=400&q=80'
    }
];

const MESAS_INICIALES = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    estado: 'Libre', 
    pedido_activo: null 
}));

const ESTADOS_CAJA_DEFECTO = {
    salon: false,
    directo: false
};

const RESTAURANTES_INICIALES = [
    {
        id: 'quincho',
        nombre: 'El Quincho Porteño',
        whatsapp: '+5491132456789',
        alias_cbu: 'quincho.mp',
        logo: '🍔',
        estado: 'Activo',
        plan: 'Premium',
        onboarding_complete: true,
        email: 'contacto@quincho.com',
        password: ofuscarDatoSensible('quincho123'),
        metodo_pago_registro: 'MercadoPago',
        comprobante_registro: '',
        fecha_registro: '15/01/2026',
        referral_code: 'CF-QUINCHO',
        referral_claimed: false,
        referral_claimed_by: null,
        descuento_activo: false,
        descuento_meses_restantes: 0,
        descuento_porcentaje: 30
    },
    {
        id: 'napoli',
        nombre: 'Pizzería Napoli & Pasta',
        whatsapp: '+5491145678901',
        alias_cbu: 'napoli.pizzeria.mp',
        logo: '🍕',
        estado: 'Activo',
        plan: 'Premium',
        onboarding_complete: true,
        email: 'contacto@napoli.com',
        password: ofuscarDatoSensible('napoli123'),
        metodo_pago_registro: 'MercadoPago',
        comprobante_registro: '',
        fecha_registro: '20/01/2026',
        referral_code: 'CF-NAPOLI',
        referral_claimed: false,
        referral_claimed_by: null,
        descuento_activo: false,
        descuento_meses_restantes: 0,
        descuento_porcentaje: 30
    },
    {
        id: 'sushizen',
        nombre: 'Sushi Zen Nikkei',
        whatsapp: '+5491178901234',
        alias_cbu: 'sushi.zen.cbu',
        logo: '🍣',
        estado: 'Activo',
        plan: 'Premium',
        onboarding_complete: true,
        email: 'contacto@sushizen.com',
        password: ofuscarDatoSensible('sushi123'),
        metodo_pago_registro: 'CBU',
        comprobante_registro: 'Adhesión CBU: 0170...2392',
        fecha_registro: '28/01/2026',
        referral_code: 'CF-SUSHIZEN',
        referral_claimed: false,
        referral_claimed_by: null,
        descuento_activo: false,
        descuento_meses_restantes: 0,
        descuento_porcentaje: 30
    },
    {
        id: 'juanresto',
        nombre: 'Parrilla & Restó Juan',
        whatsapp: '+5491155556666',
        alias_cbu: 'juan.comandas.mp',
        logo: '🥩',
        estado: 'Activo',
        plan: 'Premium',
        onboarding_complete: true,
        email: 'juanperalta2015f@gmail.com',
        password: ofuscarDatoSensible('juan123'),
        metodo_pago_registro: 'MercadoPago',
        comprobante_registro: '',
        fecha_registro: '01/03/2026',
        referral_code: 'CF-JUAN',
        referral_claimed: false,
        referral_claimed_by: null,
        descuento_activo: false,
        descuento_meses_restantes: 0,
        descuento_porcentaje: 30
    }
];

// Helper para obtener datos iniciales por restaurante
function getInitialCatalogForRestaurant(resId) {
    const id = (resId || '').toLowerCase();
    if (id === 'napoli') return PLATOS_NAPOLI;
    if (id === 'sushizen') return PLATOS_SUSHI;
    return PLATOS_QUINCHO;
}

function getInitialConfigForRestaurant(restaurant) {
    const resId = restaurant?.id || 'quincho';
    const nombre = restaurant?.nombre || 'Mi Restaurante';
    const whatsapp = restaurant?.whatsapp || '+5491100000000';
    return {
        montoEnvioGratis: 8000, 
        costoEnvio: 800,       
        interesCredito: 10,     
        restauranteNombre: nombre,
        whatsappPhone: whatsapp,
        whatsappToken: `EAAG_${resId}_token_simulado_2026`
    };
}

// Historiales de cierres demostrativos iniciales por restaurante (Salón y Venta Directa)
function getInitialCierresForRestaurant(resId) {
    const id = (resId || '').toLowerCase();
    if (id === 'napoli') {
        return [
            {
                id_cierre: 'CIE-9102',
                fecha: '28/02/2026',
                hora: '23:45:10',
                total_salon: 68500,
                total_directo: 26000,
                total_general: 94500
            },
            {
                id_cierre: 'CIE-8921',
                fecha: '27/02/2026',
                hora: '23:30:00',
                total_salon: 58000,
                total_directo: 20000,
                total_general: 78000
            }
        ];
    }
    if (id === 'sushizen') {
        return [
            {
                id_cierre: 'CIE-9340',
                fecha: '28/02/2026',
                hora: '23:55:00',
                total_salon: 95000,
                total_directo: 40000,
                total_general: 135000
            },
            {
                id_cierre: 'CIE-9210',
                fecha: '27/02/2026',
                hora: '23:40:15',
                total_salon: 82000,
                total_directo: 30000,
                total_general: 112000
            }
        ];
    }
    // Quincho
    return [
        {
            id_cierre: 'CIE-8501',
            fecha: '28/02/2026',
            hora: '23:50:20',
            total_salon: 42000,
            total_directo: 20000,
            total_general: 62000
        },
        {
            id_cierre: 'CIE-8410',
            fecha: '27/02/2026',
            hora: '23:15:00',
            total_salon: 31000,
            total_directo: 14000,
            total_general: 45000
        }
    ];
}

export function DbProvider({ children }) {
    // 1. Lista de Restaurantes (SaaS)
    const [restaurants, setRestaurants] = useState(() => {
        const data = localStorage.getItem(KEY_RESTAURANTS);
        if (!data) {
            localStorage.setItem(KEY_RESTAURANTS, JSON.stringify(RESTAURANTES_INICIALES));
            return RESTAURANTES_INICIALES;
        }
        try {
            const list = JSON.parse(data);
            const missing = RESTAURANTES_INICIALES.filter(initR => !list.some(r => r.email?.toLowerCase() === initR.email?.toLowerCase()));
            if (missing.length > 0) {
                const merged = [...list, ...missing];
                localStorage.setItem(KEY_RESTAURANTS, JSON.stringify(merged));
                return merged;
            }
            return list;
        } catch (e) {
            localStorage.setItem(KEY_RESTAURANTS, JSON.stringify(RESTAURANTES_INICIALES));
            return RESTAURANTES_INICIALES;
        }
    });

    // 2. Restaurante Activo Seleccionado
    const [activeRestaurant, setActiveRestaurant] = useState(() => {
        const data = localStorage.getItem(KEY_ACTIVE_RESTAURANT);
        if (!data) {
            const defaultRes = RESTAURANTES_INICIALES[0];
            localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(defaultRes));
            return defaultRes;
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            const defaultRes = RESTAURANTES_INICIALES[0];
            localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(defaultRes));
            return defaultRes;
        }
    });

    const currentResId = activeRestaurant?.id || 'quincho';

    // 3. Helper de carga por local
    const loadStoreItem = (resId, keyName, defaultVal) => {
        const cleanId = resId || 'quincho';
        const storeKey = getStoreKey(cleanId, keyName);
        const raw = localStorage.getItem(storeKey);
        if (!raw) {
            // Migración de claves legacy si existen y es 'quincho'
            if (cleanId === 'quincho') {
                const legacyRaw = localStorage.getItem(`comandas_${keyName}`);
                if (legacyRaw) {
                    try {
                        const parsedLegacy = JSON.parse(legacyRaw);
                        localStorage.setItem(storeKey, JSON.stringify(parsedLegacy));
                        return parsedLegacy;
                    } catch(e) {}
                }
            }
            localStorage.setItem(storeKey, JSON.stringify(defaultVal));
            return defaultVal;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            localStorage.setItem(storeKey, JSON.stringify(defaultVal));
            return defaultVal;
        }
    };

    // 4. Estados por Restaurante (Segregados / Multi-Tenant)
    const [menu, setMenu] = useState(() => loadStoreItem(currentResId, 'menu', getInitialCatalogForRestaurant(currentResId)));
    const [config, setConfig] = useState(() => loadStoreItem(currentResId, 'config', getInitialConfigForRestaurant(activeRestaurant)));
    const [orders, setOrders] = useState(() => loadStoreItem(currentResId, 'orders', []));
    const [tables, setTables] = useState(() => loadStoreItem(currentResId, 'tables', MESAS_INICIALES));
    const [caja, setCaja] = useState(() => loadStoreItem(currentResId, 'caja', []));
    const [cajaEstados, setCajaEstados] = useState(() => loadStoreItem(currentResId, 'caja_estados', ESTADOS_CAJA_DEFECTO));
    const [cierres, setCierres] = useState(() => loadStoreItem(currentResId, 'cierres', getInitialCierresForRestaurant(currentResId)));
    const [waLogs, setWaLogs] = useState(() => loadStoreItem(currentResId, 'wa_logs', []));

    // 5. Estados Globales SaaS / Simulación
    const [offlineMode, setOfflineModeState] = useState(() => localStorage.getItem(KEY_OFFLINE_SIMULATED) === 'true');
    const [offlineQueue, setOfflineQueue] = useState(() => {
        const data = localStorage.getItem(KEY_OFFLINE_QUEUE);
        return data ? JSON.parse(data) : [];
    });
    const [emailLogs, setEmailLogs] = useState(() => {
        const data = localStorage.getItem(KEY_EMAIL_LOGS);
        return data ? JSON.parse(data) : [];
    });
    const [saasConfig, setSaasConfig] = useState(() => {
        const data = localStorage.getItem(KEY_SAAS_CONFIG);
        if (!data) {
            localStorage.setItem(KEY_SAAS_CONFIG, JSON.stringify(SAAS_CONFIG_DEFECTO));
            return SAAS_CONFIG_DEFECTO;
        }
        return JSON.parse(data);
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const token = sessionStorage.getItem('comandaflow_jwt_token');
        if (!token) return null;
        try {
            return verificarYDecodificarJWT(token);
        } catch (e) {
            sessionStorage.removeItem('comandaflow_jwt_token');
            return null;
        }
    });

    // Cargar datos cuando cambia el restaurante activo
    const switchRestaurant = useCallback((resId) => {
        const local = restaurants.find(r => r.id === resId) || restaurants[0];
        if (!local) return;

        localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(local));
        setActiveRestaurant(local);

        const loadedMenu = loadStoreItem(local.id, 'menu', getInitialCatalogForRestaurant(local.id));
        const loadedConfig = loadStoreItem(local.id, 'config', getInitialConfigForRestaurant(local));
        const loadedOrders = loadStoreItem(local.id, 'orders', []);
        const loadedTables = loadStoreItem(local.id, 'tables', MESAS_INICIALES);
        const loadedCaja = loadStoreItem(local.id, 'caja', []);
        const loadedCajaEstados = loadStoreItem(local.id, 'caja_estados', ESTADOS_CAJA_DEFECTO);
        const loadedCierres = loadStoreItem(local.id, 'cierres', getInitialCierresForRestaurant(local.id));
        const loadedWaLogs = loadStoreItem(local.id, 'wa_logs', []);

        setMenu(loadedMenu);
        setConfig(loadedConfig);
        setOrders(loadedOrders);
        setTables(loadedTables);
        setCaja(loadedCaja);
        setCajaEstados(loadedCajaEstados);
        setCierres(loadedCierres);
        setWaLogs(loadedWaLogs);

        // Actualizar sesión JWT con el nuevo restaurante
        loginWithAuth0(local.email, 'merchant', local.nombre, local.id);
    }, [restaurants]);

    // Recargar estado cada vez que `currentResId` cambie
    useEffect(() => {
        if (!activeRestaurant) return;
        const targetId = activeRestaurant.id;

        const storeKeyMenu = getStoreKey(targetId, 'menu');
        const rawMenu = localStorage.getItem(storeKeyMenu);
        const nextMenu = rawMenu ? JSON.parse(rawMenu) : getInitialCatalogForRestaurant(targetId);
        setMenu(nextMenu);

        const storeKeyConfig = getStoreKey(targetId, 'config');
        const rawConfig = localStorage.getItem(storeKeyConfig);
        const nextConfig = rawConfig ? JSON.parse(rawConfig) : getInitialConfigForRestaurant(activeRestaurant);
        setConfig(nextConfig);

        const storeKeyOrders = getStoreKey(targetId, 'orders');
        const rawOrders = localStorage.getItem(storeKeyOrders);
        setOrders(rawOrders ? JSON.parse(rawOrders) : []);

        const storeKeyTables = getStoreKey(targetId, 'tables');
        const rawTables = localStorage.getItem(storeKeyTables);
        setTables(rawTables ? JSON.parse(rawTables) : MESAS_INICIALES);

        const storeKeyCaja = getStoreKey(targetId, 'caja');
        const rawCaja = localStorage.getItem(storeKeyCaja);
        setCaja(rawCaja ? JSON.parse(rawCaja) : []);

        const storeKeyCajaEstados = getStoreKey(targetId, 'caja_estados');
        const rawCajaEstados = localStorage.getItem(storeKeyCajaEstados);
        setCajaEstados(rawCajaEstados ? JSON.parse(rawCajaEstados) : ESTADOS_CAJA_DEFECTO);

        const storeKeyCierres = getStoreKey(targetId, 'cierres');
        const rawCierres = localStorage.getItem(storeKeyCierres);
        setCierres(rawCierres ? JSON.parse(rawCierres) : getInitialCierresForRestaurant(targetId));

        const storeKeyWa = getStoreKey(targetId, 'wa_logs');
        const rawWa = localStorage.getItem(storeKeyWa);
        setWaLogs(rawWa ? JSON.parse(rawWa) : []);
    }, [activeRestaurant]);

    // Sincronizar entre pestañas con localStorage event
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (!e.newValue) return;
            try {
                const parsed = JSON.parse(e.newValue);
                const prefix = `comandas_tenant_${currentResId}_`;

                if (e.key === `${prefix}menu`) setMenu(parsed);
                else if (e.key === `${prefix}config`) setConfig(parsed);
                else if (e.key === `${prefix}orders`) setOrders(parsed);
                else if (e.key === `${prefix}tables`) setTables(parsed);
                else if (e.key === `${prefix}caja`) setCaja(parsed);
                else if (e.key === `${prefix}caja_estados`) setCajaEstados(parsed);
                else if (e.key === `${prefix}cierres`) setCierres(parsed);
                else if (e.key === `${prefix}wa_logs`) setWaLogs(parsed);
                else if (e.key === KEY_RESTAURANTS) setRestaurants(parsed);
                else if (e.key === KEY_ACTIVE_RESTAURANT) setActiveRestaurant(parsed);
                else if (e.key === KEY_OFFLINE_SIMULATED) setOfflineModeState(e.newValue === 'true');
                else if (e.key === KEY_OFFLINE_QUEUE) setOfflineQueue(parsed);
                else if (e.key === KEY_EMAIL_LOGS) setEmailLogs(parsed);
                else if (e.key === KEY_SAAS_CONFIG) setSaasConfig(parsed);
            } catch(err) {}
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [currentResId]);

    // Mutadores con aislamiento por tenant
    const updateMenu = (newMenu, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'menu'), JSON.stringify(newMenu));
        if (resId === currentResId) setMenu(newMenu);
    };

    const updateConfig = (newConfig, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'config'), JSON.stringify(newConfig));
        if (resId === currentResId) setConfig(newConfig);
    };

    const updateOrders = (newOrders, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'orders'), JSON.stringify(newOrders));
        if (resId === currentResId) setOrders(newOrders);
    };

    const updateWaLogs = (newWaLogs, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'wa_logs'), JSON.stringify(newWaLogs));
        if (resId === currentResId) setWaLogs(newWaLogs);
    };

    const updateTables = (newTables, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'tables'), JSON.stringify(newTables));
        if (resId === currentResId) setTables(newTables);
    };

    const updateCaja = (newCaja, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'caja'), JSON.stringify(newCaja));
        if (resId === currentResId) setCaja(newCaja);
    };

    const updateCajaEstados = (newEstados, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'caja_estados'), JSON.stringify(newEstados));
        if (resId === currentResId) setCajaEstados(newEstados);
    };

    const updateCierres = (newCierres, customResId = null) => {
        const resId = customResId || currentResId;
        localStorage.setItem(getStoreKey(resId, 'cierres'), JSON.stringify(newCierres));
        if (resId === currentResId) setCierres(newCierres);
    };

    const updateRestaurants = (newRestaurants) => {
        localStorage.setItem(KEY_RESTAURANTS, JSON.stringify(newRestaurants));
        setRestaurants(newRestaurants);
    };

    const updateActiveRestaurant = (newActive) => {
        localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(newActive));
        setActiveRestaurant(newActive);
    };

    const setOfflineMode = (val) => {
        localStorage.setItem(KEY_OFFLINE_SIMULATED, val ? 'true' : 'false');
        setOfflineModeState(val);
    };

    const updateOfflineQueue = (newQueue) => {
        localStorage.setItem(KEY_OFFLINE_QUEUE, JSON.stringify(newQueue));
        setOfflineQueue(newQueue);
    };

    const updateEmailLogs = (newLogs) => {
        localStorage.setItem(KEY_EMAIL_LOGS, JSON.stringify(newLogs));
        setEmailLogs(newLogs);
    };

    const updateSaasConfig = (newSaasConfig) => {
        localStorage.setItem(KEY_SAAS_CONFIG, JSON.stringify(newSaasConfig));
        setSaasConfig(newSaasConfig);
    };

    // Helper para que el menú de cliente (/menu/:restaurantId) obtenga los datos del restaurante requerido
    const getRestaurantData = (restaurantId) => {
        const resId = (restaurantId || currentResId).toLowerCase();
        const found = restaurants.find(r => r.id.toLowerCase() === resId) || restaurants[0];
        
        // Menu
        const storeKeyMenu = getStoreKey(found.id, 'menu');
        const rawMenu = localStorage.getItem(storeKeyMenu);
        const resMenu = rawMenu ? JSON.parse(rawMenu) : getInitialCatalogForRestaurant(found.id);

        // Config
        const storeKeyConfig = getStoreKey(found.id, 'config');
        const rawConfig = localStorage.getItem(storeKeyConfig);
        const resConfig = rawConfig ? JSON.parse(rawConfig) : getInitialConfigForRestaurant(found);

        // Tables
        const storeKeyTables = getStoreKey(found.id, 'tables');
        const rawTables = localStorage.getItem(storeKeyTables);
        const resTables = rawTables ? JSON.parse(rawTables) : MESAS_INICIALES;

        // Orders
        const storeKeyOrders = getStoreKey(found.id, 'orders');
        const rawOrders = localStorage.getItem(storeKeyOrders);
        const resOrders = rawOrders ? JSON.parse(rawOrders) : [];

        return {
            restaurant: found,
            menu: resMenu,
            config: resConfig,
            tables: resTables,
            orders: resOrders
        };
    };

    // Resetear demo individual o global
    const resetearDemo = (targetResId = null) => {
        const resId = targetResId || currentResId;
        const initialMenu = getInitialCatalogForRestaurant(resId);
        const initialCierres = getInitialCierresForRestaurant(resId);
        const initialConf = getInitialConfigForRestaurant(restaurants.find(r => r.id === resId) || activeRestaurant);

        localStorage.setItem(getStoreKey(resId, 'orders'), JSON.stringify([]));
        localStorage.setItem(getStoreKey(resId, 'caja'), JSON.stringify([]));
        localStorage.setItem(getStoreKey(resId, 'tables'), JSON.stringify(MESAS_INICIALES));
        localStorage.setItem(getStoreKey(resId, 'menu'), JSON.stringify(initialMenu));
        localStorage.setItem(getStoreKey(resId, 'wa_logs'), JSON.stringify([]));
        localStorage.setItem(getStoreKey(resId, 'cierres'), JSON.stringify(initialCierres));
        localStorage.setItem(getStoreKey(resId, 'caja_estados'), JSON.stringify(ESTADOS_CAJA_DEFECTO));
        localStorage.setItem(getStoreKey(resId, 'config'), JSON.stringify(initialConf));

        if (resId === currentResId) {
            setOrders([]);
            setCaja([]);
            setTables(MESAS_INICIALES);
            setMenu(initialMenu);
            setWaLogs([]);
            setCierres(initialCierres);
            setCajaEstados(ESTADOS_CAJA_DEFECTO);
            setConfig(initialConf);
        }
    };

    // -- LÓGICA DE PRECIOS Y COSTOS --
    const calcularCostosPedido = (subtotal, tipoEntrega, customConfig = null) => {
        const activeCfg = customConfig || config;
        const sub = parseFloat(subtotal) || 0;
        if (tipoEntrega === 'retiro' || tipoEntrega === 'mesa') {
            return {
                subtotal: sub,
                costoEnvio: 0,
                total: sub,
                envioGratis: false,
                faltaParaGratis: 0
            };
        }

        const gratis = sub >= activeCfg.montoEnvioGratis;
        const costo = gratis ? 0 : activeCfg.costoEnvio;
        const falta = gratis ? 0 : (activeCfg.montoEnvioGratis - sub);

        return {
            subtotal: sub,
            costoEnvio: costo,
            total: sub + costo,
            envioGratis: gratis,
            faltaParaGratis: falta
        };
    };

    const calcularCuotas = (monto, cuotasSeleccionadas, customConfig = null) => {
        const activeCfg = customConfig || config;
        const interesMensual = activeCfg.interesCredito / 100;
        let recargoPercent = 0;
        if (cuotasSeleccionadas > 1) {
            recargoPercent = interesMensual * cuotasSeleccionadas;
        }
        const totalFinanciado = monto * (1 + recargoPercent);
        const valorCuota = totalFinanciado / cuotasSeleccionadas;
        
        return {
            montoBase: monto,
            cuotas: cuotasSeleccionadas,
            interesAplicado: recargoPercent * 100,
            valorCuota: valorCuota,
            totalFinanciado: totalFinanciado
        };
    };

    // -- SIMULADORES --
    const simularEnvioEmail = (destinatario, asunto, cuerpo) => {
        if (!destinatario) return;
        const emailLog = {
            id: 'MAIL-' + Math.floor(100000 + Math.random() * 900000),
            timestamp: new Date().toISOString(),
            fecha_hora: new Date().toLocaleString('es-AR'),
            destinatario: destinatario,
            asunto: asunto,
            cuerpo: cuerpo,
            smtp_server: 'smtp.comandaflow.com (SMTP SSL/TLS Emulado)',
            status: '250 OK Message accepted'
        };

        const logs = [emailLog, ...emailLogs];
        updateEmailLogs(logs);
    };

    const enviarNotificacionWhatsApp = (pedido, customConfig = null) => {
        const activeCfg = customConfig || config;
        const { id_pedido, nombre_cliente, telefono_cliente, total, estado, tipo_entrega, nro_mesa } = pedido;
        let mensaje = '';
        let triggerEnvio = false;

        if (estado === 'Confirmado') {
            const entregaTexto = tipo_entrega === 'mesa' ? `en la Mesa ${nro_mesa}` : (tipo_entrega === 'envio' ? 'para Envío a domicilio' : 'para Retiro por local');
            mensaje = `¡Hola ${nombre_cliente}! Tu pedido #${id_pedido} ${entregaTexto} ha sido confirmado. Total: $${total.toLocaleString('es-AR')}.`;
            triggerEnvio = true;
        } else if (estado === 'En Camino') {
            mensaje = `¡Tu pedido #${id_pedido} ya está en camino! Gracias por elegirnos.`;
            triggerEnvio = true;
        } else if (estado === 'Listo para Entregar') {
            if (tipo_entrega === 'retiro') {
                mensaje = `¡Hola ${nombre_cliente}! Tu pedido #${id_pedido} ya está listo para retirar por nuestro local. ¡Te esperamos!`;
                triggerEnvio = true;
            } else if (tipo_entrega === 'mesa') {
                mensaje = `¡Tu pedido #${id_pedido} ya está listo y en marcha para la Mesa ${nro_mesa}!`;
                triggerEnvio = true;
            }
        }

        if (!triggerEnvio) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            pedidoId: id_pedido,
            cliente: nombre_cliente,
            telefono: telefono_cliente,
            estadoPedido: estado,
            mensaje: mensaje,
            endpoint: `https://graph.facebook.com/v18.0/${(activeCfg.whatsappPhone || '').replace(/[^0-9]/g, '')}/messages`,
            headers: {
                "Authorization": `Bearer ${(activeCfg.whatsappToken || 'token').substring(0, 10)}...[SECRET]`,
                "Content-Type": "application/json"
            },
            payload: {
                messaging_product: "whatsapp",
                to: telefono_cliente,
                type: "text",
                text: { body: mensaje }
            },
            status: "200 OK (Simulado)"
        };

        const logs = [logEntry, ...waLogs];
        updateWaLogs(logs);
    };

    // -- GESTIÓN DE PEDIDOS --
    const crearPedido = (datosPedido, targetResId = null) => {
        const resId = targetResId || currentResId;
        const resData = getRestaurantData(resId);
        const currentOrdersList = (resId === currentResId) ? orders : resData.orders;
        const currentTablesList = (resId === currentResId) ? tables : resData.tables;

        const isPaidInitially = datosPedido.cobrado !== undefined 
            ? datosPedido.cobrado 
            : (datosPedido.plataforma || datosPedido.metodo_pago === 'debito' || datosPedido.metodo_pago === 'credito' ? true : false);

        if (offlineMode && !datosPedido.bypassOffline) {
            const pedidoOffline = {
                id_pedido: 'PED-' + Math.floor(1000 + Math.random() * 9000),
                fecha_hora: new Date().toLocaleString('es-AR'),
                estado: 'Pendiente', 
                cobrado: isPaidInitially,
                restaurant_id: resId,
                ...datosPedido,
                esOffline: true
            };
            const queue = [...offlineQueue, pedidoOffline];
            updateOfflineQueue(queue);
            return pedidoOffline;
        }

        const nuevoPedido = {
            id_pedido: 'PED-' + Math.floor(1000 + Math.random() * 9000),
            fecha_hora: new Date().toLocaleString('es-AR'),
            estado: datosPedido.estado || 'Pendiente', 
            cobrado: isPaidInitially,
            restaurant_id: resId,
            ...datosPedido
        };
        
        const nextOrders = [...currentOrdersList, nuevoPedido];
        updateOrders(nextOrders, resId);
        
        if (nuevoPedido.cobrado) {
            let canal = 'directo';
            let descripcion = `Venta Directa - Pedido #${nuevoPedido.id_pedido}`;
            if (nuevoPedido.tipo_entrega === 'mesa') {
                canal = 'salon';
                descripcion = `Venta Mesa ${nuevoPedido.nro_mesa} - Pedido #${nuevoPedido.id_pedido}`;
            } else if (nuevoPedido.plataforma) {
                canal = 'plataformas';
                descripcion = `Venta ${nuevoPedido.plataforma.toUpperCase()} - Pedido #${nuevoPedido.id_pedido}`;
            }
            registrarTransaccionCaja('ingreso', descripcion, nuevoPedido.total, nuevoPedido.metodo_pago || 'Efectivo', canal, resId);
        }
        
        if (nuevoPedido.tipo_entrega === 'mesa') {
            const nroMesa = parseInt(nuevoPedido.nro_mesa);
            const nextTables = currentTablesList.map(m => {
                if (m.numero === nroMesa) {
                    return { ...m, estado: 'Ocupada', pedido_activo: nuevoPedido.id_pedido };
                }
                return m;
            });
            updateTables(nextTables, resId);
        }
        
        return nuevoPedido;
    };

    const crearPedidoDirectoMesa = (nroMesa, items, nombreCliente, targetResId = null) => {
        const subtotal = items.reduce((acc, curr) => acc + (curr.precio * curr.cantidad), 0);
        const pedido = {
            nombre_cliente: nombreCliente.trim() || `Mesa ${nroMesa}`,
            telefono_cliente: "+54 9 11 0000 0000",
            items: items,
            tipo_entrega: "mesa",
            direccion_entrega: `Consumo en Mesa ${nroMesa}`,
            subtotal: subtotal,
            costo_envio: 0,
            total: subtotal,
            metodo_pago: "efectivo",
            financiacion: null,
            fecha_hora_entrega: "Lo antes posible",
            nro_mesa: nroMesa,
            estado: "Confirmado"
        };
        return crearPedido(pedido, targetResId);
    };

    // -- CAJA Y CONTABILIDAD --
    const registrarTransaccionCaja = (tipo, descripcion, monto, metodoPago = 'Efectivo', canal = 'directo', targetResId = null) => {
        const resId = targetResId || currentResId;
        const currentCajaList = (resId === currentResId) ? caja : (JSON.parse(localStorage.getItem(getStoreKey(resId, 'caja'))) || []);
        const currentEstados = (resId === currentResId) ? cajaEstados : (JSON.parse(localStorage.getItem(getStoreKey(resId, 'caja_estados'))) || ESTADOS_CAJA_DEFECTO);
        const cajaCerrada = currentEstados[canal] === true;

        const nuevaTransaccion = {
            id: 'TX-' + Math.floor(10000 + Math.random() * 90000),
            tipo: tipo, 
            descripcion: descripcion,
            monto: parseFloat(monto) || 0,
            metodoPago: metodoPago,
            canal: canal, 
            estado_cierre: cajaCerrada ? 'cerrada_parcial' : 'abierta', 
            fecha_hora: new Date().toLocaleString('es-AR'),
            timestamp: new Date().toISOString()
        };

        const nextCaja = [nuevaTransaccion, ...currentCajaList];
        updateCaja(nextCaja, resId);
        return nuevaTransaccion;
    };

    const actualizarEstadoPedido = (idPedido, nuevoEstado) => {
        const index = orders.findIndex(p => p.id_pedido === idPedido);
        if (index === -1) return false;
        
        const previousState = orders[index].estado;
        const updatedOrders = orders.map((p, idx) => {
            if (idx === index) {
                const updated = { ...p, estado: nuevoEstado };
                if (nuevoEstado === 'Entregado' && previousState !== 'Entregado' && p.tipo_entrega !== 'mesa' && !p.cobrado) {
                    updated.cobrado = true;
                    let canal = 'directo';
                    let descripcion = `Venta Directa - Pedido #${p.id_pedido}`;
                    
                    if (p.plataforma) {
                        canal = 'plataformas';
                        descripcion = `Venta ${p.plataforma.toUpperCase()} - Pedido #${p.id_pedido}`;
                    }
                    
                    registrarTransaccionCaja('ingreso', descripcion, p.total, p.metodo_pago || 'Efectivo', canal);
                }
                return updated;
            }
            return p;
        });

        updateOrders(updatedOrders);
        enviarNotificacionWhatsApp(updatedOrders[index]);
        return true;
    };

    const actualizarItemsPedido = (idPedido, nuevosItems, nuevoTotal, nuevoSubtotal) => {
        const nextOrders = orders.map(p => {
            if (p.id_pedido === idPedido) {
                return { ...p, items: nuevosItems, total: nuevoTotal, subtotal: nuevoSubtotal };
            }
            return p;
        });
        updateOrders(nextOrders);
        return true;
    };

    const actualizarPedido = (idPedido, updatedFields) => {
        const index = orders.findIndex(p => p.id_pedido === idPedido);
        if (index === -1) return false;
        
        const oldPedido = orders[index];
        
        if (oldPedido.tipo_entrega === 'mesa' && (updatedFields.tipo_entrega !== 'mesa' || updatedFields.nro_mesa !== oldPedido.nro_mesa)) {
            const nroOld = parseInt(oldPedido.nro_mesa);
            const nextTables = tables.map(m => {
                if (m.numero === nroOld && m.pedido_activo === idPedido) {
                    return { ...m, estado: 'Libre', pedido_activo: null };
                }
                return m;
            });
            updateTables(nextTables);
        }
        
        if (updatedFields.tipo_entrega === 'mesa' && (oldPedido.tipo_entrega !== 'mesa' || updatedFields.nro_mesa !== oldPedido.nro_mesa)) {
            const nroNew = parseInt(updatedFields.nro_mesa);
            const nextTables = tables.map(m => {
                if (m.numero === nroNew) {
                    return { ...m, estado: 'Ocupada', pedido_activo: idPedido };
                }
                return m;
            });
            updateTables(nextTables);
        }

        const nextOrders = orders.map(p => {
            if (p.id_pedido === idPedido) {
                return { ...p, ...updatedFields };
            }
            return p;
        });
        
        updateOrders(nextOrders);
        return true;
    };

    const cobrarPedido = (idPedido, metodoPago) => {
        const index = orders.findIndex(p => p.id_pedido === idPedido);
        if (index === -1) return false;
        
        const pedido = orders[index];
        if (pedido.cobrado) return false;
        
        let canal = 'directo';
        let descripcion = `Cobro Pedido #${idPedido} (${pedido.nombre_cliente})`;
        
        if (pedido.tipo_entrega === 'mesa') {
            canal = 'salon';
            descripcion = `Cobro Mesa ${pedido.nro_mesa} - Pedido #${idPedido}`;
            
            const nroMesa = parseInt(pedido.nro_mesa);
            const nextTables = tables.map(m => {
                if (m.numero === nroMesa && m.pedido_activo === idPedido) {
                    return { ...m, estado: 'Libre', pedido_activo: null };
                }
                return m;
            });
            updateTables(nextTables);
        } else if (pedido.plataforma) {
            canal = 'plataformas';
            descripcion = `Cobro Venta ${pedido.plataforma.toUpperCase()} - Pedido #${idPedido}`;
        }
        
        registrarTransaccionCaja('ingreso', descripcion, pedido.total, metodoPago, canal);
        
        const nextOrders = orders.map(p => {
            if (p.id_pedido === idPedido) {
                return { 
                    ...p, 
                    cobrado: true, 
                    metodo_pago: metodoPago.toLowerCase(),
                    estado: (p.estado !== 'Entregado' && p.estado !== 'Anulado') ? 'Entregado' : p.estado
                };
            }
            return p;
        });
        updateOrders(nextOrders);
        return true;
    };

    const cobrarMesa = (nroMesa, metodoPago) => {
        const mIdx = tables.findIndex(m => m.numero === parseInt(nroMesa));
        if (mIdx === -1) return false;
        const idPedido = tables[mIdx].pedido_activo;
        if (!idPedido) return false;
        return cobrarPedido(idPedido, metodoPago);
    };

    const anularPedido = (idPedido) => {
        const idx = orders.findIndex(p => p.id_pedido === idPedido);
        if (idx === -1) return false;
        
        const pedido = orders[idx];
        const eraCobrado = pedido.cobrado;
        
        if (pedido.tipo_entrega === 'mesa') {
            const nroMesa = parseInt(pedido.nro_mesa);
            const nextTables = tables.map(m => {
                if (m.numero === nroMesa && m.pedido_activo === idPedido) {
                    return { ...m, estado: 'Libre', pedido_activo: null };
                }
                return m;
            });
            updateTables(nextTables);
        }
        
        if (eraCobrado) {
            let canal = 'directo';
            if (pedido.tipo_entrega === 'mesa') canal = 'salon';
            else if (pedido.plataforma) canal = 'plataformas';
            
            registrarTransaccionCaja(
                'egreso',
                `Anulación de Pedido #${idPedido} - Devolución`,
                pedido.total,
                pedido.metodo_pago || 'Efectivo',
                canal
            );
        }
        
        const nextOrders = orders.map(p => {
            if (p.id_pedido === idPedido) {
                return { ...p, estado: 'Anulado', cobrado: false };
            }
            return p;
        });
        updateOrders(nextOrders);
        return true;
    };

    const cerrarCajaParcial = (canal, targetResId = null) => {
        const resId = targetResId || currentResId;
        const currentEstados = (resId === currentResId) ? cajaEstados : (JSON.parse(localStorage.getItem(getStoreKey(resId, 'caja_estados'))) || ESTADOS_CAJA_DEFECTO);
        const nextEstados = { ...currentEstados, [canal]: true };
        updateCajaEstados(nextEstados, resId);
        return true;
    };

    const abrirCajaParcial = (canal, targetResId = null) => {
        const resId = targetResId || currentResId;
        const currentEstados = (resId === currentResId) ? cajaEstados : (JSON.parse(localStorage.getItem(getStoreKey(resId, 'caja_estados'))) || ESTADOS_CAJA_DEFECTO);
        const nextEstados = { ...currentEstados, [canal]: false };
        updateCajaEstados(nextEstados, resId);
        return true;
    };

    const cerrarJornadaCompleta = (targetResId = null) => {
        const resId = targetResId || currentResId;
        const currentCaja = (resId === currentResId) ? caja : (JSON.parse(localStorage.getItem(getStoreKey(resId, 'caja'))) || []);
        const currentCierresList = (resId === currentResId) ? cierres : (JSON.parse(localStorage.getItem(getStoreKey(resId, 'cierres'))) || []);

        let totalSalon = 0;
        let totalDirecto = 0;

        currentCaja.forEach(tx => {
            const factor = tx.tipo === 'ingreso' ? 1 : -1;
            const monto = tx.monto * factor;
            
            if (tx.canal === 'salon') {
                totalSalon += monto;
            } else {
                totalDirecto += monto;
            }
        });

        const totalGeneral = totalSalon + totalDirecto;
        const fecha = new Date().toLocaleDateString('es-AR');
        const hora = new Date().toLocaleTimeString('es-AR');
        
        const nuevoCierre = {
            id_cierre: 'CIE-' + Math.floor(1000 + Math.random() * 9000),
            fecha: fecha,
            hora: hora,
            total_salon: totalSalon,
            total_directo: totalDirecto,
            total_general: totalGeneral
        };

        // Guardar transacciones en el histórico persistente del tenant
        const histKey = getStoreKey(resId, 'caja_historico');
        const historicoTx = JSON.parse(localStorage.getItem(histKey)) || [];
        const cajaConIdCierre = currentCaja.map(tx => ({ ...tx, id_cierre: nuevoCierre.id_cierre }));
        localStorage.setItem(histKey, JSON.stringify(historicoTx.concat(cajaConIdCierre)));

        const historico = [nuevoCierre, ...currentCierresList];
        updateCierres(historico, resId);

        // Limpiar el estado de la caja y mesas activas para este restaurante
        updateCaja([], resId);
        updateOrders([], resId);
        updateCajaEstados(ESTADOS_CAJA_DEFECTO, resId);
        const mesasReseteadas = MESAS_INICIALES.map(m => ({ ...m }));
        updateTables(mesasReseteadas, resId);

        localStorage.removeItem('comandas_active_mesa');

        return nuevoCierre;
    };

    // -- CRUD PLATOS --
    const agregarPlatoAlMenu = (plato) => {
        const nuevoId = menu.length > 0 ? Math.max(...menu.map(p => p.id)) + 1 : 1;
        const nuevoPlato = {
            id: nuevoId,
            disponible: true,
            imagen: plato.imagen || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
            ...plato
        };
        const nextMenu = [...menu, nuevoPlato];
        updateMenu(nextMenu);
        return nuevoPlato;
    };

    const editarPlatoDelMenu = (platoActualizado) => {
        const nextMenu = menu.map(p => {
            if (p.id === parseInt(platoActualizado.id)) {
                return { ...p, ...platoActualizado };
            }
            return p;
        });
        updateMenu(nextMenu);
        return true;
    };

    const eliminarPlatoDelMenu = (idPlato) => {
        const nextMenu = menu.filter(p => p.id !== parseInt(idPlato));
        updateMenu(nextMenu);
        return true;
    };

    // -- OPERACIONES SAAS --
    const registrarLocalSaaS = (datosLocal) => {
        const slug = (datosLocal.nombre || 'rest')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 10);
        const nuevoId = slug || ('rest-' + Math.floor(1000 + Math.random() * 9000));
        const esPendiente = datosLocal.metodo_pago_registro === 'Transferencia' || datosLocal.metodo_pago_registro === 'CBU';
        
        const nuevoLocal = {
            id: nuevoId,
            nombre: datosLocal.nombre,
            whatsapp: datosLocal.whatsapp,
            cuit: datosLocal.cuit || '30-' + Math.floor(10000000 + Math.random() * 90000000) + '-9',
            alias_cbu: datosLocal.alias_cbu || `${nuevoId}.mp`,
            logo: datosLocal.logo || '🍕',
            estado: esPendiente ? 'Pendiente' : 'Activo',
            plan: datosLocal.plan || 'Premium',
            onboarding_complete: false,
            email: datosLocal.email || `${nuevoId}@comercio.com`,
            password: ofuscarDatoSensible(datosLocal.password || '123456'),
            metodo_pago_registro: datosLocal.metodo_pago_registro || 'MercadoPago',
            comprobante_registro: datosLocal.comprobante_registro || '',
            cbu_cliente: ofuscarDatoSensible(datosLocal.cbu_cliente || ''),
            fecha_registro: new Date().toLocaleDateString('es-AR'),
            referral_code: 'CF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            referral_claimed: false,
            referral_claimed_by: null,
            descuento_activo: false,
            descuento_meses_restantes: 0,
            descuento_porcentaje: 30
        };

        // Inicializar datos limpios e independientes para este nuevo local
        const initialMenu = getInitialCatalogForRestaurant(nuevoLocal.id);
        const initialConf = getInitialConfigForRestaurant(nuevoLocal);
        
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'menu'), JSON.stringify(initialMenu));
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'config'), JSON.stringify(initialConf));
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'orders'), JSON.stringify([]));
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'tables'), JSON.stringify(MESAS_INICIALES));
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'caja'), JSON.stringify([]));
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'caja_estados'), JSON.stringify(ESTADOS_CAJA_DEFECTO));
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'cierres'), JSON.stringify([]));
        localStorage.setItem(getStoreKey(nuevoLocal.id, 'wa_logs'), JSON.stringify([]));

        const nextRestaurants = [...restaurants, nuevoLocal];
        updateRestaurants(nextRestaurants);
        updateActiveRestaurant(nuevoLocal);

        if (nuevoLocal.estado === 'Activo') {
            simularEnvioEmail(
                nuevoLocal.email,
                "¡Bienvenido a ComandaFlow! - Licencia Activa 🎉",
                `Hola ${nuevoLocal.nombre}.\n\nTu suscripción al Plan ${nuevoLocal.plan} ha sido activada correctamente bajo la modalidad de Débito Automático con Tarjeta (Mercado Pago).\nYa podés acceder a tu panel de control y configurar tu carta digital QR.\n\nAtentamente,\nEl equipo de ComandaFlow.`
            );
        } else {
            simularEnvioEmail(
                nuevoLocal.email,
                "Registro en Proceso - Adhesión a Débito Directo CBU ⏳",
                `Hola ${nuevoLocal.nombre}.\n\nHemos recibido tu solicitud de adhesión al Débito Directo para la cuenta CBU/CVU: ${desofuscarDatoSensible(nuevoLocal.cbu_cliente)}.\nLa habilitación de tu licencia del Plan ${nuevoLocal.plan} se completará una vez auditada la cuenta bancaria clearing en el BBVA.\n\nAtentamente,\nEl equipo de ComandaFlow.`
            );
        }

        return nuevoLocal;
    };

    const actualizarEstadoLocalSaaS = (idLocal, estado) => {
        const nextRestaurants = restaurants.map(l => {
            if (l.id === idLocal) {
                return { ...l, estado };
            }
            return l;
        });
        updateRestaurants(nextRestaurants);

        if (activeRestaurant && activeRestaurant.id === idLocal) {
            const nextActive = { ...activeRestaurant, estado };
            localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(nextActive));
            setActiveRestaurant(nextActive);
        }
        return true;
    };

    const validarYCanjearCodigoReferido = (idLocalRecommender, codigo) => {
        if (!codigo) {
            return { exito: false, mensaje: "Debe ingresar un código de activación." };
        }
        
        const codigoLimpio = codigo.trim().toUpperCase();
        const localRecomendado = restaurants.find(l => l.referral_code === codigoLimpio);
        
        if (!localRecomendado) {
            return { exito: false, mensaje: "Código de referido inválido." };
        }
        
        if (localRecomendado.id === idLocalRecommender) {
            return { exito: false, mensaje: "No puedes ingresar tu propio código." };
        }
        
        if (localRecomendado.estado !== 'Activo') {
            return { exito: false, mensaje: "El comercio recomendado aún no está activo." };
        }
        
        if (localRecomendado.referral_claimed) {
            return { exito: false, mensaje: "Este código ya ha sido canjeado." };
        }
        
        const nextRestaurants = restaurants.map(l => {
            if (l.id === localRecomendado.id) {
                return { ...l, referral_claimed: true, referral_claimed_by: idLocalRecommender };
            }
            if (l.id === idLocalRecommender) {
                return { ...l, descuento_activo: true, descuento_meses_restantes: 2, descuento_porcentaje: 30 };
            }
            return l;
        });

        updateRestaurants(nextRestaurants);

        if (activeRestaurant && activeRestaurant.id === idLocalRecommender) {
            const nextActive = { ...activeRestaurant, descuento_activo: true, descuento_meses_restantes: 2, descuento_porcentaje: 30 };
            localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(nextActive));
            setActiveRestaurant(nextActive);
        }
        
        const recommender = restaurants.find(l => l.id === idLocalRecommender);
        return { 
            exito: true, 
            mensaje: `¡Código validado! Se aplicó un 30% de descuento por 2 meses en el abono de "${recommender.nombre}".` 
        };
    };

    const obtenerAbonoMensual = (local) => {
        const precioBase = local.plan === 'Premium' ? 30000 : 15000;
        if (local.descuento_activo && local.descuento_meses_restantes > 0) {
            const descuento = (precioBase * (local.descuento_porcentaje || 30)) / 100;
            return precioBase - descuento;
        }
        return precioBase;
    };

    const actualizarConfiguracionOnboarding = (idLocal, datosConfig) => {
        const nextRestaurants = restaurants.map(l => {
            if (l.id === idLocal) {
                return { ...l, alias_cbu: datosConfig.alias_cbu, logo: datosConfig.logo || l.logo, onboarding_complete: true };
            }
            return l;
        });
        updateRestaurants(nextRestaurants);

        if (activeRestaurant && activeRestaurant.id === idLocal) {
            const nextActive = { ...activeRestaurant, alias_cbu: datosConfig.alias_cbu, logo: datosConfig.logo || activeRestaurant.logo, onboarding_complete: true };
            updateActiveRestaurant(nextActive);
        }
        return true;
    };

    // -- SERVICIO DE SEGURIDAD SIMULADO (JWT & AUTH0) --
    const simularBase64URLEncode = (str) => {
        try {
            return btoa(unescape(encodeURIComponent(str)))
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
        } catch (e) {
            return "";
        }
    };

    const simularBase64URLDecode = (str) => {
        try {
            let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            return decodeURIComponent(escape(atob(base64)));
        } catch (e) {
            return "{}";
        }
    };

    const generarJWT = (payload) => {
        const header = { alg: "HS256", typ: "JWT" };
        const headerString = simularBase64URLEncode(JSON.stringify(header));
        const payloadString = simularBase64URLEncode(JSON.stringify({
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor((Date.now() + 3600000) / 1000)
        }));
        
        const rawSignature = headerString + "." + payloadString + "." + JWT_SECRET_KEY;
        let hash = 0;
        for (let i = 0; i < rawSignature.length; i++) {
            const char = rawSignature.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const signatureString = simularBase64URLEncode("hash_" + Math.abs(hash));
        return headerString + "." + payloadString + "." + signatureString;
    };

    const verificarYDecodificarJWT = (token) => {
        if (!token) throw new Error("Token no provisto");
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error("Estructura de token inválida");
        
        const [headerStr, payloadStr, signatureStr] = parts;
        const rawSignature = headerStr + "." + payloadStr + "." + JWT_SECRET_KEY;
        
        let hash = 0;
        for (let i = 0; i < rawSignature.length; i++) {
            const char = rawSignature.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const expectedSignature = simularBase64URLEncode("hash_" + Math.abs(hash));
        if (signatureStr !== expectedSignature) {
            throw new Error("Firma de token inválida. Token alterado o manipulado.");
        }
        
        const payload = JSON.parse(simularBase64URLDecode(payloadStr));
        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (payload.exp && nowInSeconds > payload.exp) {
            throw new Error("Token expirado");
        }
        
        return payload;
    };

    const loginWithAuth0 = (email, role, name, sub) => {
        const token = generarJWT({ email, role, name, sub });
        sessionStorage.setItem('comandaflow_jwt_token', token);
        setCurrentUser({ email, role, name, sub, exp: Math.floor((Date.now() + 3600000) / 1000) });
        return token;
    };

    const logoutAuth0 = () => {
        sessionStorage.removeItem('comandaflow_jwt_token');
        setCurrentUser(null);
    };

    // Autenticación multi-usuario de restaurantes y SuperAdmin
    const loginUser = (email, password) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        
        // SuperAdmin check
        if (cleanEmail === 'superadmin@comandaflow.com' && password === 'admin123') {
            const token = loginWithAuth0('superadmin@comandaflow.com', 'superadmin', 'SuperAdmin Master', 'superadmin');
            return { ok: true, role: 'superadmin', restaurant: activeRestaurant, token };
        }

        const found = restaurants.find(r => r.email && r.email.toLowerCase() === cleanEmail);
        
        if (!found) {
            return { ok: false, error: "No existe ninguna cuenta registrada con este correo electrónico." };
        }

        const passDesofuscada = desofuscarDatoSensible(found.password) || found.password;
        if (passDesofuscada !== password && found.password !== password) {
            return { ok: false, error: "Contraseña incorrecta. Podés restablecerla con 'Olvidé mi contraseña'." };
        }

        // Si la contraseña es correcta, activar restaurante y sesión JWT con su propio ID
        switchRestaurant(found.id);
        const token = loginWithAuth0(found.email, 'merchant', found.nombre, found.id);
        return { ok: true, restaurant: found, role: 'merchant', token };
    };

    // Solicitar código de recuperación de contraseña
    const solicitarRecuperacionContrasena = (email) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const found = restaurants.find(r => r.email && r.email.toLowerCase() === cleanEmail);
        
        if (!found) {
            return { ok: false, error: `No encontramos ninguna cuenta registrada con el correo ${cleanEmail}` };
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const payloadRecovery = {
            email: cleanEmail,
            codigo: codigo,
            restaurantId: found.id,
            timestamp: Date.now(),
            exp: Date.now() + 15 * 60 * 1000 // 15 minutos de validez
        };

        const resetsRaw = localStorage.getItem('comandas_pwd_resets');
        const resets = resetsRaw ? JSON.parse(resetsRaw) : {};
        resets[cleanEmail] = payloadRecovery;
        localStorage.setItem('comandas_pwd_resets', JSON.stringify(resets));

        // Registrar envío de email en historial interno
        simularEnvioEmail(
            cleanEmail,
            `🔐 Código de Recuperación de Clave - ComandaFlow (${found.nombre})`,
            `Hola ${found.nombre},\n\nHemos recibido una solicitud para restablecer la contraseña de acceso a tu panel de ComandaFlow.\n\nTu CÓDIGO DE VERIFICACIÓN es: ${codigo}\n\nIngresá este código en la pantalla de recuperación para definir tu nueva contraseña. Este código vence en 15 minutos.\n\nSi no realizaste esta solicitud, podés desestimar este mensaje.`
        );

        // Envío real a la casilla de correo
        try {
            fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `🔐 Tu código de recuperación ComandaFlow: ${codigo}`,
                    email: cleanEmail,
                    comercio: found.nombre,
                    codigo_seguridad: codigo,
                    mensaje: `Hola ${found.nombre}. Tu código de seguridad de 6 dígitos para restablecer tu contraseña en ComandaFlow es: ${codigo}. Ingresalo en la pantalla de recuperación para definir tu nueva contraseña.`
                })
            }).catch(err => console.log('Envío de email externo:', err));
        } catch(e) {}

        return { 
            ok: true, 
            codigo, 
            email: found.email, 
            nombre: found.nombre, 
            mensaje: `Se envió el código de 6 dígitos al correo ${cleanEmail}.` 
        };
    };

    // Reestablecer contraseña con código
    const reestablecerContrasenaConCodigo = (email, codigoIngresado, nuevaPassword) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const resetsRaw = localStorage.getItem('comandas_pwd_resets');
        const resets = resetsRaw ? JSON.parse(resetsRaw) : {};
        const recoveryData = resets[cleanEmail];

        if (!recoveryData) {
            return { ok: false, error: "No hay ninguna solicitud de recuperación activa para este email." };
        }

        if (Date.now() > recoveryData.exp) {
            return { ok: false, error: "El código de seguridad ha expirado. Solicitá uno nuevo." };
        }

        if (recoveryData.codigo !== (codigoIngresado || '').trim()) {
            return { ok: false, error: "El código ingresado es incorrecto. Verificá los 6 dígitos." };
        }

        if (!nuevaPassword || nuevaPassword.length < 4) {
            return { ok: false, error: "La nueva contraseña debe tener al menos 4 caracteres." };
        }

        // Actualizar en base de datos de restaurantes
        const nextRestaurants = restaurants.map(r => {
            if (r.email && r.email.toLowerCase() === cleanEmail) {
                return { ...r, password: ofuscarDatoSensible(nuevaPassword) };
            }
            return r;
        });

        updateRestaurants(nextRestaurants);
        delete resets[cleanEmail];
        localStorage.setItem('comandas_pwd_resets', JSON.stringify(resets));

        // Enviar email de confirmación
        simularEnvioEmail(
            cleanEmail,
            `✅ Tu contraseña ha sido actualizada - ComandaFlow`,
            `Hola, tu contraseña de acceso a ComandaFlow ha sido actualizada con éxito. Ya podés iniciar sesión con tus nuevas credenciales.`
        );

        return { ok: true, mensaje: "¡Contraseña actualizada exitosamente! Ya podés iniciar sesión." };
    };

    // Validar IDOR / Tenant Mismatch
    const validarAislamientoTenant = () => {
        if (currentUser && currentUser.role === 'merchant') {
            if (activeRestaurant && activeRestaurant.id !== currentUser.sub) {
                console.warn("⚠️ ALERTA DE SEGURIDAD: Tenant Mismatch. Bloqueando sesión.");
                logoutAuth0();
                alert("Acceso denegado: Inconsistencia de seguridad detectada (Tenant Mismatch).");
                return false;
            }
        }
        return true;
    };

    return (
        <DbContext.Provider value={{
            menu,
            config,
            orders,
            waLogs,
            tables,
            caja,
            cajaEstados,
            cierres,
            restaurants,
            activeRestaurant,
            offlineMode,
            offlineQueue,
            emailLogs,
            currentUser,
            saasConfig,
            
            updateMenu,
            updateConfig,
            updateOrders,
            updateWaLogs,
            updateTables,
            updateCaja,
            updateCajaEstados,
            updateCierres,
            updateRestaurants,
            updateActiveRestaurant,
            switchRestaurant,
            getRestaurantData,
            setOfflineMode,
            updateOfflineQueue,
            updateEmailLogs,
            updateSaasConfig,
            resetearDemo,
            
            calcularCostosPedido,
            calcularCuotas,
            simularEnvioEmail,
            enviarNotificacionWhatsApp,
            
            crearPedido,
            crearPedidoDirectoMesa,
            registrarTransaccionCaja,
            actualizarEstadoPedido,
            actualizarItemsPedido,
            actualizarPedido,
            cobrarPedido,
            cobrarMesa,
            anularPedido,
            cerrarCajaParcial,
            abrirCajaParcial,
            cerrarJornadaCompleta,
            
            agregarPlatoAlMenu,
            editarPlatoDelMenu,
            eliminarPlatoDelMenu,
            
            registrarLocalSaaS,
            actualizarEstadoLocalSaaS,
            validarYCanjearCodigoReferido,
            obtenerAbonoMensual,
            actualizarConfiguracionOnboarding,
            
            loginUser,
            solicitarRecuperacionContrasena,
            reestablecerContrasenaConCodigo,
            loginWithAuth0,
            logoutAuth0,
            validarAislamientoTenant,
            generarJWT
        }}>
            {children}
        </DbContext.Provider>
    );
}

export function useDb() {
    const context = useContext(DbContext);
    if (!context) {
        throw new Error('useDb debe ser usado dentro de un DbProvider');
    }
    return context;
}
