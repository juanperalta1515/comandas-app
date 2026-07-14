// -- CONFIGURACIÓN INICIAL Y BASE DE DATOS LOCAL (LOCALSTORAGE) --

// Claves de localStorage
const KEY_MENU = 'comandas_menu';
const KEY_ORDERS = 'comandas_orders';
const KEY_CONFIG = 'comandas_config';
const KEY_WA_LOGS = 'comandas_wa_logs';
const KEY_TABLES = 'comandas_tables';
const KEY_CAJA = 'comandas_caja';

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
    montoEnvioGratis: 8000, // ARS
    costoEnvio: 800,       // ARS
    interesCredito: 10,     // % mensual simple
    restauranteNombre: "El Quincho Porteño",
    whatsappPhone: "+5491132456789",
    whatsappToken: "EAAG_simulado_token_antigravity_123456"
};

// Generar 12 mesas iniciales por defecto para el salón
const MESAS_INICIALES = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    estado: 'Libre', // Libre, Ocupada, Pidiendo Cuenta
    pedido_activo: null // ID del pedido asociado actual
}));

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

// Escuchar cambios en localStorage para sincronización instantánea
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
    }
});

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

// -- LÓGICA DE ENVÍO GRATIS Y PRECIOS --
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

// -- LÓGICA DE FINANCIACIÓN EN CUOTAS --
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

// -- SIMULADOR DE NOTIFICACIONES DE WHATSAPP BUSINESS --
function enviarNotificacionWhatsApp(pedido) {
    const config = obtenerConfig();
    const { id_pedido, nombre_cliente, telefono_cliente, total, estado, tipo_entrega, nro_mesa } = pedido;
    
    let mensaje = '';
    let triggerEnvio = false;

    // Disparadores automáticos según el estado
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

    const logs = obtenerLogsWA();
    logs.unshift(logEntry);
    guardarLogsWA(logs);
    
    console.log("WhatsApp Cloud API - Mensaje Enviado:", logEntry);
}

// -- CREAR NUEVO PEDIDO --
function crearPedido(datosPedido) {
    const pedidos = obtenerPedidos();
    const nuevoPedido = {
        id_pedido: 'PED-' + Math.floor(1000 + Math.random() * 9000),
        fecha_hora: new Date().toLocaleString('es-AR'),
        estado: 'Pendiente', 
        ...datosPedido
    };
    
    pedidos.push(nuevoPedido);
    guardarPedidos(pedidos);
    
    // Si es consumo en salón, asociarlo a la mesa y ocuparla
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

// -- REGISTRAR EN CAJA --
function registrarTransaccionCaja(tipo, descripcion, monto, metodoPago = 'Efectivo') {
    const caja = obtenerCaja();
    const nuevaTransaccion = {
        id: 'TX-' + Math.floor(10000 + Math.random() * 90000),
        tipo: tipo, // 'ingreso' o 'egreso'
        descripcion: descripcion,
        monto: parseFloat(monto) || 0,
        metodoPago: metodoPago,
        fecha_hora: new Date().toLocaleString('es-AR')
    };
    caja.unshift(nuevaTransaccion);
    guardarCaja(caja);
    return nuevaTransaccion;
}

// -- PROCESAR COBRO DE MESA --
function cobrarMesa(nroMesa, metodoPago) {
    const mesas = obtenerMesas();
    const idxMesa = mesas.findIndex(m => m.numero === parseInt(nroMesa));
    if (idxMesa === -1) return false;
    
    const idPedido = mesas[idxMesa].pedido_activo;
    if (!idPedido) return false;
    
    const pedidos = obtenerPedidos();
    const idxPed = pedidos.findIndex(p => p.id_pedido === idPedido);
    if (idxPed === -1) return false;
    
    const pedido = pedidos[idxPed];
    
    // Registrar ingreso en caja
    registrarTransaccionCaja(
        'ingreso', 
        `Cobro Mesa ${nroMesa} - Pedido #${idPedido}`, 
        pedido.total, 
        metodoPago
    );
    
    // Actualizar pedido a Entregado/Finalizado
    pedidos[idxPed].estado = 'Entregado';
    pedidos[idxPed].metodo_pago = metodoPago.toLowerCase();
    guardarPedidos(pedidos);
    
    // Liberar mesa
    mesas[idxMesa].estado = 'Libre';
    mesas[idxMesa].pedido_activo = null;
    guardarMesas(mesas);
    
    return true;
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
