const express = require('express');
const app = express();
const categoriaRoutes = require('./routes/categorias');

app.use(express.json());
app.use('/categorias', categoriaRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});