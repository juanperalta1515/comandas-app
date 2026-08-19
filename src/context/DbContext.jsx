import React, { createContext, useContext, useState, useEffect } from 'react';

const DbContext = createContext();

// Claves secretas de seguridad y cifrado
const SAAS_SECRET_SALT = "ComandaFlowSecureSalt102!";
const JWT_SECRET_KEY = "comandaflow_secret_hash_2026";

// Claves de localStorage
const KEY_MENU = 'comandas_menu';
const KEY_ORDERS = 'comandas_orders';
const KEY_CONFIG = 'comandas_config';
const KEY_WA_LOGS = 'comandas_wa_logs';
const KEY_TABLES = 'comandas_tables';
const KEY_CAJA = 'comandas_caja';
const KEY_CIERRES = 'comandas_cierres_historico';
const KEY_CAJA_ESTADOS = 'comandas_caja_estados';
const KEY_RESTAURANTS = 'comandas_saas_restaurants';
const KEY_ACTIVE_RESTAURANT = 'comandas_saas_active_restaurant';
const KEY_OFFLINE_SIMULATED = 'comandas_offline_simulated';
const KEY_OFFLINE_QUEUE = 'comandas_offline_queue';
const KEY_EMAIL_LOGS = 'comandas_email_logs';
const KEY_CAJA_HISTORICO = 'comandas_caja_historico';

// Catálogo inicial de platos
const PLATOS_INICIALES = [
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
        nombre: 'Empanada de Jamón y Queso Hojaldrada', 
        descripcion: 'Jamón cocido de primera calidad y queso muzzarela derretido.', 
        precio: 900, 
        categoria: 'Entrada', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1628191139360-408a06492299?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 5, 
        nombre: 'Milanesa de Ternera Napolitana con Papas Fritas', 
        descripcion: 'Milanesa gigante, salsa de tomate de la casa, jamón, muzzarela y papas fritas bastón.', 
        precio: 7800, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 6, 
        nombre: 'Flan Casero con Dulce de Leche y Crema', 
        descripcion: 'El clásico postre argentino hecho con 8 yemas, acompañado de dulce de leche colonial.', 
        precio: 2200, 
        categoria: 'Postre', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 7, 
        nombre: 'Panqueque con Dulce de Leche Quemado', 
        descripcion: 'Dos panqueques rellenos de abundante dulce de leche, espolvoreados con azúcar y quemados al hierro.', 
        precio: 2100, 
        categoria: 'Postre', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 8, 
        nombre: 'Cerveza Quilmes Clásica 1 Litro', 
        descripcion: 'Cerveza lager argentina helada, ideal para compartir.', 
        precio: 2500, 
        categoria: 'Bebida', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1608270176054-8a3a38d1723a?auto=format&fit=crop&w=400&q=80'
    },
    { 
        id: 9, 
        nombre: 'Gaseosa Paso de los Toros Pomelo 1.5L', 
        descripcion: 'Bebida gasificada con sabor amargo y refrescante de pomelo.', 
        precio: 1800, 
        categoria: 'Bebida', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80'
    }
];

const CONFIG_DEFECTO = {
    montoEnvioGratis: 8000, 
    costoEnvio: 800,       
    interesCredito: 10,     
    restauranteNombre: "El Quincho Porteño",
    whatsappPhone: "+5491132456789",
    whatsappToken: "EAAG_simulado_token_antigravity_123456"
};

const MESAS_INICIALES = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    estado: 'Libre', 
    pedido_activo: null 
}));

const ESTADOS_CAJA_DEFECTO = {
    salon: false,
    plataformas: false,
    directo: false
};

const LOCAL_DEFECTO_SAAS = {
    id: 'quincho',
    nombre: 'El Quincho Porteño',
    whatsapp: '+5491132456789',
    alias_cbu: 'quincho.mp',
    logo: '🍔',
    estado: 'Activo',
    plan: 'Premium',
    onboarding_complete: true,
    email: 'contacto@quincho.com',
    password: 'quincho123',
    metodo_pago_registro: 'MercadoPago',
    comprobante_registro: '',
    fecha_registro: new Date().toLocaleDateString('es-AR'),
    referral_code: 'CF-QUINCHO',
    referral_claimed: false,
    referral_claimed_by: null,
    descuento_activo: false,
    descuento_meses_restantes: 0,
    descuento_porcentaje: 30
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

export function DbProvider({ children }) {
    // Inicializar estados cargándolos del localStorage
    const [menu, setMenu] = useState(() => {
        const data = localStorage.getItem(KEY_MENU);
        if (!data) {
            localStorage.setItem(KEY_MENU, JSON.stringify(PLATOS_INICIALES));
            return PLATOS_INICIALES;
        }
        return JSON.parse(data);
    });

    const [config, setConfig] = useState(() => {
        const data = localStorage.getItem(KEY_CONFIG);
        if (!data) {
            localStorage.setItem(KEY_CONFIG, JSON.stringify(CONFIG_DEFECTO));
            return CONFIG_DEFECTO;
        }
        return JSON.parse(data);
    });

    const [orders, setOrders] = useState(() => {
        const data = localStorage.getItem(KEY_ORDERS);
        if (!data) {
            localStorage.setItem(KEY_ORDERS, JSON.stringify([]));
            return [];
        }
        return JSON.parse(data);
    });

    const [waLogs, setWaLogs] = useState(() => {
        const data = localStorage.getItem(KEY_WA_LOGS);
        if (!data) {
            localStorage.setItem(KEY_WA_LOGS, JSON.stringify([]));
            return [];
        }
        return JSON.parse(data);
    });

    const [tables, setTables] = useState(() => {
        const data = localStorage.getItem(KEY_TABLES);
        if (!data) {
            localStorage.setItem(KEY_TABLES, JSON.stringify(MESAS_INICIALES));
            return MESAS_INICIALES;
        }
        return JSON.parse(data);
    });

    const [caja, setCaja] = useState(() => {
        const data = localStorage.getItem(KEY_CAJA);
        if (!data) {
            localStorage.setItem(KEY_CAJA, JSON.stringify([]));
            return [];
        }
        return JSON.parse(data);
    });

    const [cajaEstados, setCajaEstados] = useState(() => {
        const data = localStorage.getItem(KEY_CAJA_ESTADOS);
        if (!data) {
            localStorage.setItem(KEY_CAJA_ESTADOS, JSON.stringify(ESTADOS_CAJA_DEFECTO));
            return ESTADOS_CAJA_DEFECTO;
        }
        return JSON.parse(data);
    });

    const [cierres, setCierres] = useState(() => {
        const data = localStorage.getItem(KEY_CIERRES);
        if (!data) {
            localStorage.setItem(KEY_CIERRES, JSON.stringify([]));
            return [];
        }
        return JSON.parse(data);
    });

    const [restaurants, setRestaurants] = useState(() => {
        const data = localStorage.getItem(KEY_RESTAURANTS);
        if (!data) {
            const localDefault = { ...LOCAL_DEFECTO_SAAS };
            localDefault.password = ofuscarDatoSensible(localDefault.password);
            localStorage.setItem(KEY_RESTAURANTS, JSON.stringify([localDefault]));
            return [localDefault];
        }
        return JSON.parse(data);
    });

    const [activeRestaurant, setActiveRestaurant] = useState(() => {
        const data = localStorage.getItem(KEY_ACTIVE_RESTAURANT);
        if (!data) {
            const localDefault = { ...LOCAL_DEFECTO_SAAS };
            localDefault.password = ofuscarDatoSensible(localDefault.password);
            localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(localDefault));
            return localDefault;
        }
        return JSON.parse(data);
    });

    const [offlineMode, setOfflineModeState] = useState(() => {
        return localStorage.getItem(KEY_OFFLINE_SIMULATED) === 'true';
    });

    const [offlineQueue, setOfflineQueue] = useState(() => {
        const data = localStorage.getItem(KEY_OFFLINE_QUEUE);
        return data ? JSON.parse(data) : [];
    });

    const [emailLogs, setEmailLogs] = useState(() => {
        const data = localStorage.getItem(KEY_EMAIL_LOGS);
        return data ? JSON.parse(data) : [];
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

    // Sincronizar cambios en tiempo real entre pestañas
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (!e.newValue) return;
            const parsed = JSON.parse(e.newValue);
            switch (e.key) {
                case KEY_MENU:
                    setMenu(parsed);
                    break;
                case KEY_CONFIG:
                    setConfig(parsed);
                    break;
                case KEY_ORDERS:
                    setOrders(parsed);
                    break;
                case KEY_WA_LOGS:
                    setWaLogs(parsed);
                    break;
                case KEY_TABLES:
                    setTables(parsed);
                    break;
                case KEY_CAJA:
                    setCaja(parsed);
                    break;
                case KEY_CAJA_ESTADOS:
                    setCajaEstados(parsed);
                    break;
                case KEY_CIERRES:
                    setCierres(parsed);
                    break;
                case KEY_RESTAURANTS:
                    setRestaurants(parsed);
                    break;
                case KEY_ACTIVE_RESTAURANT:
                    setActiveRestaurant(parsed);
                    break;
                case KEY_OFFLINE_SIMULATED:
                    setOfflineModeState(e.newValue === 'true');
                    break;
                case KEY_OFFLINE_QUEUE:
                    setOfflineQueue(parsed);
                    break;
                case KEY_EMAIL_LOGS:
                    setEmailLogs(parsed);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [config, offlineQueue, emailLogs, restaurants, activeRestaurant, tables, orders, menu, waLogs, caja, cajaEstados, cierres]);

    // Funciones mutadoras con actualización en localStorage y State

    const updateMenu = (newMenu) => {
        localStorage.setItem(KEY_MENU, JSON.stringify(newMenu));
        setMenu(newMenu);
    };

    const updateConfig = (newConfig) => {
        localStorage.setItem(KEY_CONFIG, JSON.stringify(newConfig));
        setConfig(newConfig);
    };

    const updateOrders = (newOrders) => {
        localStorage.setItem(KEY_ORDERS, JSON.stringify(newOrders));
        setOrders(newOrders);
    };

    const updateWaLogs = (newWaLogs) => {
        localStorage.setItem(KEY_WA_LOGS, JSON.stringify(newWaLogs));
        setWaLogs(newWaLogs);
    };

    const updateTables = (newTables) => {
        localStorage.setItem(KEY_TABLES, JSON.stringify(newTables));
        setTables(newTables);
    };

    const updateCaja = (newCaja) => {
        localStorage.setItem(KEY_CAJA, JSON.stringify(newCaja));
        setCaja(newCaja);
    };

    const updateCajaEstados = (newEstados) => {
        localStorage.setItem(KEY_CAJA_ESTADOS, JSON.stringify(newEstados));
        setCajaEstados(newEstados);
    };

    const updateCierres = (newCierres) => {
        localStorage.setItem(KEY_CIERRES, JSON.stringify(newCierres));
        setCierres(newCierres);
    };

    const updateRestaurants = (newRestaurants) => {
        localStorage.setItem(KEY_RESTAURANTS, JSON.stringify(newRestaurants));
        setRestaurants(newRestaurants);
    };

    const updateActiveRestaurant = (newActive) => {
        localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(newActive));
        setActiveRestaurant(newActive);

        // Si cambiamos de restaurante activo, sincronizamos también la configuración básica del negocio
        if (newActive) {
            const nextConfig = {
                ...config,
                restauranteNombre: newActive.nombre,
                whatsappPhone: newActive.whatsapp
            };
            updateConfig(nextConfig);
        }
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

    // -- LÓGICA DE PRECIOS Y COSTOS --
    const calcularCostosPedido = (subtotal, tipoEntrega) => {
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

        const gratis = sub >= config.montoEnvioGratis;
        const costo = gratis ? 0 : config.costoEnvio;
        const falta = gratis ? 0 : (config.montoEnvioGratis - sub);

        return {
            subtotal: sub,
            costoEnvio: costo,
            total: sub + costo,
            envioGratis: gratis,
            faltaParaGratis: falta
        };
    };

    const calcularCuotas = (monto, cuotasSeleccionadas) => {
        const interesMensual = config.interesCredito / 100;
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

    const enviarNotificacionWhatsApp = (pedido) => {
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
            endpoint: `https://graph.facebook.com/v18.0/${config.whatsappPhone.replace(/[^0-9]/g, '')}/messages`,
            headers: {
                "Authorization": `Bearer ${config.whatsappToken.substring(0, 10)}...[SECRET]`,
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
    const crearPedido = (datosPedido) => {
        if (offlineMode && !datosPedido.bypassOffline) {
            const pedidoOffline = {
                id_pedido: 'PED-' + Math.floor(1000 + Math.random() * 9000),
                fecha_hora: new Date().toLocaleString('es-AR'),
                estado: 'Pendiente', 
                cobrado: datosPedido.cobrado !== undefined ? datosPedido.cobrado : (datosPedido.plataforma ? true : false),
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
            cobrado: datosPedido.cobrado !== undefined ? datosPedido.cobrado : (datosPedido.plataforma ? true : false),
            ...datosPedido
        };
        
        const nextOrders = [...orders, nuevoPedido];
        updateOrders(nextOrders);
        
        if (nuevoPedido.tipo_entrega === 'mesa') {
            const nroMesa = parseInt(nuevoPedido.nro_mesa);
            const nextTables = tables.map(m => {
                if (m.numero === nroMesa) {
                    return { ...m, estado: 'Ocupada', pedido_activo: nuevoPedido.id_pedido };
                }
                return m;
            });
            updateTables(nextTables);
        }
        
        return nuevoPedido;
    };

    const crearPedidoDirectoMesa = (nroMesa, items, nombreCliente) => {
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
        return crearPedido(pedido);
    };

    // -- CAJA Y CONTABILIDAD --
    const registrarTransaccionCaja = (tipo, descripcion, monto, metodoPago = 'Efectivo', canal = 'directo') => {
        const cajaCerrada = cajaEstados[canal] === true;

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

        const nextCaja = [nuevaTransaccion, ...caja];
        updateCaja(nextCaja);
        return nuevaTransaccion;
    };

    const actualizarEstadoPedido = (idPedido, nuevoEstado) => {
        const index = orders.findIndex(p => p.id_pedido === idPedido);
        if (index === -1) return false;
        
        const previousState = orders[index].estado;
        const updatedOrders = orders.map((p, idx) => {
            if (idx === index) {
                const updated = { ...p, estado: nuevoEstado };
                // Cobrar al marcar como entregado si no estaba cobrado y no es salón
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
            
            // Liberar mesa
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

    const cerrarCajaParcial = (canal) => {
        const nextEstados = { ...cajaEstados, [canal]: true };
        updateCajaEstados(nextEstados);
        return true;
    };

    const cerrarJornadaCompleta = () => {
        let totalSalon = 0;
        let totalPlataformas = 0;
        let totalDirecto = 0;

        caja.forEach(tx => {
            const factor = tx.tipo === 'ingreso' ? 1 : -1;
            const monto = tx.monto * factor;
            
            if (tx.canal === 'salon') {
                totalSalon += monto;
            } else if (tx.canal === 'plataformas') {
                totalPlataformas += monto;
            } else if (tx.canal === 'directo') {
                totalDirecto += monto;
            }
        });

        const totalGeneral = totalSalon + totalPlataformas + totalDirecto;
        const fecha = new Date().toLocaleDateString('es-AR');
        const hora = new Date().toLocaleTimeString('es-AR');
        
        const nuevoCierre = {
            id_cierre: 'CIE-' + Math.floor(1000 + Math.random() * 9000),
            fecha: fecha,
            hora: hora,
            total_salon: totalSalon,
            total_plataformas: totalPlataformas,
            total_directo: totalDirecto,
            total_general: totalGeneral
        };

        // Guardar transacciones en el histórico persistente
        const historicoTx = JSON.parse(localStorage.getItem(KEY_CAJA_HISTORICO)) || [];
        const cajaConIdCierre = caja.map(tx => ({ ...tx, id_cierre: nuevoCierre.id_cierre }));
        localStorage.setItem(KEY_CAJA_HISTORICO, JSON.stringify(historicoTx.concat(cajaConIdCierre)));

        const historico = [nuevoCierre, ...cierres];
        updateCierres(historico);

        // Limpiar el estado de la caja y mesas activas
        updateCaja([]);
        updateOrders([]);
        updateCajaEstados(ESTADOS_CAJA_DEFECTO);
        const mesasReseteadas = MESAS_INICIALES.map(m => ({ ...m }));
        updateTables(mesasReseteadas);

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
        const nuevoId = 'rest-' + Math.floor(1000 + Math.random() * 9000);
        const esPendiente = datosLocal.metodo_pago_registro === 'Transferencia' || datosLocal.metodo_pago_registro === 'CBU';
        const nuevoLocal = {
            id: nuevoId,
            nombre: datosLocal.nombre,
            whatsapp: datosLocal.whatsapp,
            cuit: datosLocal.cuit || '30-' + Math.floor(10000000 + Math.random() * 90000000) + '-9',
            alias_cbu: datosLocal.alias_cbu || '',
            logo: datosLocal.logo || '🍕',
            estado: esPendiente ? 'Pendiente' : 'Activo',
            plan: datosLocal.plan || 'Premium',
            onboarding_complete: false,
            email: datosLocal.email || '',
            password: ofuscarDatoSensible(datosLocal.password || ''),
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

        // Si es el local activo, actualizar sesión activa
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

        // Si el local recomendador es el activo, actualizar sesión
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

        // Actualizar sesión activa
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
            setOfflineMode,
            updateOfflineQueue,
            updateEmailLogs,
            
            calcularCostosPedido,
            calcularCuotas,
            simularEnvioEmail,
            enviarNotificacionWhatsApp,
            
            crearPedido,
            crearPedidoDirectoMesa,
            registrarTransaccionCaja,
            actualizarEstadoPedido,
            actualizarItemsPedido,
            cobrarPedido,
            cobrarMesa,
            anularPedido,
            cerrarCajaParcial,
            cerrarJornadaCompleta,
            
            agregarPlatoAlMenu,
            editarPlatoDelMenu,
            eliminarPlatoDelMenu,
            
            registrarLocalSaaS,
            actualizarEstadoLocalSaaS,
            validarYCanjearCodigoReferido,
            obtenerAbonoMensual,
            actualizarConfiguracionOnboarding,
            
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
