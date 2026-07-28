// -- CONFIGURACIÓN INICIAL Y BASE DE DATOS LOCAL (LOCALSTORAGE) --

// Claves de localStorage
const KEY_MENU = 'comandas_menu';
const KEY_ORDERS = 'comandas_orders';
const KEY_CONFIG = 'comandas_config';
const KEY_WA_LOGS = 'comandas_wa_logs';
const KEY_TABLES = 'comandas_tables';
const KEY_CAJA = 'comandas_caja';
const KEY_CIERRES = 'comandas_cierres_historico';
const KEY_CAJA_ESTADOS = 'comandas_caja_estados';

// Claves SaaS para múltiples locales
const KEY_RESTAURANTS = 'comandas_saas_restaurants';
const KEY_ACTIVE_RESTAURANT = 'comandas_saas_active_restaurant';

// Catálogo inicial de platos con imágenes de alta calidad de Unsplash
const PLATOS_INICIALES = [
    { 
        id: 1, 
        nombre: 'Pizza Especial de Muzzarella y Jamón', 
        descripcion: 'Muzzarela premium, jamón cocido, morrones asados y aceitunas verdes.', 
        precio: 6500, 
        categoria: 'Principal', 
        disponible: true,
        imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'
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
        imagen: 'https://images.unsplash.com/photo-1556040885-3571d79435b6?auto=format&fit=crop&w=400&q=80'
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

// Configuración inicial por defecto
const CONFIG_DEFECTO = {
    montoEnvioGratis: 8000, 
    costoEnvio: 800,       
    interesCredito: 10,     
    restauranteNombre: "El Quincho Porteño",
    whatsappPhone: "+5491132456789",
    whatsappToken: "EAAG_simulado_token_antigravity_123456"
};

// Generar 12 mesas iniciales por defecto para el salón
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

// Local pre-cargado de demostración (Tenant Inicial)
const LOCAL_DEFECTO_SAAS = {
    id: 'quincho',
    nombre: 'El Quincho Porteño',
    whatsapp: '+5491132456789',
    alias_cbu: 'quincho.mp',
    logo: '🍔',
    estado: 'Activo', // Activo, Inactivo, Pendiente
    plan: 'Premium',
    onboarding_complete: true,
    email: 'contacto@quincho.com',
    password: 'quincho123',
    metodo_pago_registro: 'MercadoPago',
    comprobante_registro: '',
    fecha_registro: new Date().toLocaleDateString('es-AR')
};

// -- INICIALIZACIÓN DE DATOS --
function inicializarBaseDeDatos() {
    if (!localStorage.getItem(KEY_MENU)) {
        localStorage.setItem(KEY_MENU, JSON.stringify(PLATOS_INICIALES));
    }
    if (!localStorage.getItem(KEY_CONFIG)) {
        localStorage.setItem(KEY_CONFIG, JSON.stringify(CONFIG_DEFECTO));
    }
    if (!localStorage.getItem(KEY_ORDERS)) {
        localStorage.setItem(KEY_ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEY_WA_LOGS)) {
        localStorage.setItem(KEY_WA_LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEY_TABLES)) {
        localStorage.setItem(KEY_TABLES, JSON.stringify(MESAS_INICIALES));
    }
    if (!localStorage.getItem(KEY_CAJA)) {
        localStorage.setItem(KEY_CAJA, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEY_CIERRES)) {
        localStorage.setItem(KEY_CIERRES, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEY_CAJA_ESTADOS)) {
        localStorage.setItem(KEY_CAJA_ESTADOS, JSON.stringify(ESTADOS_CAJA_DEFECTO));
    }
    // Inicialización del SaaS con soporte para cifrado
    const localesExistentes = localStorage.getItem(KEY_RESTAURANTS);
    if (!localesExistentes) {
        const localDefault = {...LOCAL_DEFECTO_SAAS};
        localDefault.password = ofuscarDatoSensible(localDefault.password);
        localStorage.setItem(KEY_RESTAURANTS, JSON.stringify([localDefault]));
    } else {
        const locales = JSON.parse(localesExistentes);
        let modificado = false;

        // Asegurar que el local de demo tenga email y contraseña cargados y cifrados
        const idx = locales.findIndex(l => l.id === 'quincho');
        if (idx !== -1 && !locales[idx].email) {
            locales[idx].email = 'contacto@quincho.com';
            locales[idx].password = 'quincho123';
            locales[idx].metodo_pago_registro = 'MercadoPago';
            locales[idx].comprobante_registro = '';
            modificado = true;
        }

        // Cifrar datos que estén guardados en texto plano en la migración
        locales.forEach(loc => {
            if (loc.password && !loc.password.startsWith("enc::")) {
                loc.password = ofuscarDatoSensible(loc.password);
                modificado = true;
            }
            if (loc.cbu_cliente && !loc.cbu_cliente.startsWith("enc::")) {
                loc.cbu_cliente = ofuscarDatoSensible(loc.cbu_cliente);
                modificado = true;
            }
        });

        if (modificado) {
            localStorage.setItem(KEY_RESTAURANTS, JSON.stringify(locales));
        }
    }
    
    if (!localStorage.getItem(KEY_ACTIVE_RESTAURANT)) {
        const localDefault = {...LOCAL_DEFECTO_SAAS};
        localDefault.password = ofuscarDatoSensible(localDefault.password);
        localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(localDefault));
    } else {
        const activo = JSON.parse(localStorage.getItem(KEY_ACTIVE_RESTAURANT));
        if (activo && activo.id === 'quincho' && !activo.email) {
            const localDefault = {...LOCAL_DEFECTO_SAAS};
            localDefault.password = ofuscarDatoSensible(localDefault.password);
            localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(localDefault));
        }
    }
}

inicializarBaseDeDatos();

// -- FUNCIONES ACCESORAS (GETTERS & SETTERS) --

function obtenerMenu() {
    return JSON.parse(localStorage.getItem(KEY_MENU));
}

function guardarMenu(menu) {
    localStorage.setItem(KEY_MENU, JSON.stringify(menu));
    window.dispatchEvent(new Event('menuUpdated'));
}

function obtenerConfig() {
    return JSON.parse(localStorage.getItem(KEY_CONFIG));
}

function guardarConfig(config) {
    localStorage.setItem(KEY_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new Event('configUpdated'));
}

function obtenerPedidos() {
    return JSON.parse(localStorage.getItem(KEY_ORDERS));
}

function guardarPedidos(pedidos) {
    localStorage.setItem(KEY_ORDERS, JSON.stringify(pedidos));
    window.dispatchEvent(new Event('ordersUpdated'));
}

function obtenerLogsWA() {
    return JSON.parse(localStorage.getItem(KEY_WA_LOGS));
}

function guardarLogsWA(logs) {
    localStorage.setItem(KEY_WA_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new Event('waLogsUpdated'));
}

function obtenerMesas() {
    return JSON.parse(localStorage.getItem(KEY_TABLES));
}

function guardarMesas(mesas) {
    localStorage.setItem(KEY_TABLES, JSON.stringify(mesas));
    window.dispatchEvent(new Event('tablesUpdated'));
}

function obtenerCaja() {
    return JSON.parse(localStorage.getItem(KEY_CAJA)) || [];
}

function guardarCaja(caja) {
    localStorage.setItem(KEY_CAJA, JSON.stringify(caja));
    window.dispatchEvent(new Event('cajaUpdated'));
}

function obtenerHistoricoCierres() {
    return JSON.parse(localStorage.getItem(KEY_CIERRES)) || [];
}

function guardarHistoricoCierres(cierres) {
    localStorage.setItem(KEY_CIERRES, JSON.stringify(cierres));
    window.dispatchEvent(new Event('cierresUpdated'));
}

function obtenerEstadosCaja() {
    return JSON.parse(localStorage.getItem(KEY_CAJA_ESTADOS)) || ESTADOS_CAJA_DEFECTO;
}

function guardarEstadosCaja(estados) {
    localStorage.setItem(KEY_CAJA_ESTADOS, JSON.stringify(estados));
    window.dispatchEvent(new Event('cajaEstadosUpdated'));
}

// SaaS Getters y Setters
function obtenerLocalesSaaS() {
    return JSON.parse(localStorage.getItem(KEY_RESTAURANTS)) || [LOCAL_DEFECTO_SAAS];
}

function guardarLocalesSaaS(locales) {
    localStorage.setItem(KEY_RESTAURANTS, JSON.stringify(locales));
    window.dispatchEvent(new Event('saasUpdated'));
}

function obtenerRestauranteActivo() {
    return JSON.parse(localStorage.getItem(KEY_ACTIVE_RESTAURANT)) || LOCAL_DEFECTO_SAAS;
}

function guardarRestauranteActivo(local) {
    localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(local));
    
    // Si cambiamos de restaurante activo, sincronizamos también la configuración básica del negocio
    if (local) {
        const config = obtenerConfig();
        config.restauranteNombre = local.nombre;
        config.whatsappPhone = local.whatsapp;
        guardarConfig(config);
    }
    
    window.dispatchEvent(new Event('activeRestaurantUpdated'));
}

// Sincronización en tiempo real entre pestañas
window.addEventListener('storage', (e) => {
    if (e.key === KEY_MENU) {
        window.dispatchEvent(new Event('menuUpdated'));
    } else if (e.key === KEY_CONFIG) {
        window.dispatchEvent(new Event('configUpdated'));
    } else if (e.key === KEY_ORDERS) {
        window.dispatchEvent(new Event('ordersUpdated'));
    } else if (e.key === KEY_WA_LOGS) {
        window.dispatchEvent(new Event('waLogsUpdated'));
    } else if (e.key === KEY_TABLES) {
        window.dispatchEvent(new Event('tablesUpdated'));
    } else if (e.key === KEY_CAJA) {
        window.dispatchEvent(new Event('cajaUpdated'));
    } else if (e.key === KEY_CIERRES) {
        window.dispatchEvent(new Event('cierresUpdated'));
    } else if (e.key === KEY_CAJA_ESTADOS) {
        window.dispatchEvent(new Event('cajaEstadosUpdated'));
    } else if (e.key === KEY_RESTAURANTS) {
        window.dispatchEvent(new Event('saasUpdated'));
    } else if (e.key === KEY_ACTIVE_RESTAURANT) {
        window.dispatchEvent(new Event('activeRestaurantUpdated'));
    }
});

// -- LÓGICA DE PRECIOS Y COSTOS --
function calcularCostosPedido(subtotal, tipoEntrega) {
    const config = obtenerConfig();
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
}

// -- LÓGICA DE CUOTAS --
function calcularCuotas(monto, cuotasSeleccionadas) {
    const config = obtenerConfig();
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
}

// -- SIMULADOR DE NOTIFICACIONES WHATSAPP --
function enviarNotificacionWhatsApp(pedido) {
    const config = obtenerConfig();
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

    const logs = obtenerLogsWA();
    logs.unshift(logEntry);
    guardarLogsWA(logs);
}

// -- CREAR NUEVO PEDIDO --
function crearPedido(datosPedido) {
    const pedidos = obtenerPedidos();
    const nuevoPedido = {
        id_pedido: 'PED-' + Math.floor(1000 + Math.random() * 9000),
        fecha_hora: new Date().toLocaleString('es-AR'),
        estado: 'Pendiente', 
        cobrado: datosPedido.cobrado !== undefined ? datosPedido.cobrado : (datosPedido.plataforma ? true : false),
        ...datosPedido
    };
    
    // Si viene directamente confirmado desde cocina
    if (datosPedido.estado) {
        nuevoPedido.estado = datosPedido.estado;
    }
    
    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);
    
    if (nuevoPedido.tipo_entrega === 'mesa') {
        const nroMesa = parseInt(nuevoPedido.nro_mesa);
        const mesas = obtenerMesas();
        const idx = mesas.findIndex(m => m.numero === nroMesa);
        if (idx !== -1) {
            mesas[idx].estado = 'Ocupada';
            mesas[idx].pedido_activo = nuevoPedido.id_pedido;
            guardarMesas(mesas);
        }
    }
    
    return nuevoPedido;
}

// -- CREAR PEDIDO DIRECTO DESDE ADMIN (MESAS) --
function crearPedidoDirectoMesa(nroMesa, items, nombreCliente) {
    const subtotal = items.reduce((acc, curr) => acc + (curr.precio * curr.cantidad), 0);
    const pedido = {
        nombre_cliente: nombreCliente.trim() || `Mesa ${nroMesa}`,
        telefono_cliente: "+54 9 11 0000 0000", // No requiere celular real en salón
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
        estado: "Confirmado" // Entra directamente como comanda confirmada a la cocina
    };
    return crearPedido(pedido);
}

// -- REGISTRAR EN CAJA SEGREGADA --
function registrarTransaccionCaja(tipo, descripcion, monto, metodoPago = 'Efectivo', canal = 'directo') {
    const caja = obtenerCaja();
    
    const estados = obtenerEstadosCaja();
    const cajaCerrada = estados[canal] === true;

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
    caja.unshift(nuevaTransaccion);
    guardarCaja(caja);
    return nuevaTransaccion;
}

// -- ACTUALIZAR ESTADO DEL PEDIDO --
function actualizarEstadoPedido(idPedido, nuevoEstado) {
    const pedidos = obtenerPedidos();
    const index = pedidos.findIndex(p => p.id_pedido === idPedido);
    
    if (index !== -1) {
        const anteriorEstado = pedidos[index].estado;
        pedidos[index].estado = nuevoEstado;
        
        if (nuevoEstado === 'Entregado' && anteriorEstado !== 'Entregado' && pedidos[index].tipo_entrega !== 'mesa') {
            const pedido = pedidos[index];
            if (!pedido.cobrado) {
                pedido.cobrado = true;
                let canal = 'directo';
                let descripcion = `Venta Directa - Pedido #${pedido.id_pedido}`;
                
                if (pedido.plataforma) {
                    canal = 'plataformas';
                    descripcion = `Venta ${pedido.plataforma.toUpperCase()} - Pedido #${pedido.id_pedido}`;
                }
                
                registrarTransaccionCaja(
                    'ingreso',
                    descripcion,
                    pedido.total,
                    pedido.metodo_pago || 'Efectivo',
                    canal
                );
            }
        }

        guardarPedidos(pedidos);
        enviarNotificacionWhatsApp(pedidos[index]);
        return true;
    }
    return false;
}

// -- MODIFICAR ITEMS DE UN PEDIDO ACTIVO --
function actualizarItemsPedido(idPedido, nuevosItems, nuevoTotal, nuevoSubtotal) {
    const pedidos = obtenerPedidos();
    const idx = pedidos.findIndex(p => p.id_pedido === idPedido);
    if (idx !== -1) {
        pedidos[idx].items = nuevosItems;
        pedidos[idx].total = nuevoTotal;
        pedidos[idx].subtotal = nuevoSubtotal;
        guardarPedidos(pedidos);
        return true;
    }
    return false;
}

// -- PROCESAR COBRO DE CUALQUIER PEDIDO --
function cobrarPedido(idPedido, metodoPago) {
    const pedidos = obtenerPedidos();
    const idxPed = pedidos.findIndex(p => p.id_pedido === idPedido);
    if (idxPed === -1) return false;
    
    const pedido = pedidos[idxPed];
    if (pedido.cobrado) return false;
    
    pedido.cobrado = true;
    pedido.metodo_pago = metodoPago.toLowerCase();
    
    let canal = 'directo';
    let descripcion = `Cobro Pedido #${idPedido} (${pedido.nombre_cliente})`;
    
    if (pedido.tipo_entrega === 'mesa') {
        canal = 'salon';
        descripcion = `Cobro Mesa ${pedido.nro_mesa} - Pedido #${idPedido}`;
        
        // Liberar mesa si está ocupada por este pedido
        const mesas = obtenerMesas();
        const idxMesa = mesas.findIndex(m => m.numero === parseInt(pedido.nro_mesa));
        if (idxMesa !== -1 && mesas[idxMesa].pedido_activo === idPedido) {
            mesas[idxMesa].estado = 'Libre';
            mesas[idxMesa].pedido_activo = null;
            guardarMesas(mesas);
        }
    } else if (pedido.plataforma) {
        canal = 'plataformas';
        descripcion = `Cobro Venta ${pedido.plataforma.toUpperCase()} - Pedido #${idPedido}`;
    }
    
    registrarTransaccionCaja(
        'ingreso',
        descripcion,
        pedido.total,
        metodoPago,
        canal
    );
    
    // Si cobramos el pedido, lo marcamos también como Entregado si no estaba en un estado final
    if (pedido.estado !== 'Entregado' && pedido.estado !== 'Anulado') {
        pedido.estado = 'Entregado';
    }
    
    guardarPedidos(pedidos);
    return true;
}

// -- PROCESAR COBRO DE MESA (SALÓN) --
function cobrarMesa(nroMesa, metodoPago) {
    const mesas = obtenerMesas();
    const idxMesa = mesas.findIndex(m => m.numero === parseInt(nroMesa));
    if (idxMesa === -1) return false;
    
    const idPedido = mesas[idxMesa].pedido_activo;
    if (!idPedido) return false;
    
    return cobrarPedido(idPedido, metodoPago);
}

// -- ANULAR UN PEDIDO --
function anularPedido(idPedido) {
    const pedidos = obtenerPedidos();
    const idxPed = pedidos.findIndex(p => p.id_pedido === idPedido);
    if (idxPed === -1) return false;
    
    const pedido = pedidos[idxPed];
    const eraCobrado = pedido.cobrado;
    
    pedido.estado = 'Anulado';
    pedido.cobrado = false; // Ya no está cobrado ya que se anuló
    
    // Si era una mesa y estaba ocupada, la liberamos
    if (pedido.tipo_entrega === 'mesa') {
        const mesas = obtenerMesas();
        const idxMesa = mesas.findIndex(m => m.numero === parseInt(pedido.nro_mesa));
        if (idxMesa !== -1 && mesas[idxMesa].pedido_activo === idPedido) {
            mesas[idxMesa].estado = 'Libre';
            mesas[idxMesa].pedido_activo = null;
            guardarMesas(mesas);
        }
    }
    
    // Si ya había sido cobrado (o entregado y por ende ingresado en caja), revertimos el cobro con un egreso
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
    
    guardarPedidos(pedidos);
    return true;
}

// -- GESTIÓN DE CIERRES PARCIALES Y TOTAL DE JORNADA --

function cerrarCajaParcial(canal) {
    const estados = obtenerEstadosCaja();
    estados[canal] = true;
    guardarEstadosCaja(estados);
    return true;
}

function cerrarJornadaCompleta() {
    const caja = obtenerCaja();
    
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

    // Guardar transacciones de caja activa en el histórico persistente antes de limpiar la caja
    const KEY_CAJA_HISTORICO = 'comandas_caja_historico';
    const historicoTx = JSON.parse(localStorage.getItem(KEY_CAJA_HISTORICO)) || [];
    const cajaConIdCierre = caja.map(tx => ({ ...tx, id_cierre: nuevoCierre.id_cierre }));
    localStorage.setItem(KEY_CAJA_HISTORICO, JSON.stringify(historicoTx.concat(cajaConIdCierre)));

    const historico = obtenerHistoricoCierres();
    historico.unshift(nuevoCierre);
    guardarHistoricoCierres(historico);

    guardarCaja([]); 
    guardarPedidos([]); 
    guardarEstadosCaja(ESTADOS_CAJA_DEFECTO); 
    
    const mesasReseteadas = MESAS_INICIALES.map(m => ({ ...m }));
    guardarMesas(mesasReseteadas);

    localStorage.removeItem('comandas_active_mesa');

    return nuevoCierre;
}

// -- GESTIÓN DE PLATOS (CRUD) --
function agregarPlatoAlMenu(plato) {
    const menu = obtenerMenu();
    const nuevoId = menu.length > 0 ? Math.max(...menu.map(p => p.id)) + 1 : 1;
    const nuevoPlato = {
        id: nuevoId,
        disponible: true,
        imagen: plato.imagen || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
        ...plato
    };
    menu.push(nuevoPlato);
    guardarMenu(menu);
    return nuevoPlato;
}

// -- OPERACIONES SAAS (GESTIÓN DE CLIENTES / LOCALES) --
function registrarLocalSaaS(datosLocal) {
    const locales = obtenerLocalesSaaS();
    const nuevoId = 'rest-' + Math.floor(1000 + Math.random() * 9000);
    const esPendiente = datosLocal.metodo_pago_registro === 'Transferencia' || datosLocal.metodo_pago_registro === 'CBU';
    const nuevoLocal = {
        id: nuevoId,
        nombre: datosLocal.nombre,
        whatsapp: datosLocal.whatsapp,
        cuit: datosLocal.cuit || '30-' + Math.floor(10000000 + Math.random() * 90000000) + '-9',
        alias_cbu: datosLocal.alias_cbu || '',
        logo: datosLocal.logo || '🍕',
        estado: esPendiente ? 'Pendiente' : 'Activo', // Queda en espera si es transferencia o débito por CBU
        plan: datosLocal.plan || 'Premium',
        onboarding_complete: false, // Forzar wizard popups
        email: datosLocal.email || '',
        password: datosLocal.password || '',
        metodo_pago_registro: datosLocal.metodo_pago_registro || 'MercadoPago',
        comprobante_registro: datosLocal.comprobante_registro || '',
        cbu_cliente: datosLocal.cbu_cliente || '',
        fecha_registro: new Date().toLocaleDateString('es-AR')
    };

    locales.push(nuevoLocal);
    guardarLocalesSaaS(locales);
    
    // Iniciar sesión del nuevo local automáticamente
    guardarRestauranteActivo(nuevoLocal);

    // Enviar correos emulados de bienvenida/solicitud
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
            `Hola ${nuevoLocal.nombre}.\n\nHemos recibido tu solicitud de adhesión al Débito Directo para la cuenta CBU/CVU: ${nuevoLocal.cbu_cliente}.\nLa habilitación de tu licencia del Plan ${nuevoLocal.plan} se completará una vez auditada la cuenta bancaria clearing en el BBVA.\n\nAtentamente,\nEl equipo de ComandaFlow.`
        );
    }

    return nuevoLocal;
}

function actualizarEstadoLocalSaaS(idLocal, estado) {
    const locales = obtenerLocalesSaaS();
    const idx = locales.findIndex(l => l.id === idLocal);
    if (idx !== -1) {
        locales[idx].estado = estado;
        guardarLocalesSaaS(locales);

        // Si es el local activo, actualizar también el estado de la sesión activa
        const activo = obtenerRestauranteActivo();
        if (activo && activo.id === idLocal) {
            activo.estado = estado;
            // No podemos usar guardarRestauranteActivo porque tiene efectos secundarios, escribimos directo
            localStorage.setItem(KEY_ACTIVE_RESTAURANT, JSON.stringify(activo));
            window.dispatchEvent(new Event('activeRestaurantUpdated'));
        }
        return true;
    }
    return false;
}

function actualizarConfiguracionOnboarding(idLocal, datosConfig) {
    const locales = obtenerLocalesSaaS();
    const idx = locales.findIndex(l => l.id === idLocal);
    if (idx !== -1) {
        locales[idx].alias_cbu = datosConfig.alias_cbu;
        locales[idx].logo = datosConfig.logo || locales[idx].logo;
        locales[idx].onboarding_complete = true;
        guardarLocalesSaaS(locales);

        // Actualizar sesión activa
        const activo = obtenerRestauranteActivo();
        if (activo && activo.id === idLocal) {
            activo.alias_cbu = datosConfig.alias_cbu;
            activo.logo = datosConfig.logo || activo.logo;
            activo.onboarding_complete = true;
            guardarRestauranteActivo(activo); // Sincroniza configuraciones y nombre
        }
        return true;
    }
    return false;
}

function editarPlatoDelMenu(platoActualizado) {
    const menu = obtenerMenu();
    const idx = menu.findIndex(p => p.id === parseInt(platoActualizado.id));
    if (idx !== -1) {
        menu[idx] = { ...menu[idx], ...platoActualizado };
        guardarMenu(menu);
        return true;
    }
    return false;
}

function eliminarPlatoDelMenu(idPlato) {
    const menu = obtenerMenu();
    const filtrado = menu.filter(p => p.id !== parseInt(idPlato));
    if (filtrado.length !== menu.length) {
        guardarMenu(filtrado);
        return true;
    }
    return false;
}

// -- SERVICIO DE SEGURIDAD SIMULADO (JWT & AUTH0) --
const JWT_SECRET_KEY = "comandaflow_secret_hash_2026";

function simularBase64URLEncode(str) {
    try {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    } catch (e) {
        return "";
    }
}

function simularBase64URLDecode(str) {
    try {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
        return "{}";
    }
}

// Genera un token JWT simulado con firma de integridad
function generarJWT(payload) {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };
    const headerString = simularBase64URLEncode(JSON.stringify(header));
    const payloadString = simularBase64URLEncode(JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + 3600000) / 1000) // 1 hora de validez
    }));
    
    // Firma simulada utilizando HMAC-SHA256 simulado
    const rawSignature = headerString + "." + payloadString + "." + JWT_SECRET_KEY;
    let hash = 0;
    for (let i = 0; i < rawSignature.length; i++) {
        const char = rawSignature.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a entero de 32 bits
    }
    const signatureString = simularBase64URLEncode("hash_" + Math.abs(hash));
    
    return headerString + "." + payloadString + "." + signatureString;
}

// Verifica el JWT simulado. Lanza error si no es válido
function verificarYDecodificarJWT(token) {
    if (!token) throw new Error("Token no provisto");
    
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error("Estructura de token inválida");
    
    const [headerStr, payloadStr, signatureStr] = parts;
    
    // Validar firma
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
    
    // Validar expiración
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && nowInSeconds > payload.exp) {
        throw new Error("Token expirado");
    }
    
    return payload;
}

// Manejo de tokens de sesión
function guardarTokenSesion(token) {
    sessionStorage.setItem('comandaflow_jwt_token', token);
}

function obtenerTokenSesion() {
    return sessionStorage.getItem('comandaflow_jwt_token');
}

function cerrarSesionActual() {
    sessionStorage.removeItem('comandaflow_jwt_token');
}

function obtenerUsuarioActual() {
    const token = obtenerTokenSesion();
    if (!token) return null;
    try {
        return verificarYDecodificarJWT(token);
    } catch(e) {
        console.error("Error al verificar token de sesión:", e.message);
        cerrarSesionActual();
        return null;
    }
}

// -- SIMULADOR DE ENVÍO DE CORREOS SMTP --
function simularEnvioEmail(destinatario, asunto, cuerpo) {
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

    const logs = JSON.parse(localStorage.getItem('comandas_email_logs')) || [];
    logs.unshift(emailLog);
    localStorage.setItem('comandas_email_logs', JSON.stringify(logs));
    window.dispatchEvent(new Event('emailsUpdated'));
}

function obtenerLogsEmail() {
    return JSON.parse(localStorage.getItem('comandas_email_logs')) || [];
}

function limpiarLogsEmail() {
    localStorage.setItem('comandas_email_logs', JSON.stringify([]));
    window.dispatchEvent(new Event('emailsUpdated'));
}

// -- CRIPTOGRAFÍA SIMULADA Y SANITIZACIÓN PARA SEGURIDAD DE DATOS --
const SAAS_SECRET_SALT = "ComandaFlowSecureSalt102!";

function ofuscarDatoSensible(texto) {
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

function desofuscarDatoSensible(textoOfuscado) {
    if (!textoOfuscado) return "";
    if (!textoOfuscado.startsWith("enc::")) return textoOfuscado;
    
    try {
        const ciphertext = textoOfuscado.substring(5); // Remover "enc::"
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

function escaparHTML(str) {
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

function validarAislamientoTenant() {
    const user = obtenerUsuarioActual();
    if (user && user.role === 'merchant') {
        const activo = obtenerRestauranteActivo();
        if (activo && activo.id !== user.sub) {
            console.warn("⚠️ ALERTA DE SEGURIDAD: El ID del local seleccionado (" + (activo.id || 'N/A') + ") no coincide con el tenant registrado en el token JWT (" + user.sub + "). Posible secuestro de tenant. Bloqueando sesión.");
            cerrarSesionActual();
            alert("Acceso denegado: Inconsistencia de seguridad detectada (Tenant Mismatch).");
            window.location.href = 'admin.html';
            return false;
        }
    }
    return true;
}

/* 
================================================================================
GUÍA DE ARQUITECTURA: INTEGRACIÓN DE APIS EN PRODUCCIÓN (RAPPI & PEDIDOSYA)
================================================================================
(Consulte la sección final de app.js para leer el flujo completo de producción).
================================================================================
*/
