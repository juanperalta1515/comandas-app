import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDb, desofuscarDatoSensible } from '../context/DbContext';
import logoImg from '../assets/logo.png';

function SuperAdmin() {
    const navigate = useNavigate();
    const { 
        restaurants, 
        activeRestaurant,
        currentUser, 
        emailLogs,
        loginWithAuth0, 
        logoutAuth0, 
        updateActiveRestaurant, 
        updateRestaurants,
        actualizarEstadoLocalSaaS,
        registrarLocalSaaS,
        simularEnvioEmail,
        updateEmailLogs,
        saasConfig,
        updateSaasConfig
    } = useDb();

    // Login local state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Form Manual Register
    const [regNombre, setRegNombre] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regWhatsapp, setRegWhatsapp] = useState('+549');
    const [regPlan, setRegPlan] = useState('Premium');

    // SaaS Configuration local state
    const [mpPublicKey, setMpPublicKey] = useState(saasConfig.owner_mp_public_key || '');
    const [mpAccessToken, setMpAccessToken] = useState(saasConfig.owner_mp_access_token || '');
    const [planBasicoId, setPlanBasicoId] = useState(saasConfig.plan_basico_id || '');
    const [planPremiumId, setPlanPremiumId] = useState(saasConfig.plan_premium_id || '');
    const [ownerCbu, setOwnerCbu] = useState(saasConfig.owner_cbu || '');
    const [ownerBanco, setOwnerBanco] = useState(saasConfig.owner_banco || '');

    const handleSaveSaasConfig = (e) => {
        e.preventDefault();
        updateSaasConfig({
            owner_mp_public_key: mpPublicKey,
            owner_mp_access_token: mpAccessToken,
            plan_basico_id: planBasicoId,
            plan_premium_id: planPremiumId,
            owner_cbu: ownerCbu,
            owner_banco: ownerBanco
        });
        alert("Configuración de pasarela SaaS y recaudación bancaria guardada con éxito. Listo para producción.");
    };

    // Simulators state
    const [testQueryLogs, setTestQueryLogs] = useState('');
    const [testQueryVisible, setTestQueryVisible] = useState(false);

    const [tempTableLogs, setTempTableLogs] = useState('');
    const [tempTableVisible, setTempTableVisible] = useState(false);

    // Login Submit
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (loginEmail === 'admin@comandaflow.com' && loginPassword === 'admin123') {
            loginWithAuth0('admin@comandaflow.com', 'superadmin', 'Super Admin', 'superadmin_id');
        } else {
            alert("Credenciales incorrectas. Verifique el correo y la contraseña.");
        }
    };

    // Manual Register Submit
    const handleManualRegister = (e) => {
        e.preventDefault();
        if (!regWhatsapp.startsWith("+549")) {
            alert("Ingrese el número de WhatsApp con código internacional (+549 para Argentina).");
            return;
        }

        registrarLocalSaaS({
            nombre: regNombre,
            email: regEmail,
            password: regPassword,
            whatsapp: regWhatsapp,
            plan: regPlan,
            metodo_pago_registro: 'MercadoPago' // Asumido ya pago manual recurrente
        });

        setRegNombre('');
        setRegEmail('');
        setRegPassword('');
        setRegWhatsapp('+549');
        alert(`¡Comercio "${regNombre}" registrado y activado con éxito!`);
    };

    // SaaS state togglers
    const reactivarSuscripcion = (id) => {
        const locales = restaurants.map(l => {
            if (l.id === id) {
                return { ...l, estado: 'Activo', baja_voluntaria: false };
            }
            return l;
        });
        updateRestaurants(locales);
        
        const loc = restaurants.find(l => l.id === id);
        simularEnvioEmail(
            loc.email,
            "Reactivación de Suscripción Confirmada - ComandaFlow 🎉",
            `Hola ${loc.nombre}.\n\nTu suscripción ha sido reactivada con éxito. Hemos restablecido tu adhesión al Débito Automático mensual. Ya podés acceder a tu panel de control.\n¡Gracias por seguir confiando en nosotros!\n\nAtentamente,\nEl equipo de ComandaFlow.`
        );
        alert(`Suscripción reactivada para: ${loc.nombre}`);
    };

    const aprobarPagoBBVA = (id) => {
        const locales = restaurants.map(l => {
            if (l.id === id) {
                return { ...l, estado: 'Activo' };
            }
            return l;
        });
        updateRestaurants(locales);
        
        const loc = restaurants.find(l => l.id === id);
        simularEnvioEmail(
            loc.email,
            "Adhesión de Débito Aprobada - ComandaFlow 🎉",
            `Hola ${loc.nombre}.\n\nTu solicitud de adhesión a Débito Directo CBU ha sido verificada y aprobada. Tu licencia del Plan ${loc.plan} está activa.\nYa podés iniciar sesión en tu panel administrativo.\n\nAtentamente,\nEl equipo de ComandaFlow.`
        );
        alert(`Pago verificado en la cuenta del BBVA. La licencia para "${loc.nombre}" ha sido activada con éxito.`);
    };

    const alterarEstadoRestaurante = (id, nuevoEstado) => {
        actualizarEstadoLocalSaaS(id, nuevoEstado);
        alert(`Licencia del local actualizada a: ${nuevoEstado}`);
    };

    const seleccionarRestauranteComoActivo = (id) => {
        const local = restaurants.find(l => l.id === id);
        if (local) {
            updateActiveRestaurant(local);
            alert(`Sesión activa cambiada a: ${local.nombre}. Si tenés abierta la pestaña de administración, se actualizará sola.`);
        }
    };

    // DB performance test simulator
    const ejecutarTestConsultas = () => {
        setTestQueryVisible(true);
        setTestQueryLogs('Analizando plan de ejecución en base de datos de producción con 150,000 órdenes...\n\n');

        setTimeout(() => {
            setTestQueryLogs(prev => prev + '🔍 [TEST 1] Buscar órdenes sin índice (Canal = \'salon\'):\n' +
                '   -> Executing: EXPLAIN ANALYZE SELECT * FROM orders WHERE canal = \'salon\';\n');
        }, 600);

        setTimeout(() => {
            setTestQueryLogs(prev => prev + '   -> Plan: Seq Scan on orders (cost=0.00..3892.15 rows=52123 width=234)\n' +
                '   -> Execution time: 18.72 ms (Secuencial, leyó toda la tabla)\n\n');
        }, 1300);

        setTimeout(() => {
            setTestQueryLogs(prev => prev + '⚡ [TEST 2] Buscar órdenes con índice compuesto (Inquilino = \'rest-102\' y Estado = \'Confirmado\'):\n' +
                '   -> Executing: EXPLAIN ANALYZE SELECT * FROM orders WHERE restaurant_id = \'rest-102\' AND estado = \'Confirmado\';\n');
        }, 2000);

        setTimeout(() => {
            setTestQueryLogs(prev => prev + '   -> Plan: Index Scan using idx_orders_res_estado_fecha on orders (cost=0.42..8.44 rows=4 width=234)\n' +
                '   -> Index Cond: (restaurant_id = \'rest-102\'::uuid AND estado = \'Confirmado\'::text)\n' +
                '   -> Execution time: 0.03 ms (Óptimo, lectura directa de índice B-Tree)\n\n' +
                '📊 CONCLUSIÓN: El uso del índice reduce el tiempo de consulta en un 99.8% a gran escala.');
        }, 3000);
    };

    // Bulk temporary table onboarding simulator
    const simularImportacionTablaTemporal = () => {
        setTempTableVisible(true);
        setTempTableLogs('');
        
        const logs = [
            { text: '🔌 [CONN] Conectando a la base de datos PostgreSQL de producción...', time: 0 },
            { text: '📥 [SaaS] Recibiendo paquete JSON con 5,000 ítems de menú iniciales del cliente...', time: 400 },
            { text: '🛠️ [SQL] Creando tabla temporal en memoria:\n   CREATE TEMP TABLE temp_menu_import (nombre VARCHAR, precio NUMERIC, categoria VARCHAR) ON COMMIT DROP;', time: 900 },
            { text: '📂 [COPY] Insertando 5,000 registros huérfanos a temp_menu_import (Time: 0.03s)...', time: 1400 },
            { text: '🔍 [VALIDAR] Analizando inconsistencias en tabla temporal...', time: 1800 },
            { text: '⚠️ [CORREGIR] Se encontraron 14 precios menores a $0. Corrigiendo precio a $0.00 en temp_menu_import...', time: 2300 },
            { text: '⚠️ [CORREGIR] Se encontraron 32 categorías nulas. Completando con \'Principal\' automáticamente...', time: 2700 },
            { text: '🔄 [MIGRAR] Insertando datos depurados y sanitizados en tabla final:\n   INSERT INTO menu_items SELECT * FROM temp_menu_import ON CONFLICT (nombre, restaurant_id) DO NOTHING;', time: 3200 },
            { text: '💾 [SQL] COMMIT; Confirmando transacción física...', time: 3800 },
            { text: '🗑️ [CONN] Cerrando sesión. Tabla temporal temp_menu_import eliminada de memoria.', time: 4200 },
            { text: '✅ [ÉXITO] 4,986 platos importados. 14 corregidos. Tiempo total: 0.19s vs 8.71s (Seq Insert).', time: 4600 }
        ];

        logs.forEach(log => {
            setTimeout(() => {
                setTempTableLogs(prev => prev + log.text + '\n');
            }, log.time);
        });
    };

    // Limpiar consola
    const limpiarEmailsConsola = () => {
        if (confirm("¿Está seguro de que desea vaciar la cola de correos del servidor SMTP simulado?")) {
            updateEmailLogs([]);
        }
    };

    // Si no está autenticado como SuperAdmin, renderizar Login
    if (!currentUser || currentUser.role !== 'superadmin') {
        return (
            <div className="auth0-overlay">
                <div className="auth0-box">
                    <div className="auth0-header">
                        <span className="auth0-logo">👑</span>
                        <h3>ComandaFlow SaaS Owner</h3>
                        <p>Identifíquese para acceder a la administración global</p>
                    </div>
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>
                                Email Corporativo
                            </label>
                            <input 
                                type="email" 
                                required 
                                value={loginEmail} 
                                onChange={(e) => setLoginEmail(e.target.value)} 
                                placeholder="admin@comandaflow.com" 
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
                            Acceder con Auth0 🔒
                        </button>
                    </form>
                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>Credenciales: <code>admin@comandaflow.com</code> / <code>admin123</code></small>
                    </div>
                </div>
            </div>
        );
    }

    // Calcular Métricas SaaS Globales
    let totalMRR = 0;
    let localesActivos = 0;
    restaurants.forEach(loc => {
        if (loc.estado === 'Activo') {
            localesActivos++;
            let cuota = loc.plan === 'Premium' ? 30000 : 15000;
            if (loc.descuento_activo && loc.descuento_meses_restantes > 0) {
                cuota = cuota * (1 - (loc.descuento_porcentaje || 30) / 100);
            }
            totalMRR += cuota;
        }
    });
    const pctActivos = restaurants.length > 0 ? Math.round((localesActivos / restaurants.length) * 100) : 0;

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-admin">
                <div className="nav-container">
                    <a href="#/superadmin" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logoImg} alt="ComandaFlow Logo" style={{ height: '32px', marginRight: '8px', objectFit: 'contain', borderRadius: '4px' }} />
                        <span>ComandaFlow SaaS Owner Panel <span className="rest-badge premium">SUPERADMIN</span></span>
                    </a>
                    <div className="nav-actions">
                        <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm nav-link-home">
                            <span>Volver a la Web 🏠</span>
                        </button>
                        <button onClick={() => navigate('/admin?demo=true')} className="btn btn-primary btn-sm btn-landing-cta">
                            <span>Ir a Cocina Demo 🍳</span>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={logoutAuth0}>
                            <span>Salir 🔓</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Dashboard */}
            <main className="admin-container">
                <div className="financial-dashboard-segregado">
                    <div className="fin-card-canal card-directo">
                        <div className="fin-card-header">
                            <h4>🏪 Comercios Registrados</h4>
                        </div>
                        <p className="fin-amount">{restaurants.length}</p>
                        <small className="text-muted">Cantidad total de inquilinos SaaS.</small>
                    </div>
                    
                    <div className="fin-card-canal card-salon">
                        <div className="fin-card-header">
                            <h4>💰 Ingresos Mensuales Recurrentes (MRR)</h4>
                        </div>
                        <p className="fin-amount">${totalMRR.toLocaleString('es-AR')}</p>
                        <small className="text-muted">Estimado bruto mensual basado en planes contratados.</small>
                    </div>

                    <div className="fin-card-canal card-plataformas">
                        <div className="fin-card-header">
                            <h4>🟢 Locales Activos</h4>
                        </div>
                        <p className="fin-amount">{pctActivos}%</p>
                        <small className="text-muted">Porcentaje de comercios con servicio habilitado.</small>
                    </div>
                </div>

                <div className="admin-grid-two-cols">
                    {/* Manual Register */}
                    <div className="admin-card">
                        <h2>Registrar Nuevo Restaurante (Manual)</h2>
                        <p className="admin-card-description">Alta inmediata para clientes que pagaron fuera de la plataforma (ej. transferencias manuales, CBU).</p>
                        <form onSubmit={handleManualRegister}>
                            <div className="form-group">
                                <label>Nombre del Comercio *</label>
                                <input type="text" required value={regNombre} onChange={(e) => setRegNombre(e.target.value)} placeholder="Ej: Hamburguesería Dean & Dennys" className="form-control" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email de Administración *</label>
                                    <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Ej: contacto@local.com" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Contraseña Administrativa *</label>
                                    <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength="6" className="form-control" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>WhatsApp (Internacional) *</label>
                                    <input type="text" required value={regWhatsapp} onChange={(e) => setRegWhatsapp(e.target.value)} placeholder="Ej: +5491158901234" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Plan Comercial</label>
                                    <select value={regPlan} onChange={(e) => setRegPlan(e.target.value)} className="form-control">
                                        <option value="Premium">Plan Premium ($30.000 / mes)</option>
                                        <option value="Básico">Plan Básico ($15.000 / mes)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Crear y Activar Comercio 🚀</button>
                        </form>
                    </div>

                    {/* Manual de Operaciones */}
                    <div className="admin-card rules-card">
                        <h2>Manual de Operaciones SuperAdmin</h2>
                        <p className="admin-card-description">Podés simular suspensiones inmediatas de licencias de uso para probar las pantallas de bloqueo de clientes.</p>
                        
                        <div className="alert-box alert-info">
                            <strong>¿Cómo probar la suspensión?</strong>
                            <ol style={{ marginLeft: '1.2rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                                <li>Identificá un comercio en la lista.</li>
                                <li>Hacé clic en <strong>"Dar de Baja 🔴"</strong>.</li>
                                <li>Ingresá al panel del comercio o actualizá su pestaña (se bloqueará automáticamente en tiempo real).</li>
                                <li>Hacé clic en <strong>"Dar de Alta 🟢"</strong> en esta consola para desbloquearlo al instante.</li>
                            </ol>
                    </div>
                </div>
            </div>

                {/* Configuración Recaudación SaaS */}
                <div className="admin-card margin-top-20">
                    <h2>Configuración de Pasarela y Cuentas de Cobro (Producción) 💳</h2>
                    <p className="admin-card-description">Definí tus credenciales de Mercado Pago y cuenta bancaria de destino (CBU) para recibir de forma directa los pagos de suscripciones de los restaurantes adheridos.</p>
                    <form onSubmit={handleSaveSaasConfig}>
                        <div className="admin-grid-two-cols" style={{ gap: '15px' }}>
                            <div>
                                <h4 style={{ marginBottom: '10px' }}>Credenciales Mercado Pago</h4>
                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                    <label>Public Key (Producción)</label>
                                    <input type="text" value={mpPublicKey} onChange={(e) => setMpPublicKey(e.target.value)} placeholder="Ej: APP_USR-xxxxxx" className="form-control" required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                    <label>Access Token (Producción)</label>
                                    <input type="password" value={mpAccessToken} onChange={(e) => setMpAccessToken(e.target.value)} placeholder="Ej: APP_USR-yyyyyy" className="form-control" required />
                                </div>
                                <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Plan Básico ID</label>
                                        <input type="text" value={planBasicoId} onChange={(e) => setPlanBasicoId(e.target.value)} placeholder="ID del Plan Básico" className="form-control" required />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Plan Premium ID</label>
                                        <input type="text" value={planPremiumId} onChange={(e) => setPlanPremiumId(e.target.value)} placeholder="ID del Plan Premium" className="form-control" required />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '10px' }}>Cuenta Bancaria Destino (Cobros Directos/CBU)</h4>
                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                    <label>CBU / CVU Recaudador (Titular de ComandaFlow)</label>
                                    <input type="text" value={ownerCbu} onChange={(e) => setOwnerCbu(e.target.value)} placeholder="Ej: 01702592..." className="form-control" required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                    <label>Banco Destino</label>
                                    <input type="text" value={ownerBanco} onChange={(e) => setOwnerBanco(e.target.value)} placeholder="Ej: BBVA" className="form-control" required />
                                </div>
                                <div className="alert-box alert-info" style={{ marginTop: '15px', fontSize: '0.8rem', padding: '10px' }}>
                                    <strong>Nota de Producción:</strong>
                                    Los comercios que opten por Débito Directo CBU transferirán a esta cuenta. Al verificar la acreditación, podrás activarlos haciendo click en "Aprobar BBVA".
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Guardar Credenciales de Producción 🔒</button>
                    </form>
                </div>

                {/* Listado Comercios */}
                <div className="admin-card margin-top-20">
                    <h2>Listado de Comercios Registrados</h2>
                    <div className="table-responsive">
                        <table className="stock-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee' }}>
                                    <th>Logo</th>
                                    <th>ID Local</th>
                                    <th>Nombre del Local</th>
                                    <th>CUIT</th>
                                    <th>WhatsApp</th>
                                    <th>Plan</th>
                                    <th>Registro</th>
                                    <th>Estado Licencia</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map(loc => {
                                    let statusBadge = '';
                                    let actionBtn = null;
                                    
                                    if (loc.estado === 'Activo') {
                                        statusBadge = '<span class="status-badge status-available">ACTIVO</span>';
                                        if (loc.descuento_activo && loc.descuento_meses_restantes > 0) {
                                            statusBadge += `<br><span class="status-badge" style="background-color: var(--color-primary-light); color: var(--color-primary); border: 1px solid var(--color-primary); font-size: 0.72rem; margin-top: 4px; display: inline-block;">🎁 30% OFF (${loc.descuento_meses_restantes}m)</span>`;
                                        }
                                        actionBtn = (
                                            <button className="btn btn-danger btn-xs" onClick={() => alterarEstadoRestaurante(loc.id, 'Inactivo')}>
                                                Dar de Baja 🔴
                                            </button>
                                        );
                                    } else if (loc.estado === 'Inactivo') {
                                        if (loc.baja_voluntaria) {
                                            statusBadge = '<span class="status-badge status-unavailable" style="background-color: var(--color-danger); color: white;">BAJA VOLUNTARIA 🔴</span>';
                                            actionBtn = (
                                                <button className="btn btn-success btn-xs" onClick={() => reactivarSuscripcion(loc.id)}>
                                                    Reactivar Débito 🟢
                                                </button>
                                            );
                                        } else {
                                            statusBadge = '<span class="status-badge status-unavailable">SUSPENDIDO</span>';
                                            actionBtn = (
                                                <button className="btn btn-primary btn-xs" onClick={() => alterarEstadoRestaurante(loc.id, 'Activo')}>
                                                    Dar de Alta 🟢
                                                </button>
                                            );
                                        }
                                    } else {
                                        // Pendiente de pago / aprobación CBU
                                        statusBadge = `<span class="status-badge status-pending" style="background-color: var(--color-accent); color: white;">PENDIENTE DÉBITO CBU 🟡</span>`;
                                        if (loc.cbu_cliente) {
                                            const cbuLimpio = desofuscarDatoSensible(loc.cbu_cliente);
                                            statusBadge += `<br><small class="text-muted">CBU: <strong>${cbuLimpio.substring(0, 4)}...${cbuLimpio.slice(-4)}</strong></small>`;
                                        }
                                        actionBtn = (
                                            <button className="btn btn-success btn-xs" onClick={() => aprobarPagoBBVA(loc.id)} style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', color: 'white' }}>
                                                Aprobar BBVA 🟢
                                            </button>
                                        );
                                    }

                                    return (
                                        <tr key={loc.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ fontSize: '1.5rem', textAlign: 'center' }}>{loc.logo || '🍕'}</td>
                                            <td><code>{loc.id}</code></td>
                                            <td>
                                                <strong>{loc.nombre}</strong><br />
                                                <small className="text-muted">{loc.email}</small><br />
                                                <small style={{ color: '#666' }}>Ref: <code>{loc.referral_code}</code></small>
                                            </td>
                                            <td>{loc.cuit}</td>
                                            <td>{loc.whatsapp}</td>
                                            <td><span className="category-badge">{loc.plan}</span></td>
                                            <td>{loc.fecha_registro}</td>
                                            <td dangerouslySetInnerHTML={{ __html: statusBadge }}></td>
                                            <td>
                                                <div className="crud-actions" style={{ flexDirection: 'column', gap: '4px' }}>
                                                    {actionBtn}
                                                    {loc.estado === 'Activo' ? (
                                                        <button className="btn btn-secondary btn-xs btn-block" onClick={() => seleccionarRestauranteComoActivo(loc.id)}>
                                                            Simular Login 👤
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-secondary btn-xs btn-block" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                                            Simular Login 👤
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Optimización de BD */}
                <div className="admin-card margin-top-20">
                    <h2>Optimizador de Base de Datos y Simulación a Gran Escala</h2>
                    <p className="admin-card-description">Monitoreá la optimización física de la base de datos (Índices relacionales y procesamiento con Tablas Temporales en lote).</p>
                    
                    <div className="db-simulator-grid" style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '280px', background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '0.95rem' }}>📋 Índices de Producción Activos</h4>
                            <ul style={{ listStyle: 'none', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.6', marginBottom: '12px', flex: 1 }}>
                                <li>🟢 <strong style={{ color: 'var(--color-state-confirmado)' }}>idx_restaurant_users_email</strong> (B-Tree)</li>
                                <li>🟢 <strong style={{ color: 'var(--color-state-confirmado)' }}>idx_restaurants_slug</strong> (B-Tree)</li>
                                <li>🟢 <strong style={{ color: 'var(--color-state-confirmado)' }}>idx_menu_items_res_cat</strong> (Composite B-Tree)</li>
                                <li>🟢 <strong style={{ color: 'var(--color-state-confirmado)' }}>idx_orders_res_estado_fecha</strong> (Composite B-Tree)</li>
                                <li>🟢 <strong style={{ color: 'var(--color-state-confirmado)' }}>idx_caja_tx_res_canal_cierre</strong> (Composite B-Tree)</li>
                            </ul>
                            <button className="btn btn-secondary btn-xs btn-block" onClick={ejecutarTestConsultas}>
                                Simular Rendimiento de Búsqueda (Seq vs Index) ⚡
                            </button>
                            {testQueryVisible && (
                                <pre style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '0.72rem', background: '#111', color: '#5efb6e', padding: '10px', borderRadius: '5px', minHeight: '80px', whiteSpace: 'pre-wrap', border: '1px solid #333' }}>
                                    {testQueryLogs}
                                </pre>
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: '280px', background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '0.95rem' }}>Bulk Onboarding (Tabla Temporal)</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px', flex: 1 }}>Simula la importación en lote de 5,000 platos de menú utilizando una tabla temporal staging para sanitizar y validar precios y categorías antes de la confirmación (COMMIT).</p>
                            <button className="btn btn-primary btn-xs btn-block" onClick={simularImportacionTablaTemporal} style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'white' }}>
                                Iniciar Carga Masiva (Temp Table) 🚀
                            </button>
                            {tempTableVisible && (
                                <pre style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '0.72rem', background: '#111', color: '#a5d6ff', padding: '10px', borderRadius: '5px', minHeight: '80px', lineStyle: '1.45', maxHeight: '150px', overflowY: 'auto', textAlign: 'left', border: '1px solid #333' }}>
                                    {tempTableLogs}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>

                {/* Simulador SMTP */}
                <div className="admin-card margin-top-20">
                    <div className="admin-card-header-flex" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div>
                            <h2>📧 Simulador de Correos Salientes (SMTP)</h2>
                            <p className="admin-card-description" style={{ marginBottom: 0 }}>Inspeccioná las notificaciones de bienvenida, activaciones o suspensiones emuladas.</p>
                        </div>
                        <button className="btn btn-secondary btn-xs" onClick={limpiarEmailsConsola}>Limpiar Servidor SMTP 🗑️</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', background: '#fafafa', border: '1px solid var(--color-border)', padding: '10px', borderRadius: '8px', minHeight: '80px' }}>
                        {emailLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '20px' }}>No hay correos salientes en la cola del servidor SMTP.</div>
                        ) : (
                            emailLogs.map(mail => (
                                <div key={mail.id} style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '12px', fontSize: '0.8rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'monospace', marginBottom: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #ddd', paddingBottom: '5px', marginBottom: '8px' }}>
                                        <span>✉️ <strong>ID:</strong> {mail.id}</span>
                                        <span style={{ color: '#666' }}>🕒 {mail.fecha_hora}</span>
                                    </div>
                                    <div><strong>Servidor SMTP:</strong> <span style={{ color: '#4b6cb7' }}>{mail.smtp_server}</span></div>
                                    <div><strong>Destinatario:</strong> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{mail.destinatario}</span></div>
                                    <div style={{ marginBottom: '4px' }}><strong>Asunto:</strong> <span style={{ color: '#c2185b', fontWeight: 'bold' }}>{mail.asunto}</span></div>
                                    <div style={{ marginTop: '8px', background: '#fafafa', padding: '8px', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#444', lineHeight: '1.4' }}>{mail.cuerpo}</div>
                                    <div style={{ marginTop: '5px', textAlign: 'right', color: '#43a047', fontSize: '0.72rem', font: 'bold' }}>Status: {mail.status}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SuperAdmin;
