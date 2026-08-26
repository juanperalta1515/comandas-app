import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDb, escaparHTML } from '../context/DbContext';
import logoImg from '../assets/logo.png';

function ClientMenu() {
    const navigate = useNavigate();
    const { restaurantId } = useParams(); // URL parameter: /menu/:restaurantId
    const { 
        menu, 
        config, 
        tables, 
        orders, 
        offlineMode, 
        offlineQueue, 
        crearPedido, 
        calcularCostosPedido, 
        calcularCuotas, 
        setOfflineMode, 
        updateOfflineQueue,
        resetearDemo,
        activeRestaurant
    } = useDb();

    // Estados Locales
    const [cart, setCart] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
    
    // Sesión de Mesa Activa
    const [sesionMesa, setSesionMesa] = useState(null); // { nro_mesa, id_pedido, estado_mesa }

    // Modales
    const [customModalOpen, setCustomModalOpen] = useState(false);
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [syncOverlayOpen, setSyncOverlayOpen] = useState(false);
    const [addedItemId, setAddedItemId] = useState(null);
    const [cartBouncing, setCartBouncing] = useState(false);

    // Personalización de Platos
    const [activeCustomPlato, setActiveCustomPlato] = useState(null);
    const [selectedTamanoIndex, setSelectedTamanoIndex] = useState(0);
    const [selectedAdicionales, setSelectedAdicionales] = useState({}); // { [index]: boolean }

    // Formulario de Checkout
    const [tipoEntrega, setTipoEntrega] = useState('retiro');
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteTelefono, setClienteTelefono] = useState('+54 9 ');
    const [clienteDireccion, setClienteDireccion] = useState('');
    const [clienteMesa, setClienteMesa] = useState('1');
    const [clienteAgenda, setClienteAgenda] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');

    // Datos Tarjeta
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardBank, setCardBank] = useState('Galicia');
    const [cardInstallments, setCardInstallments] = useState(1);

    // Éxito & Sincronización
    const [createdPedido, setCreatedPedido] = useState(null);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStatusText, setSyncStatusText] = useState('');

    // Auto-reset de base de datos si entra con ?demo=true en URL hash
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        if (queryParams.get('demo') === 'true') {
            resetearDemo();
            // Quitar query param de la URL
            navigate(`/menu/${restaurantId}`, { replace: true });
        }
    }, [restaurantId, navigate]);

    // Monitorear mesa activa en localStorage
    useEffect(() => {
        const comprobarSesionMesa = () => {
            const dataStr = localStorage.getItem('comandas_active_mesa');
            if (dataStr) {
                const data = JSON.parse(dataStr);
                const mesaData = tables.find(m => m.numero === parseInt(data.nro_mesa));
                if (mesaData && mesaData.estado !== 'Libre' && mesaData.pedido_activo === data.id_pedido) {
                    setSesionMesa({
                        nro_mesa: data.nro_mesa,
                        id_pedido: data.id_pedido,
                        estado: mesaData.estado
                    });
                    return;
                }
            }
            setSesionMesa(null);
        };
        comprobarSesionMesa();
    }, [tables]);

    const clientePedirCuenta = () => {
        if (!sesionMesa) return;
        const nextTables = tables.map(m => {
            if (m.numero === parseInt(sesionMesa.nro_mesa)) {
                return { ...m, estado: 'Pidiendo Cuenta' };
            }
            return m;
        });
        // La actualización de tables en localStorage se maneja actualizando a través de DbContext
        // pero podemos disparar una advertencia / confirmar mozo
        // Para simplificar, guardamos localmente y actualizamos el estado
        localStorage.setItem('comandas_tables', JSON.stringify(nextTables));
        window.dispatchEvent(new Event('tablesUpdated'));
        
        alert("¡Mozo llamado! Te traeremos la cuenta a la Mesa " + sesionMesa.nro_mesa + " en unos instantes. ¡Muchas gracias!");
    };

    // Agregar plato al carrito
    const agregarAlCarrito = (plato) => {
        if (!plato || !plato.disponible) {
            alert("Este plato no está disponible hoy.");
            return;
        }

        // Si tiene opciones, abrir modal de personalización
        const tieneOpciones = plato.opciones && (
            (plato.opciones.tamanos && plato.opciones.tamanos.length > 0) ||
            (plato.opciones.adicionales && plato.opciones.adicionales.length > 0)
        );

        if (tieneOpciones) {
            setActiveCustomPlato(plato);
            setSelectedTamanoIndex(0);
            setSelectedAdicionales({});
            setCustomModalOpen(true);
            return;
        }

        agregarPlatoAlCarritoDirecto(plato);
    };

    const agregarPlatoAlCarritoDirecto = (plato, opcionesSeleccionadas = null, precioFinal = null) => {
        let cartId = plato.id.toString();
        let nombreCompleto = plato.nombre;
        let precio = precioFinal !== null ? precioFinal : plato.precio;

        // Feedback visual del botón (solo si es agregado directo sin pasar por el modal de opciones)
        if (!opcionesSeleccionadas) {
            setAddedItemId(plato.id);
            setTimeout(() => setAddedItemId(null), 1200);
        }

        // Animación de rebote (bounce) en el carrito en el navbar
        setCartBouncing(true);
        setTimeout(() => setCartBouncing(false), 500);

        if (opcionesSeleccionadas) {
            const optString = JSON.stringify(opcionesSeleccionadas);
            cartId = plato.id + "_" + btoa(unescape(encodeURIComponent(optString))).substring(0, 8);
            
            const detalles = [];
            if (opcionesSeleccionadas.tamano) detalles.push(opcionesSeleccionadas.tamano.nombre);
            if (opcionesSeleccionadas.adicionales && opcionesSeleccionadas.adicionales.length > 0) {
                opcionesSeleccionadas.adicionales.forEach(a => detalles.push(a.nombre));
            }
            if (detalles.length > 0) {
                nombreCompleto = `${plato.nombre} (${detalles.join(', ')})`;
            }
        }

        setCart(prevCart => {
            const cartItem = prevCart.find(item => item.cartId === cartId);
            if (cartItem) {
                return prevCart.map(item => 
                    item.cartId === cartId ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            } else {
                return [...prevCart, {
                    cartId,
                    id: plato.id,
                    nombre: plato.nombre,
                    nombreCompleto,
                    precio,
                    cantidad: 1,
                    opciones: opcionesSeleccionadas
                }];
            }
        });
    };

    const modificarCantidad = (cartId, cambio) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.cartId === cartId) {
                    return { ...item, cantidad: item.cantidad + cambio };
                }
                return item;
            }).filter(item => item.cantidad > 0);
        });
    };

    const obtenerPrecioYSeleccionCustom = () => {
        if (!activeCustomPlato) return { precio: 0, seleccion: null };
        
        let total = activeCustomPlato.precio;
        const seleccion = {
            tamano: null,
            adicionales: []
        };
        
        if (activeCustomPlato.opciones?.tamanos?.length > 0) {
            const t = activeCustomPlato.opciones.tamanos[selectedTamanoIndex];
            seleccion.tamano = t;
            total += t.recargo;
        }
        
        activeCustomPlato.opciones?.adicionales?.forEach((a, i) => {
            if (selectedAdicionales[i]) {
                seleccion.adicionales.push(a);
                total += a.recargo;
            }
        });
        
        return { precio: total, seleccion };
    };

    const confirmarAdicionCustomPlato = () => {
        const { precio, seleccion } = obtenerPrecioYSeleccionCustom();
        agregarPlatoAlCarritoDirecto(activeCustomPlato, seleccion, precio);
        setCustomModalOpen(false);
        setActiveCustomPlato(null);
    };

    const handleAdicionalChange = (index, exclusivo, e) => {
        const checked = e.target.checked;
        setSelectedAdicionales(prev => {
            const next = { ...prev };
            if (exclusivo) {
                // Desmarcar otros adicionales exclusivos
                activeCustomPlato.opciones.adicionales.forEach((a, idx) => {
                    if (a.exclusivo) {
                        next[idx] = false;
                    }
                });
            }
            next[index] = checked;
            return next;
        });
    };

    // Cálculos Carrito
    const subtotal = cart.reduce((acc, curr) => acc + (curr.precio * curr.cantidad), 0);
    const totalCantidad = cart.reduce((acc, curr) => acc + curr.cantidad, 0);
    const costos = calcularCostosPedido(subtotal, tipoEntrega);
    const cuotasCalculo = calcularCuotas(costos.total, cardInstallments);

    const openCheckout = () => {
        setCartOpen(false);
        setCheckoutModalOpen(true);
    };

    const procesarPago = (e) => {
        e.preventDefault();

        if (!clienteTelefono.startsWith("+54")) {
            alert("Por favor ingrese el número de teléfono con el código de país. Ej: +54 9 11...");
            return;
        }

        let direccion = 'Retiro por local';
        if (tipoEntrega === 'envio') {
            direccion = clienteDireccion.trim();
        } else if (tipoEntrega === 'mesa') {
            direccion = `Consumo en Mesa ${clienteMesa}`;
        }

        let infoFinanciacion = null;
        if (metodoPago === 'credito') {
            infoFinanciacion = {
                cuotas: cardInstallments,
                valor_cuota: cuotasCalculo.valorCuota,
                total_financiado: cuotasCalculo.totalFinanciado,
                interes_aplicado: cuotasCalculo.interesAplicado
            };
        }

        const totalFinal = infoFinanciacion ? infoFinanciacion.total_financiado : costos.total;

        const pedido = {
            nombre_cliente: clienteNombre,
            telefono_cliente: clienteTelefono,
            items: cart,
            tipo_entrega: tipoEntrega,
            direccion_entrega: direccion,
            subtotal,
            costo_envio: costos.costoEnvio,
            total: totalFinal,
            metodo_pago: metodoPago,
            financiacion: infoFinanciacion,
            fecha_hora_entrega: clienteAgenda || 'Lo antes posible'
        };

        if (tipoEntrega === 'mesa') {
            pedido.nro_mesa = clienteMesa;
        }

        const nuevoPedido = crearPedido(pedido);

        // Si es mesa, guardar sesión local
        if (tipoEntrega === 'mesa') {
            localStorage.setItem('comandas_active_mesa', JSON.stringify({
                nro_mesa: clienteMesa,
                id_pedido: nuevoPedido.id_pedido
            }));
            // Forzar actualización de tablas
            window.dispatchEvent(new Event('tablesUpdated'));
        }

        setCheckoutModalOpen(false);
        setCart([]);
        setCreatedPedido(nuevoPedido);
        setSuccessModalOpen(true);
    };

    // Simulación Offline / Online
    const toggleSimularRed = () => {
        const isOff = offlineMode;
        if (isOff) {
            iniciarSincronizacionVisual();
        } else {
            setOfflineMode(true);
        }
    };

    const iniciarSincronizacionVisual = () => {
        setSyncOverlayOpen(true);
        setSyncProgress(0);
        setSyncStatusText('Buscando servidor...');

        setTimeout(() => {
            setSyncProgress(35);
            setSyncStatusText('Verificando cola local...');
            
            setTimeout(() => {
                setSyncProgress(70);
                setSyncStatusText(`Subiendo ${offlineQueue.length} comandas guardadas...`);
                
                if (offlineQueue.length > 0) {
                    offlineQueue.forEach(p => {
                        const syncPed = { ...p, esOffline: false, bypassOffline: true };
                        crearPedido(syncPed);
                    });
                    updateOfflineQueue([]);
                }
                
                setTimeout(() => {
                    setSyncProgress(100);
                    setSyncStatusText('¡Conexión restaurada y sincronizada! 🚀');
                    
                    setTimeout(() => {
                        setSyncOverlayOpen(false);
                        setOfflineMode(false);
                    }, 800);
                }, 1000);
            }, 1000);
        }, 1000);
    };

    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let parts = [];
        for (let i = 0; i < val.length && i < 16; i += 4) {
            parts.push(val.substring(i, i + 4));
        }
        setCardNumber(parts.join(' '));
    };

    const handleCardExpiryChange = (e) => {
        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setCardExpiry(val.substring(0, 5));
    };

    const itemsFiltrados = menu.filter(item => 
        categoriaSeleccionada === 'Todos' || item.categoria === categoriaSeleccionada
    );

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-container">
                    <a href="#/" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
                        {activeRestaurant?.logo && (activeRestaurant.logo.startsWith('http') || activeRestaurant.logo.startsWith('data:image')) ? (
                            <img src={activeRestaurant.logo} alt="Logo" style={{ height: '32px', width: '32px', marginRight: '8px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                            <span style={{ marginRight: '8px', fontSize: '1.4rem' }}>{activeRestaurant?.logo || '🍔'}</span>
                        )}
                        <span>{config.restauranteNombre}</span>
                        <span className={`network-badge ${offlineMode ? 'offline' : 'online'}`}>
                            {offlineMode ? '🔴 Modo Local (Offline)' : '🟢 En Línea'}
                        </span>
                    </a>
                    <div className="nav-actions">
                        <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm nav-link-home">
                            <span>Inicio 🏠</span>
                        </button>
                        <button onClick={() => navigate('/admin')} className="btn btn-secondary btn-sm nav-link-admin">
                            <span>Panel Cocina 🍳</span>
                        </button>
                        <button className={`cart-trigger ${cartBouncing ? 'cart-pop' : ''}`} onClick={() => setCartOpen(true)}>
                            <span className="cart-icon">🛒</span>
                            <span className="cart-badge">{totalCantidad}</span>
                        </button>
                        <button className={`btn btn-secondary btn-sm ${offlineMode ? 'offline' : ''}`} onClick={toggleSimularRed}>
                            {offlineMode ? '🔌 Conectar' : '🔌 Desconectar'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Banner */}
            <header className="hero-banner">
                <div className="hero-content">
                    <span className="hero-tagline">El verdadero sabor argentino</span>
                    <h1>¡Hacé tu pedido online!</h1>
                    <p>Comidas caseras listas para retirar o enviar directo a tu mesa.</p>
                </div>
            </header>

            {/* Mesa Activa floating banner */}
            {sesionMesa && (
                <div className="active-table-bar" style={{ display: 'flex' }}>
                    <div className="active-table-info">
                        <span>🍽️ Estás consumiendo en la <strong>Mesa {sesionMesa.nro_mesa}</strong></span>
                        <span className="order-id-hint">Pedido: {sesionMesa.id_pedido}</span>
                    </div>
                    <button className="btn btn-warning btn-sm" disabled={sesionMesa.estado === 'Pidiendo Cuenta'} onClick={clientePedirCuenta}>
                        {sesionMesa.estado === 'Pidiendo Cuenta' ? 'Llamando Mozo... 🔔' : 'Pedir la Cuenta 🧾'}
                    </button>
                </div>
            )}

            {/* Contenedor Menú */}
            <main className="main-container">
                <div className="categories-bar">
                    {['Todos', 'Entrada', 'Principal', 'Postre', 'Bebida'].map(cat => (
                        <button 
                            key={cat}
                            className={`category-btn ${categoriaSeleccionada === cat ? 'active' : ''}`}
                            onClick={() => setCategoriaSeleccionada(cat)}
                        >
                            {cat === 'Todos' ? 'Todos' : cat + 's'}
                        </button>
                    ))}
                </div>

                <section className="menu-grid">
                    {itemsFiltrados.length === 0 ? (
                        <p className="no-items">No hay platos disponibles en esta categoría.</p>
                    ) : (
                        itemsFiltrados.map(plato => (
                            <article key={plato.id} className={`menu-card ${!plato.disponible ? 'out-of-stock' : ''}`}>
                                <div className="card-image-container">
                                    <img src={plato.imagen || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80'} 
                                         alt={plato.nombre} 
                                         className="card-img" />
                                    <span className="category-badge">{plato.categoria}</span>
                                </div>
                                <div className="card-info">
                                    <div className="card-title-row">
                                        <h3 className="card-title">{plato.nombre}</h3>
                                        <span className={`status-indicator ${plato.disponible ? 'available' : 'unavailable'}`}></span>
                                    </div>
                                    <p className="card-desc">{plato.descripcion}</p>
                                    <div className="card-footer-row">
                                        <span className="card-price">${plato.precio.toLocaleString('es-AR')}</span>
                                        <button className={`btn btn-sm btn-add ${addedItemId === plato.id ? 'btn-added-feedback added-bounce' : 'btn-primary'}`} 
                                                disabled={!plato.disponible} 
                                                onClick={() => agregarAlCarrito(plato)}>
                                            {!plato.disponible ? 'Sin Stock 🚫' : (addedItemId === plato.id ? '¡Sumado! 🎉' : 'Agregar 🛒')}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </main>

            {/* Carrito Drawer Slide-out */}
            {cartOpen && (
                <div className="cart-overlay active" onClick={(e) => e.target.className.includes('cart-overlay') && setCartOpen(false)}>
                    <div className="cart-drawer">
                        <div className="cart-header">
                            <h2>Tu Pedido</h2>
                            <button className="close-btn" onClick={() => setCartOpen(false)}>&times;</button>
                        </div>
                        <div className="cart-body">
                            <div className="cart-items">
                                {cart.length === 0 ? (
                                    <div className="cart-empty">
                                        <span className="empty-emoji">🍕</span>
                                        <p>Tu carrito está vacío.</p>
                                        <p>Elegí algo rico para arrancar.</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.cartId} className="cart-item-row">
                                            <div className="cart-item-details">
                                                <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>{item.nombreCompleto}</h4>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                                    ${item.precio.toLocaleString('es-AR')} c/u
                                                </span>
                                            </div>
                                            <div className="cart-item-actions">
                                                <div className="quantity-controls">
                                                    <button onClick={() => modificarCantidad(item.cartId, -1)}>-</button>
                                                    <span>{item.cantidad}</span>
                                                    <button onClick={() => modificarCantidad(item.cartId, 1)}>+</button>
                                                </div>
                                                <span className="cart-item-total">
                                                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Entrega Options */}
                            <div className="delivery-section">
                                <h3>Método de Entrega</h3>
                                <div className="delivery-options">
                                    {['retiro', 'envio', 'mesa'].map(mode => {
                                        const emojis = { retiro: '🏪', envio: '🛵', mesa: '🍽️' };
                                        const titles = { retiro: 'Retiro en local', envio: 'Envío a domicilio', mesa: 'Comer en Mesa' };
                                        const prices = { retiro: 'Gratis', envio: `$${config.costoEnvio}`, mesa: 'Salón' };
                                        return (
                                            <label key={mode} className="delivery-card">
                                                <input type="radio" name="tipo_entrega" value={mode} checked={tipoEntrega === mode} onChange={(e) => setTipoEntrega(e.target.value)} />
                                                <div className="delivery-card-content">
                                                    <span className="delivery-emoji">{emojis[mode]}</span>
                                                    <span className="delivery-title">{titles[mode]}</span>
                                                    <span className="delivery-price">{prices[mode]}</span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Progreso Envío Gratis */}
                            {tipoEntrega === 'envio' && subtotal > 0 && (
                                <div className="free-shipping-progress" style={{ display: 'block' }}>
                                    <div className="progress-info">
                                        <span>
                                            {costos.envioGratis ? (
                                                <span>¡Felicidades! Lograste <strong>Envío GRATIS</strong> 🎉</span>
                                            ) : (
                                                <span>Sumá <strong>${costos.faltaParaGratis.toLocaleString('es-AR')}</strong> más para tener Envío GRATIS</span>
                                            )}
                                        </span>
                                        <span>{Math.round(Math.min(100, (subtotal / config.montoEnvioGratis) * 100))}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div className="progress-bar-fill" 
                                             style={{ 
                                                 width: `${Math.min(100, (subtotal / config.montoEnvioGratis) * 100)}%`,
                                                 backgroundColor: costos.envioGratis ? 'var(--color-success)' : 'var(--color-accent)'
                                             }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Resumen */}
                            <div className="cart-summary">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toLocaleString('es-AR')}</span>
                                </div>
                                {tipoEntrega === 'envio' && (
                                    <div className="summary-row">
                                        <span>Costo de Envío</span>
                                        <span className={costos.costoEnvio === 0 ? "text-success" : ""}>
                                            {costos.costoEnvio === 0 ? "GRATIS" : `$${costos.costoEnvio.toLocaleString('es-AR')}`}
                                        </span>
                                    </div>
                                )}
                                <hr />
                                <div className="summary-row total-row">
                                    <span>Total</span>
                                    <span>${costos.total.toLocaleString('es-AR')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="cart-footer">
                            <button className="btn btn-primary btn-block" disabled={cart.length === 0} onClick={openCheckout}>
                                Proceder al Pago 💳
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Personalizar Plato */}
            {customModalOpen && activeCustomPlato && (
                <div className="modal-overlay active">
                    <div className="modal-card" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2>Personalizar {activeCustomPlato.nombre}</h2>
                            <button className="close-btn" onClick={() => setCustomModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
                                <img src={activeCustomPlato.imagen || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80'} 
                                     alt={activeCustomPlato.nombre} 
                                     style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ marginBottom: '5px', fontWeight: 700, color: 'var(--color-text-main)' }}>{activeCustomPlato.nombre}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{activeCustomPlato.descripcion}</p>
                                </div>
                            </div>

                            {/* Opciones de tamaño */}
                            {activeCustomPlato.opciones?.tamanos?.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h5 style={{ marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>Seleccioná el tamaño (Obligatorio)</h5>
                                    {activeCustomPlato.opciones.tamanos.map((t, idx) => (
                                        <label key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input type="radio" name="custom-tamano" checked={selectedTamanoIndex === idx} onChange={() => setSelectedTamanoIndex(idx)} />
                                                <span>{t.nombre}</span>
                                            </span>
                                            <span style={{ fontWeight: 600 }}>${(activeCustomPlato.precio + t.recargo).toLocaleString('es-AR')}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Adicionales */}
                            {activeCustomPlato.opciones?.adicionales?.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h5 style={{ marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {activeCustomPlato.opciones.adicionales.some(a => a.exclusivo) ? 'Seleccioná una opción (Obligatorio)' : 'Adicionales / Extras (Opcional)'}
                                    </h5>
                                    {activeCustomPlato.opciones.adicionales.map((a, idx) => (
                                        <label key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input type={a.exclusivo ? "radio" : "checkbox"} 
                                                       name={a.exclusivo ? "exclusive-addon" : `addon-${idx}`}
                                                       checked={!!selectedAdicionales[idx]}
                                                       onChange={(e) => handleAdicionalChange(idx, a.exclusivo, e)} />
                                                <span>{a.nombre}</span>
                                            </span>
                                            <span style={{ fontWeight: 500, color: a.recargo > 0 ? 'inherit' : 'var(--color-success)' }}>
                                                {a.recargo > 0 ? `+ $${a.recargo.toLocaleString('es-AR')}` : 'Gratis'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
                            <div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Item:</span>
                                <strong style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                                    ${obtenerPrecioYSeleccionCustom().precio.toLocaleString('es-AR')}
                                </strong>
                            </div>
                            <button className="btn btn-primary" onClick={confirmarAdicionCustomPlato} style={{ padding: '10px 20px' }}>
                                Agregar al Carrito 🛒
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Checkout */}
            {checkoutModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>Finalizar Compra</h2>
                            <button className="close-btn" onClick={() => setCheckoutModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={procesarPago}>
                            <div className="modal-body">
                                <div className="form-section">
                                    <h3>1. Datos de Contacto</h3>
                                    <div className="form-group">
                                        <label>Nombre y Apellido *</label>
                                        <input type="text" required value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
                                    </div>
                                    <div className="form-group">
                                        <label>WhatsApp (Formato Argentino) *</label>
                                        <input type="tel" required value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} placeholder="Ej: +54 9 11 3245 6789" />
                                        <small className="form-hint">Debe incluir código de área sin el 15. Ej: +54 9 11...</small>
                                    </div>
                                    {tipoEntrega === 'envio' && (
                                        <div className="form-group">
                                            <label>Dirección de Entrega *</label>
                                            <input type="text" required value={clienteDireccion} onChange={(e) => setClienteDireccion(e.target.value)} placeholder="Ej: Av. Corrientes 1234, 4° B" />
                                        </div>
                                    )}
                                    {tipoEntrega === 'mesa' && (
                                        <div className="form-group">
                                            <label>Seleccioná tu Mesa *</label>
                                            <select value={clienteMesa} onChange={(e) => setClienteMesa(e.target.value)}>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i+1} value={i+1}>Mesa {i+1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {tipoEntrega !== 'mesa' && (
                                        <div className="form-group">
                                            <label>Programar Pedido (Opcional)</label>
                                            <input type="datetime-local" value={clienteAgenda} onChange={(e) => setClienteAgenda(e.target.value)} />
                                            <small className="form-hint">Dejalo en blanco para recibirlo lo antes posible.</small>
                                        </div>
                                    )}
                                </div>

                                <div className="form-section">
                                    <h3>2. Método de Pago</h3>
                                    <div className="payment-methods">
                                        {['efectivo', 'debito', 'credito'].map(method => {
                                            const labels = { efectivo: '💵 Efectivo / Trans.', debito: '💳 Débito', credito: '💳 Crédito' };
                                            return (
                                                <label key={method} className="payment-option">
                                                    <input type="radio" name="metodo_pago" value={method} checked={metodoPago === method} onChange={() => setMetodoPago(method)} />
                                                    <span>{labels[method]}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Formulario Tarjeta Seguro */}
                                    {metodoPago !== 'efectivo' && (
                                        <div className="card-details-form" style={{ display: 'block' }}>
                                            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.8rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                                                <div>
                                                    <strong>Conexión Encriptada Segura (SSL 256-bit)</strong><br />
                                                    Los datos de tu tarjeta se procesan en forma directa por la pasarela de pagos. Nunca se almacenan en el restaurante.
                                                </div>
                                            </div>
                                            <h4>Datos de la Tarjeta</h4>
                                            <div className="form-group">
                                                <label>Nombre del Titular (Como figura en la tarjeta)</label>
                                                <input type="text" required value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} placeholder="Ej: JUAN PEREZ" />
                                            </div>
                                            <div className="form-group">
                                                <label>Número de Tarjeta</label>
                                                <input type="text" required value={cardNumber} onChange={handleCardNumberChange} placeholder="4517 8400 0000 0000" maxLength="19" />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Vencimiento</label>
                                                    <input type="text" required value={cardExpiry} onChange={handleCardExpiryChange} placeholder="MM/AA" maxLength="5" />
                                                </div>
                                                <div className="form-group">
                                                    <label>CVV</label>
                                                    <input type="password" required value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))} placeholder="123" maxLength="4" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Banco Emisor</label>
                                                <select value={cardBank} onChange={(e) => setCardBank(e.target.value)}>
                                                    <option value="Galicia">Banco Galicia</option>
                                                    <option value="Santander">Banco Santander</option>
                                                    <option value="BBVA">Banco BBVA</option>
                                                    <option value="Macro">Banco Macro</option>
                                                    <option value="Provincia">Banco Provincia</option>
                                                    <option value="Nacion">Banco Nación</option>
                                                    <option value="Otro">Otro Banco / Digital</option>
                                                </select>
                                            </div>

                                            {/* Cuotas Crédito */}
                                            {metodoPago === 'credito' && (
                                                <div className="installments-section" style={{ display: 'block' }}>
                                                    <label>Cantidad de Cuotas</label>
                                                    <select value={cardInstallments} onChange={(e) => setCardInstallments(parseInt(e.target.value))}>
                                                        <option value="1">1 pago sin interés</option>
                                                        <option value="3">3 cuotas con interés</option>
                                                        <option value="6">6 cuotas con interés</option>
                                                        <option value="12">12 cuotas con interés</option>
                                                    </select>
                                                    <div className="installments-preview">
                                                        {cardInstallments === 1 ? (
                                                            <span><strong>1 cuota de ${costos.total.toLocaleString('es-AR')}</strong> (Total: ${costos.total.toLocaleString('es-AR')})</span>
                                                        ) : (
                                                            <span>
                                                                <strong>{cardInstallments} cuotas de ${cuotasCalculo.valorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong><br />
                                                                <span className="installments-hint">CFT: {cuotasCalculo.interesAplicado}% acumulado. Total financiado: ${cuotasCalculo.totalFinanciado.toLocaleString('es-AR')}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setCheckoutModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Confirmar Pedido 🚀</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Compra Exitosa */}
            {successModalOpen && createdPedido && (
                <div className="modal-overlay active">
                    <div className="modal-card success-card">
                        <div className="success-icon">🎉</div>
                        <h2>¡Pedido Recibido!</h2>
                        <p>Tu comanda ha sido enviada a la cocina.</p>
                        
                        <div className="order-details-box">
                            <p><strong>Pedido ID:</strong> {createdPedido.id_pedido}</p>
                            <p><strong>Cliente:</strong> {createdPedido.nombre_cliente}</p>
                            <p><strong>Teléfono:</strong> {createdPedido.telefono_cliente}</p>
                            <p><strong>Entrega:</strong> {createdPedido.tipo_entrega === 'envio' ? 'Envío a domicilio' : createdPedido.tipo_entrega === 'retiro' ? 'Retiro por local' : `Mesa ${createdPedido.nro_mesa} (Salón)`}</p>
                            <p><strong>Método de Pago:</strong> {createdPedido.metodo_pago === 'efectivo' ? 'Efectivo / Transferencia' : createdPedido.metodo_pago === 'debito' ? 'Tarjeta de Débito' : `Tarjeta de Crédito (${createdPedido.financiacion.cuotas} cuotas)`}</p>
                            <p className="order-total-success">Total: ${createdPedido.total.toLocaleString('es-AR')}</p>
                            {createdPedido.esOffline && (
                                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginTop: '15px', textAlign: 'left', fontSize: '0.82rem', color: '#ef4444', lineHeight: 1.4 }}>
                                    <strong>⚠️ Pedido Guardado en Modo Offline:</strong> Se ha guardado en la cola local de este dispositivo. Cuando vuelvas a estar en línea, se sincronizará automáticamente con la cocina.
                                </div>
                            )}
                        </div>

                        <div className="whatsapp-simulation-notification">
                            <p><strong>Simulación WhatsApp:</strong> Recibirás un mensaje de confirmación en breve en tu número registrado.</p>
                        </div>

                        <button className="btn btn-primary btn-block" onClick={() => setSuccessModalOpen(false)}>Seguir Comprando 🍕</button>
                    </div>
                </div>
            )}

            {/* Overlay Sincronización */}
            {syncOverlayOpen && (
                <div className="modal-overlay active" style={{ zIndex: 20000 }}>
                    <div className="modal-card sync-card" style={{ maxWidth: '380px', textAlign: 'center', padding: '2.5rem 2rem' }}>
                        <div className="sync-spinner" style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block', fontSize: '3rem' }}>🔄</div>
                        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 800, fontSize: '1.4rem' }}>Sincronizando...</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Conectando con el servidor y enviando comandas en cola...</p>
                        <div className="sync-progress-bar" style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ width: `${syncProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))', transition: 'width 0.3s ease' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{syncStatusText}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientMenu;
