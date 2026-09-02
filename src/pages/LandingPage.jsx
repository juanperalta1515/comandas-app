import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDb, desofuscarDatoSensible } from '../context/DbContext';
import logoImg from '../assets/logo.png';

function LandingPage() {
    const navigate = useNavigate();
    const { registrarLocalSaaS, loginWithAuth0, saasConfig } = useDb();

    // Modales y Steps
    const [referralModalOpen, setReferralModalOpen] = useState(false);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Datos, 2: Checkout, 3: Exito

    // Estado del Formulario
    const [selectedPlan, setSelectedPlan] = useState('Premium');
    const [nombre, setNombre] = useState('');
    const [cuit, setCuit] = useState('');
    const [whatsapp, setWhatsapp] = useState('+549');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estado del Pago
    const [paymentMethod, setPaymentMethod] = useState('MercadoPago');
    const [cbuNumber, setCbuNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdLocal, setCreatedLocal] = useState(null);

    const abrirModalSuscripcion = (plan = 'Premium') => {
        setSelectedPlan(plan);
        setReferralModalOpen(true);
    };

    const cerrarPromoReferido = () => {
        setReferralModalOpen(false);
    };

    const continuarAlRegistroSuscripcion = () => {
        setReferralModalOpen(false);
        setStep(1);
        setNombre('');
        setCuit('');
        setWhatsapp('+549');
        setEmail('');
        setPassword('');
        setCbuNumber('');
        setPaymentMethod('MercadoPago');
        setRegisterModalOpen(true);
    };

    const cerrarModalSuscripcion = () => {
        setRegisterModalOpen(false);
    };

    const irAPagoSuscripcion = (e) => {
        e.preventDefault();
        if (!whatsapp.startsWith("+549")) {
            alert("Ingrese el número de WhatsApp con código internacional (+549 para Argentina).");
            return;
        }
        setStep(2);
    };

    const procesarPagoSuscripcion = (e) => {
        e.preventDefault();
        
        const payload = {
            nombre,
            cuit,
            whatsapp,
            plan: selectedPlan,
            email,
            password
        };

        if (paymentMethod === 'CBU') {
            const ref = cbuNumber.trim();
            if (!ref || ref.length !== 22 || isNaN(ref)) {
                alert("Por favor, ingrese un número CBU/CVU bancario válido de 22 dígitos numéricos.");
                return;
            }
            payload.metodo_pago_registro = 'CBU';
            payload.cbu_cliente = ref;
            payload.comprobante_registro = 'Adhesión CBU: ' + ref.substring(0, 4) + '...' + ref.substring(18);
        } else {
            payload.metodo_pago_registro = 'MercadoPago';
            payload.cbu_cliente = '';
            payload.comprobante_registro = '';
        }

        setIsSubmitting(true);

        setTimeout(() => {
            // Registrar local en el localStorage mediante el contexto
            const nuevoLocal = registrarLocalSaaS(payload);
            setCreatedLocal(nuevoLocal);
            setStep(3);
            setIsSubmitting(false);

            if (paymentMethod === 'MercadoPago') {
                // Auto-login con JWT
                loginWithAuth0(nuevoLocal.email, 'merchant', nuevoLocal.nombre, nuevoLocal.id);
            }

            // Redirigir al panel tras 5.5 segundos para que copien el código
            setTimeout(() => {
                navigate('/admin');
            }, 5500);
        }, 1500);
    };

    const precioString = selectedPlan === 'Premium' ? '$30.000 / mes' : '$15.000 / mes';

    return (
        <div className="landing-body">
            {/* Navbar */}
            <nav className="navbar landing-navbar">
                <div className="nav-container">
                    <a href="#/" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logoImg} alt="ComandaFlow Logo" style={{ height: '32px', marginRight: '8px', objectFit: 'contain', borderRadius: '4px' }} />
                        <span className="brand-text">ComandaFlow</span>
                    </a>
                    <div className="nav-actions landing-nav-links">
                        <a href="#features" className="nav-link-landing">Características</a>
                        <a href="#pricing" className="nav-link-landing">Precios</a>
                        <button className="btn btn-secondary btn-sm" onClick={() => abrirModalSuscripcion('Premium')}>Registrar mi Local 🚀</button>
                        <button className="btn btn-primary btn-sm btn-landing-cta" onClick={() => navigate('/admin')}>Ingresar al Panel 🔐</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-bg-glow"></div>
                <div className="landing-hero-content">
                    <span className="hero-badge-pill">⚡ Acelerá un 80% tus pedidos</span>
                    <h1>El sistema de pedidos online y comandas para tu restaurante</h1>
                    <p>Automatizá las comandas de tu cocina en tiempo real, recibí pedidos directo por WhatsApp y gestioná tu stock en segundos. Sin pagar comisiones abusivas.</p>
                    
                    <div className="hero-cta-group">
                        <button onClick={() => navigate('/menu')} className="btn btn-primary btn-lg">
                            <span>Carta Digital Cliente 📱</span>
                        </button>
                        <button onClick={() => navigate('/admin')} className="btn btn-secondary btn-lg">
                            <span>Ingresar al Panel Cocina 🍳</span>
                        </button>
                    </div>
                </div>

                {/* CSS Device Mockup */}
                <div className="hero-mockup-container">
                    <div className="phone-mockup">
                        <div className="phone-speaker"></div>
                        <div className="phone-screen">
                            <div className="mock-nav">
                                <span>🍔 El Quincho Porteño</span>
                                <span className="mock-cart">🛒 <small className="mock-badge">2</small></span>
                            </div>
                            <div className="mock-hero"></div>
                            <div className="mock-categories">
                                <span className="mock-cat active">Todos</span>
                                <span className="mock-cat">Entradas</span>
                                <span className="mock-cat">Principales</span>
                            </div>
                            <div className="mock-list">
                                <div className="mock-item">
                                    <div className="mock-item-text">
                                        <h5>Pizza Especial</h5>
                                        <p>$6.500</p>
                                    </div>
                                    <span className="mock-btn-add">+</span>
                                </div>
                                <div className="mock-item">
                                    <div className="mock-item-text">
                                        <h5>Empanada Carne</h5>
                                        <p>$950</p>
                                    </div>
                                    <span className="mock-btn-add">+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kitchen Mockup (Kanban) */}
                    <div className="kitchen-mockup">
                        <div className="mock-kitchen-header">
                            <span>🍳 Panel Cocina (Comandas)</span>
                        </div>
                        <div className="mock-kanban">
                            <div className="mock-col">
                                <h6>Pendiente (1)</h6>
                                <div className="mock-card">
                                    <div className="mock-card-header">#PED-1934 🛵</div>
                                    <p>Juan P. • 2 platos</p>
                                    <span className="mock-badge-status ready">Avanzar ▶</span>
                                </div>
                            </div>
                            <div className="mock-col">
                                <h6>En Prep (1)</h6>
                                <div className="mock-card">
                                    <div className="mock-card-header">#PED-4820 🏪</div>
                                    <p>María L. • 3 platos</p>
                                    <span className="mock-badge-status in-prep">Preparando</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Logo Ribbon */}
            <section className="brand-ribbon-section">
                <div className="ribbon-title">Marcas gastronómicas que confían en ComandaFlow</div>
                <div className="logo-slider-container">
                    <div className="logo-slider-track">
                        <div className="logo-slide">🍕 Bella Italia</div>
                        <div className="logo-slide">🍔 Burger Zone</div>
                        <div className="logo-slide">🌮 Taco Loco</div>
                        <div className="logo-slide">🍣 Sushi Wave</div>
                        <div className="logo-slide">🥩 Parrilla Don Julio</div>
                        <div className="logo-slide">🍺 Beer Garden</div>
                        <div className="logo-slide">🧁 Sweet Palace</div>
                        <div className="logo-slide">🌯 Wrap & Roll</div>
                        {/* Duplicate */}
                        <div className="logo-slide">🍕 Bella Italia</div>
                        <div className="logo-slide">🍔 Burger Zone</div>
                        <div className="logo-slide">🌮 Taco Loco</div>
                        <div className="logo-slide">🍣 Sushi Wave</div>
                        <div className="logo-slide">🥩 Parrilla Don Julio</div>
                        <div className="logo-slide">🍺 Beer Garden</div>
                        <div className="logo-slide">🧁 Sweet Palace</div>
                        <div className="logo-slide">🌯 Wrap & Roll</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="landing-features">
                <div className="section-header">
                    <h2>Todo lo que necesitás para digitalizar tu negocio</h2>
                    <p>Diseñado especialmente para restaurantes, cafeterías, dark kitchens y locales de comida.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🍽️</div>
                        <h3>Gestión de Mesas y Salón</h3>
                        <p>Tus comensales escanean el QR, ordenan a su mesa y solicitan la cuenta. Tu staff gestiona los pedidos directamente e imprime tickets al instante.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Caja Segregada del Día</h3>
                        <p>Llevá tus ingresos en orden dividiendo tus flujos en Caja Salón, Caja Plataformas y Caja Venta Directa, con cierres de turno y reportes históricos.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🍳</div>
                        <h3>Tablero Kanban en Tiempo Real</h3>
                        <p>Un panel interactivo para la cocina. Controlá el stock de platos, editá precios o cargá nuevas recetas sobre la marcha desde el gestor de menú.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🖨️</div>
                        <h3>Comandera y Facturación AFIP</h3>
                        <p>Conectá tu tickeadora térmica. Generá facturas de cliente formato AFIP con CUIT/CAE e imprime comandas de cocina simplificadas.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Onboarding Instantáneo</h3>
                        <p>Suscribite en segundos. Registrá tu comercio, realiza tu pago en línea y accedé al asistente interactivo para configurar tu CBU y logo.</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="landing-pricing">
                <div className="section-header">
                    <h2>Planes simples y transparentes</h2>
                    <p>Comenzá hoy mismo sin contratos a largo plazo ni costos de instalación.</p>
                </div>

                <div className="pricing-cards-container">
                    <div className="pricing-card">
                        <h3>Plan Básico</h3>
                        <div className="price">$15.000 <span>/ mes</span></div>
                        <p className="plan-desc">Ideal para cafeterías o locales que recién comienzan.</p>
                        <ul className="plan-features">
                            <li>✔️ Menú Digital QR ilimitado</li>
                            <li>✔️ Pedidos directos a WhatsApp</li>
                            <li>✔️ Soporte por correo</li>
                            <li>❌ Panel Kanban de Cocina</li>
                            <li>❌ Caja Chica y Mesas</li>
                        </ul>
                        <button className="btn btn-secondary btn-block" onClick={() => abrirModalSuscripcion('Básico')}>Suscribirme hoy</button>
                    </div>

                    <div className="pricing-card popular">
                        <div className="popular-ribbon">MÁS ELEGIDO</div>
                        <h3>Plan Full Premium</h3>
                        <div className="price">$30.000 <span>/ mes</span></div>
                        <p className="plan-desc">Perfecto para restaurantes y cocinas con alto volumen de comandas.</p>
                        <ul className="plan-features">
                            <li>✔️ Menú Digital QR ilimitado</li>
                            <li>✔️ Panel Kanban de Cocina</li>
                            <li>✔️ Gestión de Salón y Mesas</li>
                            <li>✔️ Caja Segregada & Finanzas</li>
                            <li>✔️ WhatsApp Cloud API Integrada</li>
                            <li>✔️ Impresión de Comandas y Facturas</li>
                        </ul>
                        <button className="btn btn-primary btn-block" onClick={() => abrirModalSuscripcion('Premium')}>Suscribirme hoy 🚀</button>
                    </div>
                </div>
            </section>

            {/* Modal de Referidos */}
            {referralModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-card" style={{ maxWidth: '480px', textAlign: 'center' }}>
                        <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
                            <h2 style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🎉 ¡Promo Referidos! 🎁
                            </h2>
                            <button className="close-btn" onClick={cerrarPromoReferido} style={{ position: 'absolute', right: '20px' }}>&times;</button>
                        </div>
                        <div className="modal-body" style={{ padding: '2rem 1.5rem' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🍕</div>
                            <h3 style={{ marginBottom: '12px', fontWeight: 700, fontSize: '1.15rem', color: '#1a1a24' }}>¿Recomendás ComandaFlow a otro negocio?</h3>
                            <p style={{ fontSize: '0.92rem', color: '#52525b', lineHeight: 1.6, marginBottom: '20px' }}>
                                ¡Te regalamos un <strong>30% de descuento por 2 meses</strong> en tu abono mensual! 
                            </p>
                            <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', padding: '15px', borderRadius: '12px', textAlign: 'left', fontSize: '0.85rem', color: '#4c1d95', lineHeight: 1.5, marginBottom: '25px' }}>
                                <p style={{ marginBottom: '8px' }}><strong>¿Cómo activar el beneficio?</strong></p>
                                <ol style={{ marginLeft: '1.2rem', paddingLeft: 0 }}>
                                    <li style={{ marginBottom: '4px' }}>Registrá tu cuenta ahora y obtené tu <strong>código único</strong> de activación.</li>
                                    <li style={{ marginBottom: '4px' }}>Compartilo con el negocio que quieras recomendar.</li>
                                    <li>Una vez que se registren, ingresá el código de ellos en tu panel para activar tus <strong>2 meses al 30% OFF</strong>.</li>
                                </ol>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                <button className="btn btn-primary btn-block" onClick={continuarAlRegistroSuscripcion}>
                                    Registrar mi Local 🚀
                                </button>
                                <button className="btn btn-secondary btn-block" onClick={cerrarPromoReferido}>Más tarde</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Registro & Checkout */}
            {registerModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-card">
                        
                        {/* PASO 1: REGISTRO DE DATOS */}
                        {step === 1 && (
                            <div>
                                <div className="modal-header">
                                    <h2>Registrar mi Restaurante</h2>
                                    <button className="close-btn" onClick={cerrarModalSuscripcion}>&times;</button>
                                </div>
                                <form onSubmit={irAPagoSuscripcion}>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>Nombre de Fantasía del Local *</label>
                                            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Pizzería La Camorra" />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>CUIT de la Empresa *</label>
                                                <input type="text" required value={cuit} onChange={(e) => setCuit(e.target.value)} placeholder="Ej: 30-71589234-9" />
                                            </div>
                                            <div className="form-group">
                                                <label>WhatsApp (Formato internacional) *</label>
                                                <input type="text" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej: +5491132456789" />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email de Administración *</label>
                                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej: contacto@lacamorra.com" />
                                            </div>
                                            <div className="form-group">
                                                <label>Contraseña Administrativa *</label>
                                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength="6" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Plan Seleccionado</label>
                                            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                                                <option value="Premium">Plan Full Premium ($30.000 / mes)</option>
                                                <option value="Básico">Plan Básico ($15.000 / mes)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={cerrarModalSuscripcion}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary">Ir al Pago Mensual 💳</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* PASO 2: CHECKOUT MULTI-MÉTODO */}
                        {step === 2 && (
                            <div>
                                <div className="mp-checkout-header" style={{ backgroundColor: paymentMethod === 'MercadoPago' ? '#009ee3' : '#5c3ca5', color: 'white', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <span className="mp-logo-icon" style={{ fontSize: '1.2rem' }}>🔒</span>
                                    <span className="mp-logo-text" style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                                        {paymentMethod === 'MercadoPago' ? 'Débito Automático con Tarjeta' : 'Débito Directo por CBU'}
                                    </span>
                                </div>
                                <div className="modal-body bg-light-gray" style={{ paddingTop: '1rem' }}>
                                    <div className="mp-checkout-summary" style={{ background: '#f7f7f9', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                                        <h4 style={{ marginBottom: '5px', fontSize: '0.95rem' }}>Resumen de Compra</h4>
                                        <div className="mp-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span>Suscripción ComandaFlow - Plan {selectedPlan}</span>
                                            <strong>{precioString}</strong>
                                        </div>
                                    </div>
                                    
                                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.78rem', color: '#166534', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '1.1rem', marginTop: '-2px' }}>🛡️</span>
                                        <div>
                                            <strong>Pasarela Segura Tokenizada (PCI-DSS Compliant)</strong><br />
                                            Tus datos personales y de tarjeta de crédito están protegidos con encriptación AES-256 de extremo a extremo. Los cobros son delegados a procesadores bancarios directos sin almacenamiento de tarjeta, garantizando inmunidad ante robo de datos.
                                        </div>
                                    </div>

                                    {/* Selector de Método */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <button type="button" className={`btn btn-secondary btn-block ${paymentMethod === 'MercadoPago' ? 'active' : ''}`} 
                                                onClick={() => setPaymentMethod('MercadoPago')} 
                                                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', border: paymentMethod === 'MercadoPago' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', backgroundColor: paymentMethod === 'MercadoPago' ? 'var(--color-primary-light)' : 'transparent' }}>
                                            Débito Automático Tarjeta 💳
                                        </button>
                                        <button type="button" className={`btn btn-secondary btn-block ${paymentMethod === 'CBU' ? 'active' : ''}`} 
                                                onClick={() => setPaymentMethod('CBU')} 
                                                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', border: paymentMethod === 'CBU' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', backgroundColor: paymentMethod === 'CBU' ? 'var(--color-primary-light)' : 'transparent' }}>
                                            Débito Directo CBU 🏦
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={procesarPagoSuscripcion} style={{ marginTop: '1rem' }}>
                                        {paymentMethod === 'MercadoPago' ? (
                                            <div>
                                                <div className="form-group">
                                                    <label>Número de Tarjeta (Débito Recurrente)</label>
                                                    <input type="text" placeholder="4517 8400 0000 0000" disabled value="4517 **** **** 9082" />
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Vencimiento</label>
                                                        <input type="text" placeholder="MM/AA" disabled value="12/30" />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>CVC</label>
                                                        <input type="password" placeholder="123" disabled value="999" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ backgroundColor: '#f1f8ff', border: '1px solid #c8e1ff', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
                                                    <p style={{ marginBottom: '4px' }}><strong>Clearing Recaudador:</strong> {saasConfig.owner_banco} (CBU/CVU <code>{saasConfig.owner_cbu}</code>)</p>
                                                    <p style={{ marginBottom: '4px' }}><strong>Concepto:</strong> Adhesión a Débito Directo Recurrente</p>
                                                    <p><strong>Abono Mensual Recurrente:</strong> <strong className="text-success">{precioString} / mes</strong></p>
                                                </div>
                                                <div className="form-group">
                                                    <label>Ingresá tu CBU o CVU para el Débito *</label>
                                                    <input type="text" required value={cbuNumber} onChange={(e) => setCbuNumber(e.target.value)} placeholder="Ej: 01700123... (22 dígitos)" maxLength={22} minLength={22} />
                                                    <small className="form-hint" style={{ fontSize: '0.75rem' }}>Autorizás a ComandaFlow a cobrar la mensualidad debitándola automáticamente de esta cuenta.</small>
                                                </div>
                                            </div>
                                        )}

                                        <button type="submit" className="btn btn-mp btn-block" disabled={isSubmitting} style={{ marginTop: '15px', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', color: 'white' }}>
                                            {isSubmitting ? 'Procesando Registro... ⏳' : 'Confirmar y Pagar Suscripción 🔒'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* PASO 3: ÉXITO Y REDIRECCIÓN */}
                        {step === 3 && createdLocal && (
                            <div className="modal-body" style={{ textAlign: 'center' }}>
                                <div className="success-icon" style={{ fontSize: '4rem' }}>
                                    {paymentMethod === 'CBU' ? '⏳' : '🎉'}
                                </div>
                                <h2>{paymentMethod === 'CBU' ? '¡Débito Directo Adherido!' : '¡Suscripción de Débito Activa!'}</h2>
                                <p>{paymentMethod === 'CBU' ? 'Adhesión en proceso de clearing bancario.' : 'Tu local ya se encuentra activo en la plataforma.'}</p>
                                <div className="alert-box alert-info margin-top-20">
                                    {paymentMethod === 'CBU' ? (
                                        <div>
                                            <strong>CBU Registrado:</strong> Se ha ingresado la solicitud para la cuenta CBU <strong>{cbuNumber}</strong>.
                                            El SuperAdmin activará la licencia una vez confirmada la compensación en BBVA.<br /><br />
                                            🎁 <strong>Código de activación único para referir:</strong> <code style={{ fontSize: '1.1rem', padding: '4px 8px', background: '#e0f2fe', borderRadius: '4px', color: '#0369a1', fontWeight: 'bold' }}>{createdLocal.referral_code}</code><br />
                                            <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>Entregáselo al comercio que te recomendó para que active sus 2 meses de descuento.</small>
                                        </div>
                                    ) : (
                                        <div>
                                            <strong>¡Bienvenido!</strong> Serás redirigido a tu panel de control para realizar la configuración inicial de cobros y logotipo.<br /><br />
                                            🎁 <strong>Código de activación único para referir:</strong> <code style={{ fontSize: '1.1rem', padding: '4px 8px', background: '#f3e8ff', borderRadius: '4px', color: '#6b21a8', fontWeight: 'bold' }}>{createdLocal.referral_code}</code><br />
                                            <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>Entregáselo al comercio que te recomendó para que active sus 2 meses de descuento.</small>
                                        </div>
                                    )}
                                </div>
                                <div className="loading-spinner margin-top-20"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <p>&copy; 2026 ComandaFlow. Todos los derechos reservados. Desarrollado para el crecimiento de tu restaurante.</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
