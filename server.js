require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

const mysql = require('mysql2');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); 
});

app.post('/buscar-horarios', (req, res) => {
    const { ciudadOrigen, ciudadDestino } = req.body;
    const query = `
        SELECT 
            c_origen.nombre_ciudad AS ciudad_origen,
            c_destino.nombre_ciudad AS ciudad_destino,
            t_origen.nombre_terminal AS terminal_origen,
            t_destino.nombre_terminal AS terminal_destino,
            h.hora_salida,
            h.duracion_viaje
        FROM horarios_de_buses h
        JOIN Terminales t_origen ON h.terminal_origen_id = t_origen.terminal_id
        JOIN Terminales t_destino ON h.terminal_destino_id = t_destino.terminal_id
        JOIN Ciudades c_origen ON t_origen.ciudad_id = c_origen.ciudad_id
        JOIN Ciudades c_destino ON t_destino.ciudad_id = c_destino.ciudad_id
        WHERE c_origen.nombre_ciudad = ? AND c_destino.nombre_ciudad = ?
    `;
    pool.query(query, [ciudadOrigen, ciudadDestino], (error, results) => {
        if (error) {
            console.error('Error al realizar la consulta', error);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        console.log('Query results:', results);
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
