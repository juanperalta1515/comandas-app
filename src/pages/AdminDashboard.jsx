import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDb, desofuscarDatoSensible, escaparHTML } from '../context/DbContext';
import logoImg from '../assets/logo.png';

function AdminDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        menu,
        config,
        orders,
        waLogs,
        tables,
        caja,
        cajaEstados,
        cierres,
        activeRestaurant,
        currentUser,
        offlineMode,
        loginWithAuth0,
        logoutAuth0,
        validarAislamientoTenant,
        actualizarEstadoPedido,
        actualizarPedido,
        cobrarPedido,
        cobrarMesa,
        anularPedido,
        crearPedido,
        crearPedidoDirectoMesa,
        agregarPlatoAlMenu,
        editarPlatoDelMenu,
        eliminarPlatoDelMenu,
        setOfflineMode,
        registrarTransaccionCaja,
        updateCajaEstados,
        cerrarCajaParcial,
        cerrarJornadaCompleta,
        updateConfig,
        updateMenu,
        updateTables,
        calcularCostosPedido,
        calcularCuotas
    } = useDb();

    // Login local state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Active tab
    const [activeTab, setActiveTab] = useState('orders');

    // Modales y Formularios en Admin
    const [isMesaModalOpen, setIsMesaModalOpen] = useState(false);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [mesaClientName, setMesaClientName] = useState('');
    const [mesaSelectedItems, setMesaSelectedItems] = useState({}); // { [platoId]: cantidad }

    // Modal Cobro
    const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
    const [cobroPedidoTarget, setCobroPedidoTarget] = useState(null);
    const [cobroMethod, setCobroMethod] = useState('Efectivo');

    // Modal Stock (CRUD)
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockModalType, setStockModalType] = useState('add'); // 'add' o 'edit'
    const [stockPlatoId, setStockPlatoId] = useState(null);
    const [stockNombre, setStockNombre] = useState('');
    const [stockPrecio, setStockPrecio] = useState('');
    const [stockCategoria, setStockCategoria] = useState('Principal');
    const [stockDescripcion, setStockDescripcion] = useState('');
    const [stockImagen, setStockImagen] = useState('');

    // Filtros
    const [cobranzaFilter, setCobranzaFilter] = useState('pendientes');

    // Calculador Cuotas Local
    const [calcMonto, setCalcMonto] = useState('');
    const [calcCuotas, setCalcCuotas] = useState(1);

    // Form Configuración
    const [confNombre, setConfNombre] = useState(config.restauranteNombre);
    const [confPhone, setConfPhone] = useState(config.whatsappPhone);
    const [confToken, setConfToken] = useState(config.whatsappToken);
    const [confCostoEnvio, setConfCostoEnvio] = useState(config.costoEnvio);
    const [confMontoGratis, setConfMontoGratis] = useState(config.montoEnvioGratis);
    const [confInteres, setConfInteres] = useState(config.interesCredito);

    // Modal Editar Pedido
    const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
    const [editOrderTarget, setEditOrderTarget] = useState(null);
    const [editOrderClientName, setEditOrderClientName] = useState('');
    const [editOrderDeliveryType, setEditOrderDeliveryType] = useState('retiro');
    const [editOrderMesa, setEditOrderMesa] = useState('1');
    const [editOrderItems, setEditOrderItems] = useState([]);

    // Reportes, PDF, Cierres y Gráficos
    const [chartPeriod, setChartPeriod] = useState('day'); // 'day', 'month', 'year'
    const [selectedCierreDetalle, setSelectedCierreDetalle] = useState(null);

    // Auto-login con ?demo=true
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('demo') === 'true') {
            loginWithAuth0('contacto@quincho.com', 'merchant', 'El Quincho Porteño', 'quincho');
            // Quitar query param de la URL
            navigate('/admin', { replace: true });
        }
    }, [location, loginWithAuth0, navigate]);

    // Validar aislamiento de tenant al iniciar
    useEffect(() => {
        if (currentUser) {
            validarAislamientoTenant();
        }
    }, [currentUser, activeRestaurant]);

    // Sincronizar form config
    useEffect(() => {
        setConfNombre(config.restauranteNombre);
        setConfPhone(config.whatsappPhone);
        setConfToken(config.whatsappToken);
        setConfCostoEnvio(config.costoEnvio);
        setConfMontoGratis(config.montoEnvioGratis);
        setConfInteres(config.interesCredito);
    }, [config]);

    // Manejar login
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (loginEmail === 'contacto@quincho.com' && loginPassword === 'quincho123') {
            loginWithAuth0('contacto@quincho.com', 'merchant', 'El Quincho Porteño', 'quincho');
        } else {
            alert("Credenciales incorrectas. Verifique el correo y la contraseña.");
        }
    };

    const handleDemoLogin = () => {
        loginWithAuth0('contacto@quincho.com', 'merchant', 'El Quincho Porteño', 'quincho');
    };

    // Si no está autenticado, renderizar Login
    if (!currentUser || currentUser.role !== 'merchant') {
        return (
            <div className="auth0-overlay">
                <div className="auth0-box">
                    <div className="auth0-header">
                        <span className="auth0-logo">⚡</span>
                        <h3>ComandaFlow Portal Admin</h3>
                        <p>Inicie sesión con su cuenta de comercio</p>
                    </div>
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>
                                Email del Administrador
                            </label>
                            <input 
                                type="email" 
                                required 
                                value={loginEmail} 
                                onChange={(e) => setLoginEmail(e.target.value)} 
                                placeholder="contacto@quincho.com" 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>
                                Contraseña
                            </label>
                            <input 
                                type="password" 
                                required 
                                value={loginPassword} 
                                onChange={(e) => setLoginPassword(e.target.value)} 
                                placeholder="••••••••" 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }} 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'white' }}>
                            Ingresar con Auth0 🔒
                        </button>
                    </form>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button type="button" className="btn btn-secondary btn-block" onClick={handleDemoLogin} style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', color: 'white', fontWeight: 'bold' }}>
                            Probar Demo (Acceso un Clic) 🚀
                        </button>
                    </div>
                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Local Demo: <code>contacto@quincho.com</code> / <code>quincho123</code></small>
                    </div>
                </div>
            </div>
        );
    }

    // Si está bloqueado por suscripción inactiva
    if (activeRestaurant.estado !== 'Activo') {
        return (
            <div className="saas-lock-screen" style={{ display: 'flex' }}>
                <div className="lock-card">
                    <span className="lock-icon">🔒</span>
                    <h2>Suscripción Inactiva</h2>
                    <p>El portal administrativo para <strong>{activeRestaurant.nombre}</strong> se encuentra temporalmente desactivado por falta de pago o suspensión manual.</p>
                    <div className="alert-box alert-warning margin-top-20">
                        <strong>Aviso:</strong> Para desbloquear el panel y reactivar tu carta digital QR, por favor realiza el pago de la suscripción mensual.
                    </div>
                    <div className="lock-actions">
                        <button onClick={() => navigate('/')} className="btn btn-primary btn-block">Pagar Suscripción en Landing 💳</button>
                        <button className="btn btn-secondary btn-block margin-top-10" onClick={logoutAuth0}>Cerrar Sesión / Cambiar Comercio</button>
                    </div>
                </div>
            </div>
        );
    }

    // LÓGICA DE SIMULAR PLATAFORMAS (PedidosYa / Rappi)
    const simularPedidoPlataforma = (plataforma) => {
        const menuDisponible = menu.filter(p => p.disponible);
        if (menuDisponible.length === 0) {
            alert("No hay platos disponibles en el menú para simular.");
            return;
        }

        const cantPlatos = Math.floor(1 + Math.random() * 3);
        const items = [];
        let sub = 0;
        
        for (let i = 0; i < cantPlatos; i++) {
            const plato = menuDisponible[Math.floor(Math.random() * menuDisponible.length)];
            const cant = Math.floor(1 + Math.random() * 2);
            
            if (!items.find(x => x.id === plato.id)) {
                items.push({
                    id: plato.id,
                    nombre: plato.nombre,
                    precio: plato.precio,
                    cantidad: cant
                });
                sub += plato.precio * cant;
            }
        }

        const idSimulado = Math.floor(1000 + Math.random() * 9000);
        
        const pedido = {
            nombre_cliente: `${plataforma} #${idSimulado}`,
            telefono_cliente: "+54 9 11 3333 4444",
            items: items,
            tipo_entrega: "envio",
            direccion_entrega: `Repartidor de ${plataforma} retira por local`,
            subtotal: sub,
            costo_envio: 0, 
            total: sub,
            metodo_pago: "debito", 
            financiacion: null,
            fecha_hora_entrega: "Lo antes posible",
            plataforma: plataforma.toLowerCase() 
        };

        crearPedido(pedido);
        alert(`¡Se simuló un pedido de ${plataforma} con éxito!`);
    };

    // ABRIR MESA MODAL (Salón)
    const abrirMesaModal = (mesa) => {
        setSelectedMesa(mesa);
        setMesaSelectedItems({});
        setMesaClientName('');
        setIsMesaModalOpen(true);
    };

    const handleAddItemToMesa = (platoId) => {
        setMesaSelectedItems(prev => ({
            ...prev,
            [platoId]: (prev[platoId] || 0) + 1
        }));
    };

    const handleRemoveItemFromMesa = (platoId) => {
        setMesaSelectedItems(prev => {
            const next = { ...prev };
            if (next[platoId] > 1) {
                next[platoId]--;
            } else {
                delete next[platoId];
            }
            return next;
        });
    };

    const handleCreateMesaPedido = () => {
        const selectedIds = Object.keys(mesaSelectedItems);
        if (selectedIds.length === 0) {
            alert("Seleccioná al menos un plato para abrir la mesa.");
            return;
        }

        const items = selectedIds.map(id => {
            const plato = menu.find(p => p.id === parseInt(id));
            return {
                id: plato.id,
                nombre: plato.nombre,
                precio: plato.precio,
                cantidad: mesaSelectedItems[id]
            };
        });

        crearPedidoDirectoMesa(selectedMesa.numero, items, mesaClientName);
        setIsMesaModalOpen(false);
    };

    const handleCobrarMesaDirect = (nroMesa) => {
        // Encontrar el pedido activo
        const mesa = tables.find(m => m.numero === nroMesa);
        if (!mesa || !mesa.pedido_activo) return;
        const ped = orders.find(o => o.id_pedido === mesa.pedido_activo);
        if (!ped) return;
        
        setCobroPedidoTarget(ped);
        setCobroMethod('Efectivo');
        setIsCobroModalOpen(true);
        setIsMesaModalOpen(false);
    };

    const handleConfirmarCobro = (e) => {
        e.preventDefault();
        if (!cobroPedidoTarget) return;

        cobrarPedido(cobroPedidoTarget.id_pedido, cobroMethod);
        setIsCobroModalOpen(false);
        setCobroPedidoTarget(null);
        alert("Pago registrado con éxito.");
    };

    // CRUD STOCK (Gestión de Menú)
    const abrirAddStockModal = () => {
        setStockModalType('add');
        setStockPlatoId(null);
        setStockNombre('');
        setStockPrecio('');
        setStockCategoria('Principal');
        setStockDescripcion('');
        setStockImagen('');
        setIsStockModalOpen(true);
    };

    const abrirEditStockModal = (plato) => {
        setStockModalType('edit');
        setStockPlatoId(plato.id);
        setStockNombre(plato.nombre);
        setStockPrecio(plato.precio);
        setStockCategoria(plato.categoria);
        setStockDescripcion(plato.descripcion);
        setStockImagen(plato.imagen || '');
        setIsStockModalOpen(true);
    };

    const handleSaveStock = (e) => {
        e.preventDefault();
        const payload = {
            nombre: stockNombre,
            precio: parseFloat(stockPrecio),
            categoria: stockCategoria,
            descripcion: stockDescripcion,
            imagen: stockImagen
        };

        if (stockModalType === 'add') {
            agregarPlatoAlMenu(payload);
            alert("Plato agregado correctamente.");
        } else {
            editarPlatoDelMenu({ id: stockPlatoId, ...payload });
            alert("Plato editado correctamente.");
        }
        setIsStockModalOpen(false);
    };

    // Guardar Configuración
    const handleSaveConfig = (e) => {
        e.preventDefault();
        const nextConfig = {
            restauranteNombre: confNombre,
            whatsappPhone: confPhone,
            whatsappToken: confToken,
            costoEnvio: parseFloat(confCostoEnvio),
            montoEnvioGratis: parseFloat(confMontoGratis),
            interesCredito: parseFloat(confInteres)
        };
        updateConfig(nextConfig);
        alert("Configuración del local guardada con éxito.");
    };

    // Funciones Editar Pedido
    const abrirEditarPedidoModal = (pedido) => {
        setEditOrderTarget(pedido);
        setEditOrderClientName(pedido.nombre_cliente);
        setEditOrderDeliveryType(pedido.tipo_entrega);
        setEditOrderMesa(pedido.nro_mesa || '1');
        setEditOrderItems([...pedido.items]);
        setIsEditOrderModalOpen(true);
    };

    const handleEditOrderAddItem = (plato) => {
        setEditOrderItems(prev => {
            const existing = prev.find(it => it.id === plato.id);
            if (existing) {
                return prev.map(it => it.id === plato.id ? { ...it, cantidad: it.cantidad + 1 } : it);
            } else {
                return [...prev, { id: plato.id, nombre: plato.nombre, precio: plato.precio, cantidad: 1 }];
            }
        });
    };

    const handleEditOrderRemoveItem = (platoId) => {
        setEditOrderItems(prev => {
            const existing = prev.find(it => it.id === platoId);
            if (!existing) return prev;
            if (existing.cantidad > 1) {
                return prev.map(it => it.id === platoId ? { ...it, cantidad: it.cantidad - 1 } : it);
            } else {
                return prev.filter(it => it.id !== platoId);
            }
        });
    };

    const handleSaveEditOrder = (e) => {
        e.preventDefault();
        if (editOrderItems.length === 0) {
            alert("El pedido debe contener al menos un plato.");
            return;
        }

        let subtotal = 0;
        editOrderItems.forEach(it => {
            subtotal += it.precio * it.cantidad;
        });

        const costos = calcularCostosPedido(subtotal, editOrderDeliveryType);

        const updatedFields = {
            nombre_cliente: editOrderClientName,
            tipo_entrega: editOrderDeliveryType,
            nro_mesa: editOrderDeliveryType === 'mesa' ? editOrderMesa : null,
            items: editOrderItems,
            subtotal: subtotal,
            costo_envio: costos.costoEnvio,
            total: costos.total
        };

        actualizarPedido(editOrderTarget.id_pedido, updatedFields);
        setIsEditOrderModalOpen(false);
        setEditOrderTarget(null);
        alert("Pedido actualizado con éxito.");
    };

    // -- EXPORTAR PDF / IMPRIMIR JORNADA ACTIVA --
    const handlePrintActiveJornada = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        let totalIngresos = 0;
        let totalEgresos = 0;
        let totalSalon = 0;
        let totalPlataformas = 0;
        let totalDirecto = 0;
        const metodoCounts = {};

        caja.forEach(tx => {
            const factor = tx.tipo === 'ingreso' ? 1 : -1;
            const monto = tx.monto * factor;
            
            if (tx.tipo === 'ingreso') totalIngresos += tx.monto;
            else totalEgresos += tx.monto;

            if (tx.canal === 'salon') totalSalon += monto;
            else if (tx.canal === 'plataformas') totalPlataformas += monto;
            else if (tx.canal === 'directo') totalDirecto += monto;

            const m = tx.metodoPago || 'Efectivo';
            metodoCounts[m] = (metodoCounts[m] || 0) + tx.monto;
        });

        const totalGeneral = totalSalon + totalPlataformas + totalDirecto;

        const txRowsHtml = caja.length === 0 
            ? '<tr><td colspan="6" style="text-align: center; color: #999; padding: 10px;">Sin movimientos activos hoy</td></tr>'
            : caja.map(tx => `
                <tr>
                    <td>${tx.fecha_hora.split(' ')[1] || tx.fecha_hora}</td>
                    <td style="text-transform: uppercase;">${tx.tipo}</td>
                    <td>${tx.descripcion}</td>
                    <td>${tx.metodoPago}</td>
                    <td style="text-transform: capitalize;">${tx.canal}</td>
                    <td style="text-align: right; color: ${tx.tipo === 'ingreso' ? '#2e7d32' : '#c62828'}">$${tx.monto.toLocaleString('es-AR')}</td>
                </tr>
            `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Cierre de Caja Diario - ComandaFlow</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; color: #111; padding: 20px; line-height: 1.4; }
                    .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 1.5rem; }
                    .header p { margin: 5px 0 0 0; font-size: 0.9rem; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-weight: bold; border-bottom: 1px dashed #333; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-size: 1rem; }
                    .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .summary-table td { padding: 5px 0; }
                    .summary-table td.right { text-align: right; }
                    .summary-table tr.total { font-weight: bold; border-top: 1px dashed #333; border-bottom: 1px dashed #333; }
                    .details-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
                    .details-table th, .details-table td { padding: 6px 4px; text-align: left; border-bottom: 1px solid #eee; }
                    .details-table th { border-bottom: 1px dashed #333; text-transform: uppercase; }
                    .footer { text-align: center; margin-top: 40px; border-top: 2px dashed #333; padding-top: 15px; font-size: 0.8rem; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${activeRestaurant.nombre}</h1>
                    <p>REPORTE DE JORNADA ACTIVA (PRE-CIERRE)</p>
                    <p>Fecha/Hora Emisión: ${new Date().toLocaleString('es-AR')}</p>
                </div>

                <div class="section">
                    <div class="section-title">Resumen Financiero</div>
                    <table class="summary-table">
                        <tr>
                            <td>Total Ingresos Caja:</td>
                            <td class="right">$${totalIngresos.toLocaleString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>Total Egresos/Retiros:</td>
                            <td class="right">-$${totalEgresos.toLocaleString('es-AR')}</td>
                        </tr>
                        <tr class="total">
                            <td>SALDO EN ARQUEO DE CAJA:</td>
                            <td class="right">$${totalGeneral.toLocaleString('es-AR')}</td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Participación por Canales</div>
                    <table class="summary-table">
                        <tr>
                            <td>🍽️ Caja Salón (Mesas):</td>
                            <td class="right">$${totalSalon.toLocaleString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>🛵 Caja Plataformas (PedidosYa/Rappi):</td>
                            <td class="right">$${totalPlataformas.toLocaleString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>🏪 Caja Venta Directa (Mostrador):</td>
                            <td class="right">$${totalDirecto.toLocaleString('es-AR')}</td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Medios de Pago Recaudados</div>
                    <table class="summary-table">
                        ${Object.keys(metodoCounts).length === 0 
                            ? '<tr><td colspan="2" style="text-align: center; color: #999;">Sin recaudaciones hoy</td></tr>'
                            : Object.entries(metodoCounts).map(([method, amount]) => `
                            <tr>
                                <td>💳 ${method}:</td>
                                <td class="right">$${amount.toLocaleString('es-AR')}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Libro de Caja - Detalle de Movimientos</div>
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Pago</th>
                                <th>Canal</th>
                                <th style="text-align: right;">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${txRowsHtml}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>ComandaFlow SaaS - Control Operativo Comercial</p>
                    <p>Firma Responsable Caja: ___________________________</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // -- EXPORTAR PDF / IMPRIMIR CIERRE HISTÓRICO --
    const handlePrintHistoricalCierre = (cierre) => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        const historicoTx = JSON.parse(localStorage.getItem('comandas_caja_historico')) || [];
        const txsCierre = historicoTx.filter(tx => tx.id_cierre === cierre.id_cierre);

        const txRowsHtml = txsCierre.length === 0
            ? '<tr><td colspan="6" style="text-align: center; color: #999; padding: 10px;">Sin movimientos detallados archivados</td></tr>'
            : txsCierre.map(tx => `
                <tr>
                    <td>${tx.fecha_hora.split(' ')[1] || tx.fecha_hora}</td>
                    <td style="text-transform: uppercase;">${tx.tipo}</td>
                    <td>${tx.descripcion}</td>
                    <td>${tx.metodoPago || 'Efectivo'}</td>
                    <td style="text-transform: capitalize;">${tx.canal}</td>
                    <td style="text-align: right; color: ${tx.tipo === 'ingreso' ? '#2e7d32' : '#c62828'}">$${tx.monto.toLocaleString('es-AR')}</td>
                </tr>
            `).join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>Cierre Consolidado #${cierre.id_cierre} - ComandaFlow</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; color: #111; padding: 20px; line-height: 1.4; }
                    .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 1.5rem; }
                    .header p { margin: 5px 0 0 0; font-size: 0.9rem; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-weight: bold; border-bottom: 1px dashed #333; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-size: 1rem; }
                    .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .summary-table td { padding: 5px 0; }
                    .summary-table td.right { text-align: right; }
                    .summary-table tr.total { font-weight: bold; border-top: 1px dashed #333; border-bottom: 1px dashed #333; }
                    .details-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
                    .details-table th, .details-table td { padding: 6px 4px; text-align: left; border-bottom: 1px solid #eee; }
                    .details-table th { border-bottom: 1px dashed #333; text-transform: uppercase; }
                    .footer { text-align: center; margin-top: 40px; border-top: 2px dashed #333; padding-top: 15px; font-size: 0.8rem; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${activeRestaurant.nombre}</h1>
                    <p>REPORTE DE CIERRE DIARIO CONSOLIDADO</p>
                    <p>Cierre ID: <strong>${cierre.id_cierre}</strong></p>
                    <p>Fecha/Hora de Cierre: ${cierre.fecha} ${cierre.hora}</p>
                </div>

                <div class="section">
                    <div class="section-title">Totales del Cierre</div>
                    <table class="summary-table">
                        <tr>
                            <td>🍽️ Facturación Salón (Mesas):</td>
                            <td class="right">$${cierre.total_salon.toLocaleString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>🛵 Facturación Plataformas:</td>
                            <td class="right">$${cierre.total_plataformas.toLocaleString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>🏪 Facturación Venta Directa:</td>
                            <td class="right">$${cierre.total_directo.toLocaleString('es-AR')}</td>
                        </tr>
                        <tr class="total">
                            <td>TOTAL CONSOLIDADO NETO:</td>
                            <td class="right">$${cierre.total_general.toLocaleString('es-AR')}</td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Libro Diario de Caja Archivada - Detalle</div>
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Pago</th>
                                <th>Canal</th>
                                <th style="text-align: right;">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${txRowsHtml}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>ComandaFlow SaaS - Control Histórico Contable</p>
                    <p>Firma Responsable Caja: ___________________________</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Estadísticas contables (Turno de caja activo y ventas)
    const ordersActivasNoAnuladas = orders.filter(o => o.estado !== 'Anulado');
    const ordersCobradas = ordersActivasNoAnuladas.filter(o => o.cobrado);
    
    const countPedidos = ordersActivasNoAnuladas.length;
    const countPedidosCobrados = ordersCobradas.length;
    
    // Total Facturado (Ventas cobradas)
    const totalFacturadoHoy = ordersCobradas.reduce((acc, o) => acc + o.total, 0);

    // Saldo en Arqueo de Caja Chica
    let totalCajaMonto = 0;
    caja.forEach(tx => {
        const factor = tx.tipo === 'ingreso' ? 1 : -1;
        totalCajaMonto += tx.monto * factor;
    });

    // Ticket promedio basado en ventas cobradas
    const ticketPromedio = countPedidosCobrados > 0 ? (totalFacturadoHoy / countPedidosCobrados) : 0;

    // Calcular distribución horaria para gráficos
    const horasCount = { almuerzo: 0, tarde: 0, cena_temprana: 0, cena_tarde: 0 };
    orders.forEach(p => {
        if (p.estado === 'Anulado') return;
        const timePart = p.fecha_hora.split(' ')[1];
        if (!timePart) return;
        const hour = parseInt(timePart.split(':')[0]);
        
        if (hour >= 11 && hour < 15) horasCount.almuerzo++;
        else if (hour >= 15 && hour < 20) horasCount.tarde++;
        else if (hour >= 20 && hour < 23) horasCount.cena_temprana++;
        else horasCount.cena_tarde++;
    });

    const maxHoras = Math.max(1, horasCount.almuerzo, horasCount.tarde, horasCount.cena_temprana, horasCount.cena_tarde);
    const hAlmPct = (horasCount.almuerzo / maxHoras) * 110;
    const hTarPct = (horasCount.tarde / maxHoras) * 110;
    const hCenTemPct = (horasCount.cena_temprana / maxHoras) * 110;
    const hCenTarPct = (horasCount.cena_tarde / maxHoras) * 110;

    // Ventas discriminadas por plato / ítem
    const itemsVentasDetalle = {};
    ordersCobradas.forEach(p => {
        p.items.forEach(it => {
            if (!itemsVentasDetalle[it.nombre]) {
                const menuItem = menu.find(m => m.nombre === it.nombre) || {};
                itemsVentasDetalle[it.nombre] = {
                    nombre: it.nombre,
                    categoria: menuItem.categoria || 'Principal',
                    cantidad: 0,
                    precioUnitario: it.precio || menuItem.precio || 0,
                    subtotal: 0
                };
            }
            itemsVentasDetalle[it.nombre].cantidad += it.cantidad;
            itemsVentasDetalle[it.nombre].subtotal += (it.precio || itemsVentasDetalle[it.nombre].precioUnitario) * it.cantidad;
        });
    });
    const listaItemsVentas = Object.values(itemsVentasDetalle).sort((a, b) => b.subtotal - a.subtotal);
    const totalRecaudadoProductos = listaItemsVentas.reduce((acc, it) => acc + it.subtotal, 0);

    // Top Platos (para compatibilidad)
    const topPlatos = listaItemsVentas.map(it => [it.nombre, it.cantidad]).slice(0, 5);

    // Filtrar cobranzas
    const matchCobranzas = orders.filter(o => {
        if (cobranzaFilter === 'pendientes') return !o.cobrado;
        if (cobranzaFilter === 'cobrados') return o.cobrado;
        return true; // todos
    });

    // Cuotas Local Calculador
    const calcCuotasResult = calcMonto ? calcularCuotas(parseFloat(calcMonto), parseInt(calcCuotas)) : null;

    return (
        <div className="admin-body">
            {/* Header / Navbar */}
            <nav className="navbar navbar-admin">
                <div className="nav-container">
                    <a href="#/admin" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logoImg} alt="ComandaFlow Logo" style={{ height: '32px', marginRight: '8px', objectFit: 'contain', borderRadius: '4px' }} />
                        <span>Panel Cocina & Administración <span className="rest-badge">{activeRestaurant.nombre}</span></span>
                        <span className={`network-badge ${offlineMode ? 'offline' : 'online'}`} style={{ marginLeft: '12px' }}>
                            {offlineMode ? '🔴 Modo Local (Offline)' : '🟢 En Línea'}
                        </span>
                    </a>
                    <div className="nav-actions">
                        <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm nav-link-home">
                            <span>Inicio 🏠</span>
                        </button>
                        <button onClick={() => navigate(`/menu/${activeRestaurant.id}`)} className="btn btn-secondary btn-sm nav-link-client">
                            <span>Ver Carta Digital 🍕</span>
                        </button>
                        <button onClick={logoutAuth0} className="btn btn-danger btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            Salir 🔒
                        </button>
                    </div>
                </div>
            </nav>

            {/* Pestañas */}
            <header className="admin-header-tabs">
                <div className="tabs-container">
                    <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Comandas 📋</button>
                    <button className={`admin-tab-btn ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>Salón & Mesas 🍽️</button>
                    <button className={`admin-tab-btn ${activeTab === 'cobranza' ? 'active' : ''}`} onClick={() => setActiveTab('cobranza')}>Cobranza 💳</button>
                    <button className={`admin-tab-btn ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>Gestión de Menú 🍔</button>
                    <button className={`admin-tab-btn ${activeTab === 'caja' ? 'active' : ''}`} onClick={() => setActiveTab('caja')}>Caja & Finanzas 📊</button>
                    <button className={`admin-tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>Configuración ⚙️</button>
                </div>
            </header>

            {/* Contenedor Vista Principal */}
            <main className="admin-container">
                
                {/* 1. COMANDAS KANBAN */}
                {activeTab === 'orders' && (
                    <section className="admin-tab-content active">
                        {/* Simulador Plataformas */}
                        <div className="simulator-panel">
                            <span>🛵 Simular Pedidos de Plataformas Externas:</span>
                            <button className="btn btn-peya btn-sm" onClick={() => simularPedidoPlataforma('PedidosYa')}>Simular PedidosYa 🛵</button>
                            <button className="btn btn-orange btn-sm" onClick={() => simularPedidoPlataforma('Rappi')}>Simular Rappi 🍊</button>
                            <button className={`btn btn-secondary btn-sm ${offlineMode ? 'offline' : ''}`} onClick={() => setOfflineMode(!offlineMode)} style={{ marginLeft: 'auto' }}>
                                {offlineMode ? '🔌 Restaurar Conexión' : '🔌 Simular Caída Internet'}
                            </button>
                        </div>

                        {/* Columnas Kanban */}
                        <div className="kanban-wrapper">
                            {['Pendiente', 'Confirmado', 'En Preparación', 'Listo para Entregar', 'En Camino', 'Entregado'].map(colState => {
                                const colOrders = orders.filter(o => o.estado === colState);
                                return (
                                    <div key={colState} className="kanban-column">
                                        <div className={`kanban-column-header col-${colState.toLowerCase().replace(/ /g, '-')}-h`}>
                                            <h3>{colState}</h3>
                                            <span className="column-count">{colOrders.length}</span>
                                        </div>
                                        <div className="kanban-cards-container">
                                            {colOrders.map(p => (
                                                <div key={p.id_pedido} className="kanban-card">
                                                    <div className="kanban-card-header">
                                                        <strong>#{p.id_pedido}</strong> 
                                                        <span>{p.tipo_entrega === 'envio' ? '🛵' : p.tipo_entrega === 'retiro' ? '🏪' : `🍽️ Mesa ${p.nro_mesa}`}</span>
                                                    </div>
                                                    <p style={{ margin: '8px 0', fontSize: '0.85rem' }}>
                                                        <strong>{p.nombre_cliente}</strong><br />
                                                        <small>{p.items.map(it => `${it.cantidad}x ${it.nombre}`).join(', ')}</small>
                                                    </p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                                                        <span>Total: <strong>${p.total.toLocaleString('es-AR')}</strong></span>
                                                        <span className={`status-badge ${p.cobrado ? 'status-available' : 'status-pending'}`} style={{ fontSize: '0.68rem', padding: '2px 5px' }}>
                                                            {p.cobrado ? 'Cobrado' : 'Impago'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Acciones */}
                                                    <div className="crud-actions" style={{ marginTop: '10px', gap: '5px' }}>
                                                        {colState !== 'Entregado' && (
                                                            <button 
                                                                className="btn btn-success btn-xs" 
                                                                onClick={() => {
                                                                    const states = ['Pendiente', 'Confirmado', 'En Preparación', 'Listo para Entregar', 'En Camino', 'Entregado'];
                                                                    const nextIdx = states.indexOf(colState) + 1;
                                                                    actualizarEstadoPedido(p.id_pedido, states[nextIdx]);
                                                                }}
                                                            >
                                                                Avanzar ▶
                                                            </button>
                                                        )}
                                                        {!p.cobrado && colState === 'Entregado' && (
                                                            <button className="btn btn-secondary btn-xs" onClick={() => { setCobroPedidoTarget(p); setCobroMethod('Efectivo'); setIsCobroModalOpen(true); }}>
                                                                Cobrar 💳
                                                            </button>
                                                        )}
                                                        {colState !== 'Entregado' && (
                                                            <button className="btn btn-secondary btn-xs" onClick={() => abrirEditarPedidoModal(p)}>
                                                                Editar 📝
                                                            </button>
                                                        )}
                                                        {colState !== 'Entregado' && (
                                                            <button className="btn btn-danger btn-xs" onClick={() => { if (confirm("¿Anular pedido?")) anularPedido(p.id_pedido); }}>
                                                                Anular ❌
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Logs de WhatsApp */}
                        <div className="admin-card" style={{ marginTop: '25px' }}>
                            <div className="admin-card-header-flex">
                                <h3>Simulador WhatsApp Cloud API Logs 📱</h3>
                                <button className="btn btn-secondary btn-xs" onClick={() => localStorage.setItem('comandas_wa_logs', JSON.stringify([]))}>Limpiar Logs</button>
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#fafafa', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', border: '1px solid #ddd' }}>
                                {waLogs.length === 0 ? (
                                    <div className="text-muted text-center">No hay registros de envío en el webhook.</div>
                                ) : (
                                    waLogs.map((log, idx) => (
                                        <div key={idx} style={{ marginBottom: '8px', borderBottom: '1px dashed #eee', paddingBottom: '5px' }}>
                                            <strong>[{new Date(log.timestamp).toLocaleTimeString()}] Pedido #{log.pedidoId} ({log.cliente})</strong> - {log.status}<br />
                                            <span style={{ color: '#2e7d32' }}>Mensaje: {log.mensaje}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. CONTROL DE MESAS */}
                {activeTab === 'tables' && (
                    <section className="admin-tab-content active">
                        <div className="admin-card">
                            <div className="admin-card-header-flex">
                                <h2>Control del Salón & Mesas 🍽️</h2>
                                <span className="tables-state-legend">
                                    <small><span className="legend-dot libre"></span> Libre</small>
                                    <small><span className="legend-dot ocupada"></span> Ocupada</small>
                                    <small><span className="legend-dot pidiendo"></span> Pidiendo Cuenta</small>
                                </span>
                            </div>
                            
                            <div className="mesas-grid">
                                {tables.map(mesa => {
                                    const mesaOrder = orders.find(o => o.id_pedido === mesa.pedido_activo);
                                    return (
                                        <div 
                                            key={mesa.id} 
                                            className={`mesa-card state-${mesa.estado.toLowerCase().replace(/ /g, '-')}`}
                                            onClick={() => abrirMesaModal(mesa)}
                                        >
                                            <div className="mesa-number">{mesa.numero}</div>
                                            <div className="mesa-details">
                                                {mesa.estado === 'Libre' ? (
                                                    <span>Mesa Libre</span>
                                                ) : (
                                                    <div>
                                                        <strong>{mesaOrder?.nombre_cliente || 'Ocupada'}</strong><br />
                                                        <span style={{ fontSize: '0.75rem' }}>${mesaOrder?.total.toLocaleString('es-AR') || '0'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. COBRANZA */}
                {activeTab === 'cobranza' && (
                    <section className="admin-tab-content active">
                        <div className="admin-card">
                            <div className="admin-card-header-flex">
                                <h2>Módulo de Cobranza y Cuentas Activas 💳</h2>
                                <select value={cobranzaFilter} onChange={(e) => setCobranzaFilter(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                    <option value="pendientes">Pendientes de Cobro</option>
                                    <option value="cobrados">Cobrados Recientemente</option>
                                    <option value="todos">Todos los Pedidos</option>
                                </select>
                            </div>
                            
                            <table className="admin-table margin-top-20" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee' }}>
                                        <th>Pedido</th>
                                        <th>Cliente</th>
                                        <th>Fecha / Hora</th>
                                        <th>Tipo Entrega</th>
                                        <th>Metodo Pago</th>
                                        <th>Monto</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchCobranzas.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center" style={{ padding: '20px', color: '#999' }}>No se encontraron transacciones.</td>
                                        </tr>
                                    ) : (
                                        matchCobranzas.map(p => (
                                            <tr key={p.id_pedido} style={{ borderBottom: '1px solid #eee' }}>
                                                <td><strong>#{p.id_pedido}</strong></td>
                                                <td>{p.nombre_cliente}</td>
                                                <td>{p.fecha_hora}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{p.tipo_entrega}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{p.metodo_pago}</td>
                                                <td><strong>${p.total.toLocaleString('es-AR')}</strong></td>
                                                <td>
                                                    <span className={`status-badge ${p.cobrado ? 'status-available' : 'status-pending'}`}>
                                                        {p.cobrado ? 'Cobrado' : 'Impago'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {!p.cobrado && (
                                                        <button className="btn btn-secondary btn-xs" onClick={() => { setCobroPedidoTarget(p); setCobroMethod('Efectivo'); setIsCobroModalOpen(true); }}>
                                                            Registrar Cobro 💳
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Calculador cuotas */}
                        <div className="admin-card" style={{ marginTop: '20px', maxWidth: '500px' }}>
                            <h3>Simulador Calculador de Cuotas de Crédito 💳</h3>
                            <div className="form-group" style={{ marginTop: '10px' }}>
                                <label>Monto Base</label>
                                <input type="number" value={calcMonto} onChange={(e) => setCalcMonto(e.target.value)} placeholder="Monto en ARS" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Cuotas</label>
                                <select value={calcCuotas} onChange={(e) => setCalcCuotas(parseInt(e.target.value))} className="form-control">
                                    <option value="1">1 pago sin recargo</option>
                                    <option value="3">3 cuotas con recargo</option>
                                    <option value="6">6 cuotas con recargo</option>
                                    <option value="12">12 cuotas con recargo</option>
                                </select>
                            </div>
                            {calcCuotasResult && (
                                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#4c1d95', marginTop: '10px' }}>
                                    <strong>{calcCuotas} pagos de ${calcCuotasResult.valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong><br />
                                    <span>Recargo total: {calcCuotasResult.interesAplicado}%. Total financiado: ${calcCuotasResult.totalFinanciado.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 4. GESTIÓN DE MENÚ */}
                {activeTab === 'stock' && (
                    <section className="admin-tab-content active">
                        <div className="admin-card">
                            <div className="admin-card-header-flex">
                                <h2>Gestión de Menú (CRUD) 🍔</h2>
                                <button className="btn btn-primary" onClick={abrirAddStockModal}>+ Agregar Plato al Menú</button>
                            </div>
                            
                            <table className="admin-table margin-top-20" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee' }}>
                                        <th>Imagen</th>
                                        <th>Plato</th>
                                        <th>Categoría</th>
                                        <th>Precio</th>
                                        <th>Estado Stock</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menu.map(plato => (
                                        <tr key={plato.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td>
                                                <img src={plato.imagen || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80'} 
                                                     alt={plato.nombre} 
                                                     style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                                            </td>
                                            <td>
                                                <strong>{plato.nombre}</strong><br />
                                                <small className="text-muted">{plato.descripcion}</small>
                                            </td>
                                            <td>{plato.categoria}</td>
                                            <td><strong>${plato.precio.toLocaleString('es-AR')}</strong></td>
                                            <td>
                                                <button 
                                                    className={`btn ${plato.disponible ? 'btn-success' : 'btn-danger'} btn-xs`}
                                                    onClick={() => {
                                                        const nextMenu = menu.map(p => p.id === plato.id ? { ...p, disponible: !p.disponible } : p);
                                                        updateMenu(nextMenu);
                                                    }}
                                                >
                                                    {plato.disponible ? 'Disponible' : 'Pausado'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="crud-actions">
                                                    <button className="btn btn-secondary btn-xs" onClick={() => abrirEditStockModal(plato)}>Editar</button>
                                                    <button className="btn btn-danger btn-xs" onClick={() => { if(confirm("¿Seguro de eliminar plato?")) eliminarPlatoDelMenu(plato.id); }}>Eliminar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* 5. CAJA Y FINANZAS */}
                {activeTab === 'caja' && (
                    <section className="admin-tab-content active">
                        {/* Canales Caja */}
                        <div className="admin-card">
                            <h3>Gestión Contable de Canales (Turnos Abiertos)</h3>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>
                                {['salon', 'plataformas', 'directo'].map(canal => (
                                    <div key={canal} style={{ background: '#fcfcfc', border: '1px solid #eee', padding: '12px 18px', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{canal === 'salon' ? '🍽️' : canal === 'plataformas' ? '🛵' : '🏪'}</span>
                                        <div>
                                            <h5 style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>Caja {canal === 'salon' ? 'Salón' : canal === 'plataformas' ? 'Plataformas' : 'Directa'}</h5>
                                            <button 
                                                className={`btn ${cajaEstados[canal] ? 'btn-danger' : 'btn-success'} btn-xs`}
                                                onClick={() => cerrarCajaParcial(canal)}
                                                disabled={cajaEstados[canal]}
                                                style={{ marginTop: '5px' }}
                                            >
                                                {cajaEstados[canal] ? 'Cerrada' : 'Cerrar Caja Parcial 🔒'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Métricas */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <div className="feature-card" style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>TOTAL FACTURADO</span>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>${totalFacturadoHoy.toLocaleString('es-AR')}</h2>
                            </div>
                            <div className="feature-card" style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>TICKET PROMEDIO</span>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>${Math.round(ticketPromedio).toLocaleString('es-AR')}</h2>
                            </div>
                            <div className="feature-card" style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>PEDIDOS COBRADOS</span>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{countPedidosCobrados}</h2>
                            </div>
                            <div className="feature-card" style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>ARQUEO DE CAJA CHICA</span>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>${totalCajaMonto.toLocaleString('es-AR')}</h2>
                            </div>
                        </div>

                        {/* Gráficos CSS */}
                        {(() => {
                            const dailyTotals = {};
                            for (let i = 6; i >= 0; i--) {
                                const d = new Date();
                                d.setDate(d.getDate() - i);
                                const dateStr = d.toLocaleDateString('es-AR');
                                dailyTotals[dateStr] = 0;
                            }
                            cierres.forEach(c => {
                                if (dailyTotals[c.fecha] !== undefined) {
                                    dailyTotals[c.fecha] += c.total_general;
                                }
                            });
                            const hoyStr = new Date().toLocaleDateString('es-AR');
                            if (dailyTotals[hoyStr] !== undefined) {
                                dailyTotals[hoyStr] += totalCajaMonto;
                            }
                            const maxDaily = Math.max(1, ...Object.values(dailyTotals));

                            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            const monthlyTotals = Array(12).fill(0);
                            cierres.forEach(c => {
                                const parts = c.fecha.split('/');
                                if (parts.length === 3) {
                                    const mIdx = parseInt(parts[1]) - 1;
                                    const y = parseInt(parts[2]);
                                    if (y === new Date().getFullYear() && mIdx >= 0 && mIdx < 12) {
                                        monthlyTotals[mIdx] += c.total_general;
                                    }
                                }
                            });
                            const mHoy = new Date().getMonth();
                            monthlyTotals[mHoy] += totalCajaMonto;
                            const maxMonthly = Math.max(1, ...monthlyTotals);

                            return (
                                <div className="financial-charts" style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                                    <div className="admin-card" style={{ flex: 1, minWidth: '300px' }}>
                                        <div className="admin-card-header-flex">
                                            <h4>Análisis de Ventas (Gráficos CSS)</h4>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button type="button" className={`btn btn-xs ${chartPeriod === 'day' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartPeriod('day')}>Día</button>
                                                <button type="button" className={`btn btn-xs ${chartPeriod === 'month' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartPeriod('month')}>Mes</button>
                                                <button type="button" className={`btn btn-xs ${chartPeriod === 'year' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartPeriod('year')}>Año</button>
                                            </div>
                                        </div>
                                        
                                        {chartPeriod === 'day' && (
                                            <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px', marginTop: '15px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{horasCount.almuerzo}</span>
                                                    <div style={{ width: '100%', height: `${Math.max(8, hAlmPct)}px`, background: 'linear-gradient(to top, var(--color-info), #60a5fa)', borderRadius: '4px 4px 0 0' }}></div>
                                                    <span style={{ fontSize: '0.72rem', marginTop: '4px', fontWeight: 'bold' }}>Almuerzo</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{horasCount.tarde}</span>
                                                    <div style={{ width: '100%', height: `${Math.max(8, hTarPct)}px`, background: 'linear-gradient(to top, var(--color-warning), #fbbf24)', borderRadius: '4px 4px 0 0' }}></div>
                                                    <span style={{ fontSize: '0.72rem', marginTop: '4px', fontWeight: 'bold' }}>Tarde</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{horasCount.cena_temprana}</span>
                                                    <div style={{ width: '100%', height: `${Math.max(8, hCenTemPct)}px`, background: 'linear-gradient(to top, var(--color-accent), #f59e0b)', borderRadius: '4px 4px 0 0' }}></div>
                                                    <span style={{ fontSize: '0.72rem', marginTop: '4px', fontWeight: 'bold' }}>Cena T.</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{horasCount.cena_tarde}</span>
                                                    <div style={{ width: '100%', height: `${Math.max(8, hCenTarPct)}px`, background: 'linear-gradient(to top, var(--color-primary), #f87171)', borderRadius: '4px 4px 0 0' }}></div>
                                                    <span style={{ fontSize: '0.72rem', marginTop: '4px', fontWeight: 'bold' }}>Cena O.</span>
                                                </div>
                                            </div>
                                        )}

                                        {chartPeriod === 'month' && (
                                            <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px', marginTop: '15px' }}>
                                                {Object.entries(dailyTotals).map(([dateStr, total]) => {
                                                    const dayLabel = dateStr.split('/')[0] + '/' + dateStr.split('/')[1];
                                                    const pct = (total / maxDaily) * 110;
                                                    return (
                                                        <div key={dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%' }}>
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>${Math.round(total/1000)}k</span>
                                                            <div style={{ width: '100%', height: `${Math.max(8, pct)}px`, background: 'linear-gradient(to top, var(--color-success), #4ade80)', borderRadius: '4px 4px 0 0' }}></div>
                                                            <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>{dayLabel}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {chartPeriod === 'year' && (
                                            <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px', marginTop: '15px' }}>
                                                {monthNames.map((name, idx) => {
                                                    const total = monthlyTotals[idx];
                                                    const pct = (total / maxMonthly) * 110;
                                                    return (
                                                        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '7%' }}>
                                                            {total > 0 && <span style={{ fontSize: '0.58rem', fontWeight: 700 }}>${Math.round(total/1000)}k</span>}
                                                            <div style={{ width: '100%', height: `${Math.max(8, pct)}px`, background: 'linear-gradient(to top, var(--color-primary), #60a5fa)', borderRadius: '4px 4px 0 0' }}></div>
                                                            <span style={{ fontSize: '0.62rem', marginTop: '4px', fontWeight: 'bold' }}>{name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Ventas discriminadas por plato / ítem */}
                                    <div className="admin-card" style={{ flex: 2, minWidth: '350px' }}>
                                        <h4>Ventas Discriminadas por Producto (Jornada Activa)</h4>
                                        <p className="admin-card-description" style={{ fontSize: '0.8rem', marginBottom: '10px' }}>Detalle de las unidades vendidas e ingresos generados por cada plato o bebida hoy.</p>
                                        <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee' }}>
                                                        <th style={{ textAlign: 'left', padding: '6px' }}>Producto</th>
                                                        <th style={{ textAlign: 'left', padding: '6px' }}>Categoría</th>
                                                        <th style={{ textAlign: 'center', padding: '6px' }}>Unidades</th>
                                                        <th style={{ textAlign: 'right', padding: '6px' }}>Precio</th>
                                                        <th style={{ textAlign: 'right', padding: '6px' }}>Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listaItemsVentas.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="text-center" style={{ padding: '15px', color: '#999' }}>No hay ventas registradas hoy.</td>
                                                        </tr>
                                                    ) : (
                                                        listaItemsVentas.map(it => (
                                                            <tr key={it.nombre} style={{ borderBottom: '1px solid #eee' }}>
                                                                <td style={{ padding: '6px' }}><strong>{it.nombre}</strong></td>
                                                                <td style={{ padding: '6px' }}><span className="status-badge" style={{ fontSize: '0.68rem', padding: '2px 4px' }}>{it.categoria}</span></td>
                                                                <td style={{ textAlign: 'center', padding: '6px' }}><strong>{it.cantidad} u.</strong></td>
                                                                <td style={{ textAlign: 'right', padding: '6px' }}>${it.precioUnitario.toLocaleString('es-AR')}</td>
                                                                <td style={{ textAlign: 'right', padding: '6px' }}><strong>${it.subtotal.toLocaleString('es-AR')}</strong></td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                                {listaItemsVentas.length > 0 && (
                                                    <tfoot>
                                                        <tr style={{ borderTop: '2px solid #eee', fontWeight: 'bold', backgroundColor: '#fafafa', fontSize: '0.85rem' }}>
                                                            <td colSpan="2" style={{ padding: '8px 6px' }}>TOTAL RECAUDADO (ÍTEMS)</td>
                                                            <td style={{ textAlign: 'center', padding: '8px 6px' }}>{listaItemsVentas.reduce((acc, it) => acc + it.cantidad, 0)} u.</td>
                                                            <td style={{ padding: '8px 6px' }}></td>
                                                            <td style={{ textAlign: 'right', padding: '8px 6px', color: '#2e7d32' }}>${totalRecaudadoProductos.toLocaleString('es-AR')}</td>
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Transacciones recientes */}
                        <div className="admin-card" style={{ marginTop: '20px' }}>
                            <div className="admin-card-header-flex">
                                <h3>Libro Diario de Caja Activa</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrintActiveJornada}>
                                        Exportar PDF / Imprimir Caja Activa 📄
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => { if(confirm("🚨 ATENCIÓN CIERRE DE JORNADA 🚨\n\n¿Estás seguro de que querés cerrar la jornada de hoy?\n\nEsto consolidará los totales, creará un cierre histórico y reseteará las comandas a $0.")) { cerrarJornadaCompleta(); alert("Jornada cerrada y archivada correctamente."); } }}>
                                        Cerrar Jornada Completa 🚪
                                    </button>
                                </div>
                            </div>
                            <table className="admin-table margin-top-15" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee' }}>
                                        <th>Hora</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                        <th>Medio Pago</th>
                                        <th>Canal</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {caja.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center" style={{ padding: '15px', color: '#999' }}>Caja chica vacía hoy.</td>
                                        </tr>
                                    ) : (
                                        caja.map(tx => (
                                            <tr key={tx.id} style={{ borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                                                <td>{tx.fecha_hora.split(' ')[1]}</td>
                                                <td>
                                                    <span className={`status-badge ${tx.tipo === 'ingreso' ? 'status-available' : 'status-unavailable'}`} style={{ textTransform: 'uppercase' }}>
                                                        {tx.tipo}
                                                    </span>
                                                </td>
                                                <td>{tx.descripcion}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{tx.metodoPago}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{tx.canal}</td>
                                                <td><strong style={{ color: tx.tipo === 'ingreso' ? '#2e7d32' : '#c62828' }}>${tx.monto.toLocaleString('es-AR')}</strong></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Historial de Cierres Consolidados */}
                        <div className="admin-card" style={{ marginTop: '20px' }}>
                            <h2>Historial de Cierres Consolidados (Jornadas Archivadas) 🏁</h2>
                            <p className="admin-card-description">Historial de cajas archivadas al cerrar la jornada laboral al final del día. Hacé clic en Imprimir para obtener la tira física en papel o exportarla como PDF.</p>
                            
                            <div className="table-responsive">
                                <table className="admin-table margin-top-15" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee' }}>
                                            <th>ID Cierre</th>
                                            <th>Fecha / Hora</th>
                                            <th>Salón 🍽️</th>
                                            <th>Plataformas 🛵</th>
                                            <th>Mostrador 🏪</th>
                                            <th>Total Neto</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cierres.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center" style={{ padding: '15px', color: '#999' }}>No hay registros de jornadas cerradas anteriormente.</td>
                                            </tr>
                                        ) : (
                                            cierres.map(c => (
                                                <tr key={c.id_cierre} style={{ borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                                                    <td><strong>#{c.id_cierre}</strong></td>
                                                    <td>{c.fecha} {c.hora}</td>
                                                    <td>${c.total_salon.toLocaleString('es-AR')}</td>
                                                    <td>${c.total_plataformas.toLocaleString('es-AR')}</td>
                                                    <td>${c.total_directo.toLocaleString('es-AR')}</td>
                                                    <td><strong>${c.total_general.toLocaleString('es-AR')}</strong></td>
                                                    <td>
                                                        <div className="crud-actions">
                                                            <button type="button" className="btn btn-secondary btn-xs" onClick={() => handlePrintHistoricalCierre(c)}>
                                                                Imprimir / PDF 🧾
                                                            </button>
                                                            <button type="button" className="btn btn-primary btn-xs" onClick={() => setSelectedCierreDetalle(c)}>
                                                                Ver Detalle 🔍
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* 6. CONFIGURACIÓN */}
                {activeTab === 'config' && (
                    <section className="admin-tab-content active">
                        <div className="admin-card" style={{ maxWidth: '600px' }}>
                            <h2>Configuración General del Local ⚙️</h2>
                            <form onSubmit={handleSaveConfig} style={{ marginTop: '15px' }}>
                                <div className="form-group">
                                    <label>Nombre de Fantasía</label>
                                    <input type="text" value={confNombre} onChange={(e) => setConfNombre(e.target.value)} className="form-control" required />
                                </div>
                                <div className="form-group">
                                    <label>WhatsApp Móvil</label>
                                    <input type="text" value={confPhone} onChange={(e) => setConfPhone(e.target.value)} className="form-control" required />
                                </div>
                                <div className="form-group">
                                    <label>WhatsApp Cloud API Token (Simulado)</label>
                                    <input type="text" value={confToken} onChange={(e) => setConfToken(e.target.value)} className="form-control" required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Costo de Envío</label>
                                        <input type="number" value={confCostoEnvio} onChange={(e) => setConfCostoEnvio(e.target.value)} className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Monto Envío Gratis</label>
                                        <input type="number" value={confMontoGratis} onChange={(e) => setConfMontoGratis(e.target.value)} className="form-control" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Interés de Crédito Mensual (%)</label>
                                    <input type="number" value={confInteres} onChange={(e) => setConfInteres(e.target.value)} className="form-control" required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Guardar Cambios</button>
                            </form>
                        </div>
                    </section>
                )}
            </main>

            {/* MODAL MESA (SALÓN) */}
            {isMesaModalOpen && selectedMesa && (
                <div className="modal-overlay active">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>Mesa {selectedMesa.numero} - {selectedMesa.estado}</h2>
                            <button className="close-btn" onClick={() => setIsMesaModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {selectedMesa.estado === 'Libre' ? (
                                <div>
                                    <div className="form-group">
                                        <label>Nombre del Cliente (Opcional)</label>
                                        <input type="text" value={mesaClientName} onChange={(e) => setMesaClientName(e.target.value)} placeholder="Ej: Mesa Familia" className="form-control" />
                                    </div>
                                    <h4 className="margin-top-15">Agregar Platos al Consumo:</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
                                        {menu.map(plato => {
                                            const cant = mesaSelectedItems[plato.id] || 0;
                                            return (
                                                <div key={plato.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                                    <span>{plato.nombre} - <strong>${plato.precio.toLocaleString('es-AR')}</strong></span>
                                                    <div className="quantity-controls" style={{ transform: 'scale(0.85)' }}>
                                                        <button onClick={() => handleRemoveItemFromMesa(plato.id)}>-</button>
                                                        <span>{cant}</span>
                                                        <button onClick={() => handleAddItemToMesa(plato.id)}>+</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: '15px', textAlign: 'right' }}>
                                        <button className="btn btn-primary" onClick={handleCreateMesaPedido}>Abrir Mesa & Crear Comanda 🚀</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Ocupada o Pidiendo Cuenta */}
                                    {(() => {
                                        const activePed = orders.find(o => o.id_pedido === selectedMesa.pedido_activo);
                                        if (!activePed) return <div className="text-danger">Pedido no encontrado.</div>;
                                        return (
                                            <div>
                                                <p><strong>Cliente:</strong> {activePed.nombre_cliente}</p>
                                                <p><strong>Pedido ID:</strong> #{activePed.id_pedido}</p>
                                                <p><strong>Fecha/Hora de Apertura:</strong> {activePed.fecha_hora}</p>
                                                <h4 className="margin-top-15">Consumos cargados:</h4>
                                                <ul style={{ paddingLeft: '20px', marginTop: '5px', fontSize: '0.88rem' }}>
                                                    {activePed.items.map((it, idx) => (
                                                        <li key={idx}>{it.cantidad}x {it.nombre} - ${ (it.precio * it.cantidad).toLocaleString('es-AR') }</li>
                                                    ))}
                                                </ul>
                                                <h3 style={{ marginTop: '15px', fontWeight: '800' }}>Total Mesa: ${activePed.total.toLocaleString('es-AR')}</h3>
                                                
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                                    <button className="btn btn-secondary" onClick={() => handleCobrarMesaDirect(selectedMesa.numero)}>
                                                        Cobrar Cuenta 🧾
                                                    </button>
                                                    <button className="btn btn-danger" onClick={() => { if(confirm("¿Anular mesa y liberar?")) { anularPedido(selectedMesa.pedido_activo); setIsMesaModalOpen(false); } }}>
                                                        Anular Mesa ❌
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL COBRO */}
            {isCobroModalOpen && cobroPedidoTarget && (
                <div className="modal-overlay active" style={{ zIndex: 11000 }}>
                    <div className="modal-card" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Registrar Pago #{cobroPedidoTarget.id_pedido}</h2>
                            <button className="close-btn" onClick={() => { setIsCobroModalOpen(false); setCobroPedidoTarget(null); }}>&times;</button>
                        </div>
                        <form onSubmit={handleConfirmarCobro}>
                            <div className="modal-body">
                                <p><strong>Cliente:</strong> {cobroPedidoTarget.nombre_cliente}</p>
                                <p><strong>Monto Total a Cobrar:</strong> <strong style={{ fontSize: '1.2rem', color: '#2e7d32' }}>${cobroPedidoTarget.total.toLocaleString('es-AR')}</strong></p>
                                <div className="form-group" style={{ marginTop: '15px' }}>
                                    <label>Seleccioná Medio de Pago</label>
                                    <select value={cobroMethod} onChange={(e) => setCobroMethod(e.target.value)} className="form-control">
                                        <option value="Efectivo">Efectivo / Transferencia</option>
                                        <option value="Débito">Tarjeta de Débito</option>
                                        <option value="Crédito">Tarjeta de Crédito</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => { setIsCobroModalOpen(false); setCobroPedidoTarget(null); }}>Cancelar</button>
                                <button type="submit" className="btn btn-success">Confirmar Cobro 🟢</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL STOCK (Add/Edit) */}
            {isStockModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>{stockModalType === 'add' ? 'Agregar Nuevo Plato' : 'Editar Plato'}</h2>
                            <button className="close-btn" onClick={() => setIsStockModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveStock}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nombre del Plato *</label>
                                    <input type="text" required value={stockNombre} onChange={(e) => setStockNombre(e.target.value)} placeholder="Ej: Pizza Napolitana" className="form-control" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Precio (ARS) *</label>
                                        <input type="number" required value={stockPrecio} onChange={(e) => setStockPrecio(e.target.value)} placeholder="Ej: 5200" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Categoría *</label>
                                        <select value={stockCategoria} onChange={(e) => setStockCategoria(e.target.value)} className="form-control">
                                            <option value="Entrada">Entrada</option>
                                            <option value="Principal">Principal</option>
                                            <option value="Postre">Postre</option>
                                            <option value="Bebida">Bebida</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Descripción *</label>
                                    <textarea required value={stockDescripcion} onChange={(e) => setStockDescripcion(e.target.value)} placeholder="Detalle de los ingredientes..." className="form-control" rows="3" />
                                </div>
                                <div className="form-group">
                                    <label>URL Imagen del Plato</label>
                                    <input type="text" value={stockImagen} onChange={(e) => setStockImagen(e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="form-control" />
                                    <small className="form-hint">Si se deja vacío, se asignará una imagen ilustrativa por defecto.</small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                                                <button type="button" className="btn btn-secondary" onClick={() => setIsStockModalOpen(false)}>Cancelar</button>
                                                                <button type="submit" className="btn btn-primary">Guardar Plato</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}

                                            {/* MODAL EDITAR PEDIDO */}
                                            {isEditOrderModalOpen && editOrderTarget && (
                                                <div className="modal-overlay active" style={{ zIndex: 10500 }}>
                                                    <div className="modal-card" style={{ maxWidth: '600px', width: '90%' }}>
                                                        <div className="modal-header">
                                                            <h2>Editar Pedido #{editOrderTarget.id_pedido}</h2>
                                                            <button className="close-btn" onClick={() => { setIsEditOrderModalOpen(false); setEditOrderTarget(null); }}>&times;</button>
                                                        </div>
                                                        <form onSubmit={handleSaveEditOrder}>
                                                            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                                                                <div className="form-group">
                                                                    <label>Nombre del Cliente *</label>
                                                                    <input type="text" required value={editOrderClientName} onChange={(e) => setEditOrderClientName(e.target.value)} className="form-control" />
                                                                </div>
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Tipo de Entrega *</label>
                                                                        <select value={editOrderDeliveryType} onChange={(e) => setEditOrderDeliveryType(e.target.value)} className="form-control">
                                                                            <option value="mesa">🍽️ Mesa (Consumo en Salón)</option>
                                                                            <option value="retiro">🏪 Take Away / Retiro Local</option>
                                                                            <option value="envio">🛵 Delivery / Envío</option>
                                                                        </select>
                                                                    </div>
                                                                    {editOrderDeliveryType === 'mesa' && (
                                                                        <div className="form-group">
                                                                            <label>Número de Mesa *</label>
                                                                            <select value={editOrderMesa} onChange={(e) => setEditOrderMesa(e.target.value)} className="form-control">
                                                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                                                                                    <option key={num} value={num.toString()}>Mesa {num}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <h4 className="margin-top-15">Items en la Comanda:</h4>
                                                                <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px', background: '#fafafa', marginTop: '5px' }}>
                                                                    {editOrderItems.length === 0 ? (
                                                                        <div className="text-muted text-center" style={{ padding: '10px' }}>No hay platos en la comanda. Agrega algunos abajo.</div>
                                                                    ) : (
                                                                        editOrderItems.map(it => (
                                                                            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                                                                                <div>
                                                                                    <strong>{it.nombre}</strong><br/>
                                                                                    <small className="text-muted">${it.precio.toLocaleString('es-AR')} c/u</small>
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                    <span>Subtotal: <strong>${(it.precio * it.cantidad).toLocaleString('es-AR')}</strong></span>
                                                                                    <div className="quantity-controls" style={{ transform: 'scale(0.8)' }}>
                                                                                        <button type="button" onClick={() => handleEditOrderRemoveItem(it.id)}>-</button>
                                                                                        <span>{it.cantidad}</span>
                                                                                        <button type="button" onClick={() => {
                                                                                            const plato = menu.find(p => p.id === it.id);
                                                                                            if (plato) handleEditOrderAddItem(plato);
                                                                                        }}>+</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>

                                                                <h4 className="margin-top-20">Agregar otros platos del Menú:</h4>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '8px', marginTop: '5px' }}>
                                                                    {menu.filter(p => p.disponible).map(plato => (
                                                                        <div key={plato.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid #f9f9f9' }}>
                                                                            <span>{plato.nombre} - <strong>${plato.precio.toLocaleString('es-AR')}</strong></span>
                                                                            <button type="button" className="btn btn-secondary btn-xs" onClick={() => handleEditOrderAddItem(plato)}>
                                                                                + Agregar
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div style={{ marginTop: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span>Subtotal: <strong>${editOrderItems.reduce((acc, it) => acc + (it.precio * it.cantidad), 0).toLocaleString('es-AR')}</strong></span>
                                                                    <span>Costo Envío: <strong>${calcularCostosPedido(editOrderItems.reduce((acc, it) => acc + (it.precio * it.cantidad), 0), editOrderDeliveryType).costoEnvio.toLocaleString('es-AR')}</strong></span>
                                                                    <span style={{ fontSize: '1.05rem' }}>Total: <strong>${calcularCostosPedido(editOrderItems.reduce((acc, it) => acc + (it.precio * it.cantidad), 0), editOrderDeliveryType).total.toLocaleString('es-AR')}</strong></span>
                                                                </div>
                                                            </div>
                                                            <div className="modal-footer">
                                                                <button type="button" className="btn btn-secondary" onClick={() => { setIsEditOrderModalOpen(false); setEditOrderTarget(null); }}>Cancelar</button>
                                                                <button type="submit" className="btn btn-primary">Guardar Cambios 💾</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}

            {/* MODAL DETALLE DE CIERRE HISTÓRICO */}
            {selectedCierreDetalle && (
                <div className="modal-overlay active" style={{ zIndex: 10500 }}>
                    <div className="modal-card" style={{ maxWidth: '700px', width: '90%' }}>
                        <div className="modal-header">
                            <h2>Movimientos Archivados - Cierre #{selectedCierreDetalle.id_cierre}</h2>
                            <button className="close-btn" onClick={() => setSelectedCierreDetalle(null)}>&times;</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#fafafa', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px', border: '1px solid #eee' }}>
                                <span>Fecha: <strong>{selectedCierreDetalle.fecha}</strong></span>
                                <span>Hora: <strong>{selectedCierreDetalle.hora}</strong></span>
                                <span>Total General: <strong style={{ color: '#2e7d32' }}>${selectedCierreDetalle.total_general.toLocaleString('es-AR')}</strong></span>
                            </div>
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee', fontSize: '0.8rem' }}>
                                        <th>Hora</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                        <th>Pago</th>
                                        <th>Canal</th>
                                        <th style={{ textAlign: 'right' }}>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const historicoTx = JSON.parse(localStorage.getItem('comandas_caja_historico')) || [];
                                        const filtered = historicoTx.filter(tx => tx.id_cierre === selectedCierreDetalle.id_cierre);
                                        if (filtered.length === 0) {
                                            return <tr><td colSpan="6" className="text-center" style={{ padding: '15px', color: '#999' }}>No se encontraron transacciones detalladas para este cierre.</td></tr>;
                                        }
                                        return filtered.map(tx => (
                                            <tr key={tx.id} style={{ borderBottom: '1px solid #eee', fontSize: '0.8rem' }}>
                                                <td>{tx.fecha_hora.split(' ')[1] || tx.fecha_hora}</td>
                                                <td><span className={`status-badge ${tx.tipo === 'ingreso' ? 'status-available' : 'status-unavailable'}`}>{tx.tipo}</span></td>
                                                <td>{tx.descripcion}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{tx.metodoPago || 'Efectivo'}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{tx.canal}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: tx.tipo === 'ingreso' ? '#2e7d32' : '#c62828' }}>${tx.monto.toLocaleString('es-AR')}</td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setSelectedCierreDetalle(null)}>Cerrar Ventana</button>
                            <button type="button" className="btn btn-primary" onClick={() => handlePrintHistoricalCierre(selectedCierreDetalle)}>
                                Imprimir / PDF 🧾
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
