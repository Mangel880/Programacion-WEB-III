import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRol, setUserRol] = useState(localStorage.getItem('userRol') || '');
  const [vista, setVista] = useState('login');
  const [mensaje, setMensaje] = useState('');
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [fortalezaPass, setFortalezaPass] = useState('');
  
  // Estados para instrumentos (CRUD)
  const [instrumentos, setInstrumentos] = useState([]);
  const [form, setForm] = useState({ nombre: '', tipo: '', precio: '', imagen: '' });
  const [editando, setEditando] = useState(null);
  
  // Estados para login/registro
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [registroEmail, setRegistroEmail] = useState('');
  const [registroPass, setRegistroPass] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(null);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState([]);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  // Estados para carrito de compras
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: token ? { Authorization: token } : {}
  });

  // Cargar instrumentos cuando hay token
  useEffect(() => {
    if (token && vista === 'dashboard') {
      cargarInstrumentos();
    }
  }, [token, vista]);

  const cargarInstrumentos = async () => {
    try {
      const res = await api.get('/instrumentos');
      setInstrumentos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const res = await api.get('/estadisticas');
      setEstadisticas(res.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const evaluarFortaleza = (password) => {
    if (!password) return '';
    let puntos = 0;
    if (password.length >= 6) puntos++;
    if (/[A-Z]/.test(password)) puntos++;
    if (/[0-9]/.test(password)) puntos++;
    if (/[^A-Za-z0-9]/.test(password)) puntos++;
    
    if (puntos <= 2) return 'débil';
    if (puntos === 3) return 'media';
    return 'fuerte';
  };

  const handleRegistroPass = (pass) => {
    setRegistroPass(pass);
    setFortalezaPass(evaluarFortaleza(pass));
  };

  const registrar = async () => {
    if (!registroEmail || !registroPass) {
      setMensaje('❌ Complete todos los campos');
      return;
    }
    try {
      const res = await api.post('/registro', { 
        email: registroEmail, 
        password: registroPass 
      });
      setMensaje(`✅ ¡Registro exitoso! Contraseña: ${res.data.fortaleza}`);
      setTimeout(() => {
        setMensaje('');
        setMostrarRegistro(false);
        setRegistroEmail('');
        setRegistroPass('');
        setFortalezaPass('');
      }, 3000);
    } catch (err) {
      setMensaje('❌ Error al registrar');
    }
  };

  const login = async () => {
    if (!loginEmail || !loginPass) {
      setMensaje('❌ Complete todos los campos');
      return;
    }
    
    if (!captchaToken) {
      setMensaje('❌ Complete el CAPTCHA');
      return;
    }
    
    try {
      const res = await api.post('/login', { 
        email: loginEmail, 
        password: loginPass, 
        captchaToken: captchaToken
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRol', res.data.usuario.rol);
      setToken(res.data.token);
      setUserRol(res.data.usuario.rol);
      setVista('dashboard');
      cargarInstrumentos();
      setMensaje('');
    } catch (err) {
      setMensaje('❌ Error: Usuario o contraseña incorrectos');
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
      setCaptchaToken('');
    }
  };

  const crearInstrumento = async () => {
    if (!form.nombre || !form.tipo || !form.precio) {
      setMensaje('❌ Complete todos los campos');
      return;
    }
    try {
      await api.post('/instrumentos', form);
      cargarInstrumentos();
      setForm({ nombre: '', tipo: '', precio: '', imagen: '' });
      setMensaje('✅ Instrumento agregado');
      setTimeout(() => setMensaje(''), 2000);
    } catch (err) {
      setMensaje('❌ Error al agregar');
    }
  };

  const eliminarLogico = async (id) => {
    try {
      await api.delete(`/instrumentos/${id}`);
      cargarInstrumentos();
      setMensaje('🗑️ Instrumento eliminado');
      setTimeout(() => setMensaje(''), 2000);
    } catch (err) {
      setMensaje('❌ Error al eliminar');
    }
  };

  const editarInstrumento = (inst) => {
    setEditando(inst);
    setForm({ 
      nombre: inst.nombre, 
      tipo: inst.tipo, 
      precio: inst.precio,
      imagen: inst.imagen || ''
    });
  };

  const actualizarInstrumento = async () => {
    if (!editando) return;
    try {
      await api.put(`/instrumentos/${editando.id}`, form);
      cargarInstrumentos();
      setEditando(null);
      setForm({ nombre: '', tipo: '', precio: '', imagen: '' });
      setMensaje('✅ Instrumento actualizado');
      setTimeout(() => setMensaje(''), 2000);
    } catch (err) {
      setMensaje('❌ Error al actualizar');
    }
  };

  const generarPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(145, 97, 205);
      doc.text('DARK MUSIC - Reporte de Instrumentos', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
      
      let y = 45;
      doc.setFontSize(10);
      
      doc.setFillColor(145, 97, 205);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, y - 5, 180, 8, 'F');
      doc.text('ID', 18, y);
      doc.text('Nombre', 40, y);
      doc.text('Tipo', 100, y);
      doc.text('Precio', 140, y);
      doc.text('Estado', 170, y);
      
      y += 8;
      doc.setTextColor(0, 0, 0);
      
      instrumentos.forEach(inst => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(inst.id.toString(), 18, y);
        doc.text(inst.nombre.substring(0, 25), 40, y);
        doc.text(inst.tipo, 100, y);
        doc.text(`$${inst.precio}`, 140, y);
        doc.text(inst.activo !== false ? 'Activo' : 'Eliminado', 170, y);
        y += 7;
      });
      
      y += 10;
      doc.text(`Total de instrumentos: ${instrumentos.length}`, 14, y);
      
      doc.save('dark-music-instrumentos.pdf');
      setMensaje('✅ PDF generado correctamente');
      setTimeout(() => setMensaje(''), 2000);
    }).catch(err => {
      console.error('Error cargando jsPDF:', err);
      setMensaje('❌ Error al cargar la librería PDF');
    });
  };

  // ============ FUNCIONES DEL CARRITO ============
  const agregarAlCarrito = (instrumento) => {
    setCarrito(prevCarrito => {
      const existe = prevCarrito.find(item => item.id === instrumento.id);
      if (existe) {
        return prevCarrito.map(item =>
          item.id === instrumento.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCarrito, { ...instrumento, cantidad: 1 }];
      }
    });
    setMensaje(`✅ ${instrumento.nombre} agregado al carrito`);
    setTimeout(() => setMensaje(''), 1500);
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
    }
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setMensaje('🗑️ Carrito vaciado');
    setTimeout(() => setMensaje(''), 1500);
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const cerrarSesion = async () => {
    try {
      await api.post('/logout');
    } catch (err) {}
    localStorage.removeItem('token');
    localStorage.removeItem('userRol');
    setToken(null);
    setUserRol('');
    setVista('login');
    setLoginEmail('');
    setLoginPass('');
    setCaptchaToken('');
  };

  // Función para obtener la imagen - PRIORIDAD: imagen de BD, luego mapeo por nombre
  const getImagen = (instrumento) => {
    // Si el instrumento tiene imagen guardada en BD, usarla
    if (instrumento.imagen && instrumento.imagen !== '/img/default.jpg') {
      return instrumento.imagen;
    }
    
    // Fallback: mapeo por nombre (para instrumentos existentes sin imagen)
    const nombreLower = instrumento.nombre.toLowerCase();
    if (nombreLower.includes('fender') || nombreLower.includes('stratocaster')) return '/img/fender.jpg';
    if (nombreLower.includes('pearl')) return '/img/Bateria.jpg';
    if (nombreLower.includes('yamaha') && nombreLower.includes('psr')) return '/img/Teclado.jpg';
    if (nombreLower.includes('ibanez')) return '/img/headles.jpg';
    if (nombreLower.includes('roland')) return '/img/bateriaElectrica.jpg';
    if (nombreLower.includes('c3x')) return '/img/piano.jpg';
    
    return '/img/default.jpg';
  };

  // ==================== PANTALLA DE LOGIN ====================
  if (vista === 'login') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="logo-section">
            <div className="logo-icon">🎸</div>
            <h1 className="logo-title">DARK MUSIC</h1>
            <p className="logo-subtitle">La mejor tienda de instrumentos musicales</p>
          </div>

          {mensaje && <div className={`mensaje-flotante ${mensaje.includes('✅') ? 'exito' : 'error'}`}>{mensaje}</div>}

          {!mostrarRegistro ? (
            <div className="form-section">
              <h2>Bienvenido</h2>
              <p className="form-desc">Ingresa a tu cuenta</p>
              
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input 
                  type="email"
                  placeholder="Correo electrónico" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input 
                  type="password"
                  placeholder="Contraseña" 
                  value={loginPass} 
                  onChange={e => setLoginPass(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey="6LcDexYtAAAAAEmptwkQVawWxGnk8NMC68tLj_w6"
                  onChange={(token) => setCaptchaToken(token)}
                />
              </div>

              <button className="btn-primary" onClick={login}>
                Ingresar
              </button>

              <p className="link-text">
                ¿No tienes cuenta?{' '}
                <span onClick={() => setMostrarRegistro(true)}>Regístrate aquí</span>
              </p>
            </div>
          ) : (
            <div className="form-section">
              <h2>Crear cuenta</h2>
              <p className="form-desc">Regístrate para comenzar</p>

              <div className="input-group">
                <span className="input-icon">📧</span>
                <input 
                  type="email"
                  placeholder="Correo electrónico" 
                  value={registroEmail} 
                  onChange={e => setRegistroEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input 
                  type="password"
                  placeholder="Contraseña" 
                  value={registroPass} 
                  onChange={e => handleRegistroPass(e.target.value)}
                />
              </div>

              {registroPass && (
                <div className="fortaleza-container">
                  <span className="fortaleza-label">Fortaleza:</span>
                  <div className={`fortaleza-barra ${fortalezaPass}`}>
                    <div className="barra-lleno"></div>
                  </div>
                  <span className={`fortaleza-texto ${fortalezaPass}`}>{fortalezaPass}</span>
                </div>
              )}

              <button className="btn-primary" onClick={registrar}>
                Registrarse
              </button>

              <p className="link-text">
                ¿Ya tienes cuenta?{' '}
                <span onClick={() => {
                  setMostrarRegistro(false);
                  setRegistroEmail('');
                  setRegistroPass('');
                  setFortalezaPass('');
                }}>Inicia sesión</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== PÁGINA PRINCIPAL ====================
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="wrap">
          <nav className="nav">
            <div className="logo">DARK MUSIC</div>
            <a href="#inicio" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>Inicio</a>
            <a href="#instrumentos" onClick={(e) => { e.preventDefault(); document.getElementById('instrumentos')?.scrollIntoView({ behavior: 'smooth' }); }}>Instrumentos</a>
            <a href="#galeria" onClick={(e) => { e.preventDefault(); document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' }); }}>Galería</a>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }); }}>Contacto</a>
            <button className="btn-carrito" onClick={() => setMostrarCarrito(true)}>
              🛒 Carrito ({carrito.reduce((sum, item) => sum + item.cantidad, 0)})
            </button>
            <button className="btn-logout-nav" onClick={cerrarSesion}>🚪 Cerrar sesión</button>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="wrap">
          <div className="hero-content">
            <h1 className="hero-title">Dark Music</h1>
            <div className="hero-underline"></div>
            <p className="hero-sub">La mejor tienda de instrumentos musicales con calidad profesional. Equipos seleccionados, atención experta y el sonido que buscas.</p>
            <a className="cta" href="#instrumentos" onClick={(e) => { e.preventDefault(); document.getElementById('instrumentos')?.scrollIntoView({ behavior: 'smooth' }); }}>Ver Instrumentos</a>
          </div>
        </div>
      </section>

      <section className="quienes">
        <div className="wrap">
          <h2 className="title">Pasión por la música</h2>
          <p>En <strong>DARK MUSIC</strong> nos dedicamos a proporcionar los mejores instrumentos musicales para músicos de todos los niveles. Desde principiantes hasta profesionales, encontrarás calidad, asesoramiento experto y precios competitivos. Tu viaje musical comienza aquí.</p>
        </div>
      </section>

      <section id="instrumentos" className="instrumentos-section">
        <div className="wrap">
          <h2 style={{ marginBottom: '18px', color: 'white' }}>Nuestros Instrumentos</h2>

          {/* Botones de PDF y estadísticas - SOLO ADMIN */}
          {userRol === 'admin' && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={generarPDF} style={{ background: 'linear-gradient(90deg, #f44336, #d32f2f)', width: 'auto' }}>
                📄 Generar Reporte PDF
              </button>
              <button className="btn-primary" onClick={() => {
                cargarEstadisticas();
                setMostrarGrafico(!mostrarGrafico);
              }} style={{ width: 'auto' }}>
                {mostrarGrafico ? '📊 Ocultar gráfico' : '📊 Mostrar gráfico estadístico'}
              </button>
            </div>
          )}

          {/* Panel CRUD - SOLO ADMIN */}
          {userRol === 'admin' && (
            <div className="form-agregar-instrumento">
              <h3>{editando ? '✏️ Editando instrumento' : '⚙️ Panel de Administración - Agregar instrumento'}</h3>
              <div className="form-grid-crud">
                <input 
                  placeholder="Nombre" 
                  value={form.nombre} 
                  onChange={e => setForm({...form, nombre: e.target.value})} 
                />
                <select 
                  value={form.tipo} 
                  onChange={e => setForm({...form, tipo: e.target.value})}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="guitarra">🎸 Guitarra</option>
                  <option value="bajo">🎸 Bajo</option>
                  <option value="batería">🥁 Batería</option>
                  <option value="teclado">🎹 Teclado</option>
                  <option value="piano">🎹 Piano</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Precio (USD)" 
                  value={form.precio} 
                  onChange={e => setForm({...form, precio: e.target.value})} 
                />
                <input 
                  placeholder="URL imagen (ej: /img/mi-instrumento.jpg)" 
                  value={form.imagen} 
                  onChange={e => setForm({...form, imagen: e.target.value})} 
                />
                {editando ? (
                  <button className="btn-actualizar" onClick={actualizarInstrumento}>✏️ Actualizar</button>
                ) : (
                  <button className="btn-agregar-crud" onClick={crearInstrumento}>➕ Agregar</button>
                )}
                {editando && <button className="btn-cancelar" onClick={() => { setEditando(null); setForm({ nombre: '', tipo: '', precio: '', imagen: '' }); }}>Cancelar</button>}
              </div>
            </div>
          )}

          {/* Panel de estadísticas - SOLO ADMIN */}
          {userRol === 'admin' && mostrarGrafico && (
            <div className="estadisticas-container" style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <h3 style={{ marginBottom: '20px', color: 'white' }}>📊 Estadísticas por tipo de instrumento</h3>
              {estadisticas.length > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Gráfico de Barras</h4>
                    <BarChart width={500} height={300} data={estadisticas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cantidad" fill="#9161cd" />
                    </BarChart>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Gráfico de Torta</h4>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={estadisticas}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.tipo}: ${entry.cantidad}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {estadisticas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#9161cd', '#2b7cd3', '#4caf50', '#ff9800', '#f44336'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#aaa' }}>No hay datos para mostrar. Agrega instrumentos primero.</p>
              )}
            </div>
          )}

          {/* GRID DE INSTRUMENTOS */}
          <div className="grid">
            {instrumentos.length === 0 ? (
              <p style={{ color: 'white', textAlign: 'center', gridColumn: '1/-1' }}>No hay instrumentos. {userRol === 'admin' ? 'Agrega el primero usando el panel superior.' : 'Vuelve más tarde.'}</p>
            ) : (
              instrumentos.map(inst => (
                <article className="card" key={inst.id}>
                  <div className="imgwrap">
                    <img 
                      src={getImagen(inst)} 
                      alt={inst.nombre} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = '/img/default.jpg'; }}
                    />
                  </div>
                  <div className="card-body">
                    <div className="product-title"><span>{inst.tipo}</span><span className="badge new">En stock</span></div>
                    <div className="subtitle">{inst.nombre}</div>
                    <p style={{ color: 'var(--muted)', marginTop: '6px', fontSize: '0.98rem' }}>Instrumento de alta calidad para músicos profesionales.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Disponible • <span style={{ color: '#7fffd4', fontWeight: '700' }}>En stock</span></div>
                      <div className="price">${inst.precio}</div>
                    </div>
                    <div className="btn-row">
                      <button className="btn primary" onClick={() => alert(`Ver detalles de ${inst.nombre}`)}>Ver más</button>
                      <button className="btn ghost" onClick={() => agregarAlCarrito(inst)}>Añadir</button>
                      {userRol === 'admin' && (
                        <>
                          <button className="btn editar" onClick={() => editarInstrumento(inst)}>✏️</button>
                          <button className="btn eliminar" onClick={() => eliminarLogico(inst.id)}>🗑️</button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="galeria" className="gallery-section">
        <div className="wrap">
          <h2 style={{ marginBottom: '12px', color: 'white' }}>Nuestros Artistas</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>Ven y descubre la magia de nuestros instrumentos patrocinados por:</p>
          <div className="gallery">
            <figure className="photo"><img src="/img/timHenson.jpg" alt="Tim Henson" style={{ width: '100%', height: '230px', objectFit: 'cover' }} /><figcaption style={{ textAlign: 'center', padding: '10px', color: 'white' }}>Tim Henson</figcaption></figure>
            <figure className="photo"><img src="/img/SteveVai.jpg" alt="Steve Vai" style={{ width: '100%', height: '230px', objectFit: 'cover' }} /><figcaption style={{ textAlign: 'center', padding: '10px', color: 'white' }}>Steve Vai</figcaption></figure>
            <figure className="photo"><img src="/img/carlos.jpg" alt="Carlos Santana" style={{ width: '100%', height: '230px', objectFit: 'cover' }} /><figcaption style={{ textAlign: 'center', padding: '10px', color: 'white' }}>Carlos Santana</figcaption></figure>
          </div>
        </div>
      </section>

      <section id="contacto" className="contact">
        <div className="wrap">
          <h2 style={{ marginBottom: '10px', color: 'white' }}>Contáctanos</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '18px' }}>¿Tienes preguntas? Estamos aquí para ayudarte.</p>
          <form className="form" onSubmit={(e) => { e.preventDefault(); alert('Mensaje enviado (demo)'); }}>
            <input type="text" placeholder="Nombre" required />
            <input type="email" placeholder="Correo" required />
            <textarea rows="6" placeholder="Mensaje"></textarea>
            <button className="submit" type="submit">Enviar Mensaje</button>
          </form>
        </div>
      </section>

      <section className="redes-sociales">
        <div className="wrap">
          <h2 className="redes-titulo">Síguenos en nuestras redes sociales</h2>
          <p className="redes-subtitulo">Conéctate con nosotros y conoce nuestras novedades</p>
          <div className="redes-container">
            <a href="#" className="icon"><i className='bx bxl-instagram'></i></a>
            <a href="#" className="icon"><i className='bx bxl-facebook-circle'></i></a>
            <a href="#" className="icon"><i className='bx bxl-whatsapp'></i></a>
            <a href="#" className="icon"><i className='bx bxl-twitter'></i></a>
          </div>
        </div>
      </section>

      {/* MODAL DEL CARRITO */}
      {mostrarCarrito && (
        <div className="modal-overlay" onClick={() => setMostrarCarrito(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 Tu Carrito</h2>
              <button className="modal-close" onClick={() => setMostrarCarrito(false)}>✖</button>
            </div>
            
            <div className="modal-body">
              {carrito.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                  Tu carrito está vacío. Agrega instrumentos desde el catálogo.
                </p>
              ) : (
                <>
                  <div className="carrito-items">
                    <table className="carrito-tabla">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Tipo</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {carrito.map(item => (
                          <tr key={item.id}>
                            <td>{item.nombre}</td>
                            <td>{item.tipo}</td>
                            <td>${item.precio}</td>
                            <td>
                              <div className="cantidad-control">
                                <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>-</button>
                                <span>{item.cantidad}</span>
                                <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                              </div>
                            </td>
                            <td className="subtotal">${(item.precio * item.cantidad).toFixed(2)}</td>
                            <td>
                              <button className="btn-eliminar-item" onClick={() => eliminarDelCarrito(item.id)}>
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="carrito-footer">
                    <div className="carrito-total">
                      <span>Total:</span>
                      <strong>${calcularTotal().toFixed(2)}</strong>
                    </div>
                    <div className="carrito-acciones">
                      <button className="btn-vaciar" onClick={vaciarCarrito}>Vaciar carrito</button>
                      <button className="btn-comprar" onClick={() => {
                        alert(`🎉 Compra realizada por $${calcularTotal().toFixed(2)}\nGracias por tu compra en DARK MUSIC!`);
                        setCarrito([]);
                        setMostrarCarrito(false);
                      }}>
                        Confirmar compra
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;