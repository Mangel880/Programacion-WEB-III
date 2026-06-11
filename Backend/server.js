const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

//  CONEXIÓN A MySQL (XAMPP)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'darkmusic'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err);
        console.log('⚠️ Asegurate de tener XAMPP activado y la base de datos creada');
        return;
    }
    console.log('✅ Conectado a MySQL (darkmusic)');
});

// MIDDLEWARE 
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    
    jwt.verify(token, 'clave_secreta_123', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.usuarioId = decoded.id;
        req.usuarioEmail = decoded.email;
        req.usuarioRol = decoded.rol;
        next();
    });
}

// REGISTRO 
app.post('/api/registro', async (req, res) => {
    const { email, password } = req.body;
    
    let fortaleza = 'débil';
    if (password.length >= 6) {
        let tieneMayuscula = /[A-Z]/.test(password);
        let tieneNumero = /[0-9]/.test(password);
        let tieneEspecial = /[^A-Za-z0-9]/.test(password);
        
        if (tieneMayuscula && tieneNumero && tieneEspecial) {
            fortaleza = 'fuerte';
        } else if ((tieneMayuscula && tieneNumero) || (tieneMayuscula && tieneEspecial) || (tieneNumero && tieneEspecial)) {
            fortaleza = 'media';
        }
    }
    
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en BD' });
        if (results.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const rol = email === 'admin@darkmusic.com' ? 'admin' : 'usuario';
        
        db.query('INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)', 
            [email, hashedPassword, rol], 
            (err, result) => {
                if (err) return res.status(500).json({ error: 'Error al registrar' });
                res.json({ mensaje: 'Usuario registrado exitosamente', fortaleza, rol });
            });
    });
});

//  LOGIN 
app.post('/api/login', async (req, res) => {
    const { email, password, captchaToken } = req.body;
    
    // Verificar que llegó el token del CAPTCHA
    if (!captchaToken) {
        return res.status(400).json({ error: 'CAPTCHA requerido' });
    }
    
    // Validación simple del CAPTCHA
    if (captchaToken.length < 5) {
        return res.status(400).json({ error: 'CAPTCHA inválido' });
    }
    
    // Buscar usuario en la base de datos
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error en BD:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        
        const usuario = results[0];
        
        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        
        // Generar token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            'clave_secreta_123',
            { expiresIn: '24h' }
        );
        
        // Registrar log de acceso
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const browser = req.headers['user-agent'] || 'Desconocido';
        
        db.query(
            'INSERT INTO logs_acceso (usuario_id, email, ip, evento, browser) VALUES (?, ?, ?, ?, ?)',
            [usuario.id, usuario.email, ip, 'login', browser],
            (logErr) => {
                if (logErr) console.error('Error al guardar log:', logErr);
            }
        );
        
        // Responder con éxito
        res.json({
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    });
});

//  LOGOUT 
app.post('/api/logout', verificarToken, (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const browser = req.headers['user-agent'];
    db.query('INSERT INTO logs_acceso (usuario_id, email, ip, evento, browser) VALUES (?, ?, ?, ?, ?)',
        [req.usuarioId, req.usuarioEmail, ip, 'logout', browser]);
    res.json({ mensaje: 'Sesión cerrada' });
});

//  CRUD INSTRUMENTOS 

// Obtener todos los instrumentos activos
app.get('/api/instrumentos', verificarToken, (req, res) => {
    db.query('SELECT * FROM instrumentos WHERE activo = TRUE ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en BD' });
        res.json(results);
    });
});

// Crear instrumento (con imagen)
app.post('/api/instrumentos', verificarToken, (req, res) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    const { nombre, tipo, precio, imagen } = req.body;
    if (!nombre || !tipo || !precio) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const imagenUrl = imagen || '/img/default.jpg';
    
    db.query('INSERT INTO instrumentos (nombre, tipo, precio, imagen) VALUES (?, ?, ?, ?)',
        [nombre, tipo, precio, imagenUrl],
        (err, result) => {
            if (err) {
                console.error('Error al crear instrumento:', err);
                return res.status(500).json({ error: 'Error al crear instrumento' });
            }
            res.status(201).json({ 
                id: result.insertId, 
                nombre, 
                tipo, 
                precio, 
                imagen: imagenUrl, 
                activo: true 
            });
        });
});

// Actualizar instrumento (con imagen)
app.put('/api/instrumentos/:id', verificarToken, (req, res) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    const id = req.params.id;
    const { nombre, tipo, precio, imagen } = req.body;
    
    const imagenUrl = imagen || '/img/default.jpg';
    
    db.query('UPDATE instrumentos SET nombre = ?, tipo = ?, precio = ?, imagen = ? WHERE id = ?',
        [nombre, tipo, precio, imagenUrl, id],
        (err, result) => {
            if (err) {
                console.error('Error al actualizar:', err);
                return res.status(500).json({ error: 'Error al actualizar' });
            }
            res.json({ mensaje: 'Instrumento actualizado' });
        });
});

// Eliminación lógica
app.delete('/api/instrumentos/:id', verificarToken, (req, res) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }
    
    const id = req.params.id;
    db.query('UPDATE instrumentos SET activo = FALSE WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al eliminar' });
        res.json({ mensaje: 'Instrumento eliminado (eliminación lógica)' });
    });
});

// Estadísticas para gráfico
app.get('/api/estadisticas', verificarToken, (req, res) => {
    db.query('SELECT tipo, COUNT(*) as cantidad FROM instrumentos WHERE activo = TRUE GROUP BY tipo',
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Error en BD' });
            res.json(results);
        });
});

//  INICIAR SERVIDOR 
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});