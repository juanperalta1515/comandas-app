// -- CONFIGURACIÓN INICIAL Y BASE DE DATOS LOCAL (LOCALSTORAGE) --

// Claves de localStorage
const KEY_MENU = 'comandas_menu';
const KEY_ORDERS = 'comandas_orders';
const KEY_CONFIG = 'comandas_config';
const KEY_WA_LOGS = 'comandas_wa_logs';

// Catálogo inicial de platos (100% adaptado a una casa de comida argentina)
const PLATOS_INICIALES = [
    { id: 1, nombre: 'Pizza Especial de Muzzarella y Jamón', descripcion: 'Muzzarela premium, jamón cocido, morrones asados y aceitunas verdes.', precio: 6500, categoria: 'Principal', disponible: true },
    { id: 2, nombre: 'Pizza Fugazzeta Rellena (Porción)', descripcion: 'Abundante cebolla caramelizada, doble muzzarela y orégano.', precio: 2200, categoria: 'Principal', disponible: true },
    { id: 3, nombre: 'Empanada de Carne Cortada a Cuchillo', descripcion: 'Frita o al horno. Relleno jugoso de carne vacuna con verdeo y comino.', precio: 950, categoria: 'Entrada', disponible: true },
    { id: 4, nombre: 'Empanada de Jamón y Queso Hojaldrada', descripcion: 'Jamón cocido de primera calidad y queso muzzarela derretido.', precio: 900, categoria: 'Entrada', disponible: true },
    { id: 5, nombre: 'Milanesa de Ternera Napolitana con Papas Fritas', descripcion: 'Milanesa gigante, salsa de tomate de la casa, jamón, muzzarela y papas fritas bastón.', precio: 7800, categoria: 'Principal', disponible: true },
    { id: 6, nombre: 'Flan Casero con Dulce de Leche y Crema', descripcion: 'El clásico postre argentino hecho con 8 yemas, acompañado de dulce de leche colonial.', precio: 2200, categoria: 'Postre', disponible: true },
    { id: 7, nombre: 'Panqueque con Dulce de Leche Quemado', descripcion: 'Dos panqueques rellenos de abundante dulce de leche, espolvoreados con azúcar y quemados al hierro.', precio: 2100, categoria: 'Postre', disponible: true },
    { id: 8, nombre: 'Cerveza Quilmes Clásica 1 Litro', descripcion: 'Cerveza lager argentina helada, ideal para compartir.', precio: 2500, categoria: 'Bebida', disponible: true },
    { id: 9, nombre: 'Gaseosa Paso de los Toros Pomelo 1.5L', descripcion: 'Bebida gasificada con sabor amargo y refrescante de pomelo.', precio: 1800, categoria: 'Bebida', disponible: true }
];

// Configuración inicial por defecto
const CONFIG_DEFECTO = {
    montoEnvioGratis: 8000, // ARS
    costoEnvio: 800,       // ARS
    interesCredito: 10,     // % mensual simple
    restauranteNombre: "El Quincho Porteño",
    whatsappPhone: "+5491132456789",
    whatsappToken: "EAAG_simulado_token_antigravity_123456"
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

// Escuchar cambios de storage para sincronización entre pestañas en tiempo real
window.addEventListener('storage', (e) => {
    if (e.key === KEY_MENU) {
        window.dispatchEvent(new Event('menuUpdated'));
    } else if (e.key === KEY_CONFIG) {
        window.dispatchEvent(new Event('configUpdated'));
    } else if (e.key === KEY_ORDERS) {
        window.dispatchEvent(new Event('ordersUpdated'));
    } else if (e.key === KEY_WA_LOGS) {
        window.dispatchEvent(new Event('waLogsUpdated'));
    }
});

function obtenerPedidos() {
    return JSON.parse(localStorage.getItem(KEY_ORDERS));
}

function guardarPedidos(pedidos) {
    localStorage.setItem(KEY_ORDERS, JSON.stringify(pedidos));
    // Sincronizar el almacenamiento local de forma explícita para notificar
    window.dispatchEvent(new Event('ordersUpdated'));
}

function obtenerLogsWA() {
    return JSON.parse(localStorage.getItem(KEY_WA_LOGS));
}

function guardarLogsWA(logs) {
    localStorage.setItem(KEY_WA_LOGS, JSON.stringify(logs));
    window.dispatchEvent(new Event('waLogsUpdated'));
}

// -- LÓGICA DE ENVÍO GRATIS Y PRECIOS --
function calcularCostosPedido(subtotal, tipoEntrega) {
    const config = obtenerConfig();
    const sub = parseFloat(subtotal) || 0;
    
    if (tipoEntrega === 'retiro') {
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

// -- LÓGICA DE FINANCIACIÓN EN CUOTAS --
function calcularCuotas(monto, cuotasSeleccionadas) {
    const config = obtenerConfig();
    const interesMensual = config.interesCredito / 100; // Ej: 0.10 para 10%
    
    let recargoPercent = 0;
    
    // Aplicamos interés simple según la cantidad de cuotas (simulado al estilo argentino)
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

// -- SIMULADOR DE NOTIFICACIONES DE WHATSAPP BUSINESS --
function enviarNotificacionWhatsApp(pedido) {
    const config = obtenerConfig();
    const { id_pedido, nombre_cliente, telefono_cliente, total, estado, tipo_entrega } = pedido;
    
    let mensaje = '';
    let triggerEnvio = false;

    // Disparadores automáticos según el estado
    if (estado === 'Confirmado') {
        mensaje = `¡Hola ${nombre_cliente}! Tu pedido #${id_pedido} en ${config.restauranteNombre} ha sido confirmado. Te avisaremos cuando esté listo. Total: $${total.toLocaleString('es-AR')}.`;
        triggerEnvio = true;
    } else if (estado === 'En Camino') {
        const tiempoEstimado = tipo_entrega === 'envio' ? '35 a 50' : '15 a 25';
        mensaje = `¡Tu pedido #${id_pedido} ya está en camino! Llega en aproximadamente ${tiempoEstimado} minutos. Gracias por elegirnos.`;
        triggerEnvio = true;
    } else if (estado === 'Listo para Entregar' && tipo_entrega === 'retiro') {
        mensaje = `¡Hola ${nombre_cliente}! Tu pedido #${id_pedido} ya está listo para retirar por nuestro local. ¡Te esperamos!`;
        triggerEnvio = true;
    }

    if (!triggerEnvio) return;

    // Crear log de la petición de API
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

    // Guardar en la base de datos de logs
    const logs = obtenerLogsWA();
    logs.unshift(logEntry); // Agregar al principio
    guardarLogsWA(logs);
    
    console.log("WhatsApp Cloud API - Mensaje Enviado:", logEntry);
}

// -- CREAR NUEVO PEDIDO --
function crearPedido(datosPedido) {
    const pedidos = obtenerPedidos();
    const nuevoPedido = {
        id_pedido: 'PED-' + Math.floor(1000 + Math.random() * 9000),
        fecha_hora: new Date().toLocaleString('es-AR'),
        estado: 'Pendiente', // Estado inicial obligatorio
        ...datosPedido
    };
    
    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);
    
    // Notificación inicial del sistema (consola)
    console.log("Pedido Creado con Éxito:", nuevoPedido);
    return nuevoPedido;
}

// -- ACTUALIZAR ESTADO DEL PEDIDO --
function actualizarEstadoPedido(idPedido, nuevoEstado) {
    const pedidos = obtenerPedidos();
    const index = pedidos.findIndex(p => p.id_pedido === idPedido);
    
    if (index !== -1) {
        pedidos[index].estado = nuevoEstado;
        guardarPedidos(pedidos);
        
        // Disparar la notificación transaccional de WhatsApp correspondientemente
        enviarNotificacionWhatsApp(pedidos[index]);
        return true;
    }
    return false;
}
