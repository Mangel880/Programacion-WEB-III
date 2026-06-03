const db = require('./db');

async function test() {
    try {
        const [rows] = await db.query('SELECT 1+1 AS resultado');
        console.log('✅ Conexión exitosa:', rows);
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

test();