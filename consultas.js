const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    database: 'nasa',
    port: 5432,
});

const nuevoUsuario = async (nombre, email, password, anos, especialidad, photo) => {
    const result = await pool.query(
        `INSERT INTO usuarios ( nombre, email, password1, especialidad, anos,photo, auth) values ('${nombre}', '${email}', '${password}', '${especialidad}', ${anos}, '${photo}', false) RETURNING *`
    );
    const usuario = result.rows[0]
    return usuario;
}

const getUsuarios = async () => {
    const result = await pool.query(
        `SELECT * FROM usuarios`
    )
    const usuarios = result.rows
    console.log(usuarios)
    return usuarios
}

const setUsuarioStatus = async (id, auth) => {
    const result = await pool.query(
        `UPDATE usuarios SET auth = ${auth} WHERE id = ${id} RETURNING *`
    )
    const usuario = result.rows[0]
    return usuario
}

const Validar = (email, password) => {
    return console.log('Hola')
}

const getUsuario = async (email, password1) => {
    try {
        const result = await pool.query(
            `SELECT * FROM usuarios where email = '${email}' AND password1 = '${password1}'`
        )
        const usuarios = result.rows[0]
        return usuarios
    } catch (e) {
        throw e
    }
}

module.exports = {
    nuevoUsuario, getUsuarios, setUsuarioStatus, Validar, getUsuario
}