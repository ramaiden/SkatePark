const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const secretKey = 'Shhhh';

const { nuevoUsuario, getUsuarios, setUsuarioStatus, Validar, getUsuario } = require('./consultas')

app.listen(3000);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "El tamaño de la imagen supera lo permitido"
    })
)
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/mainLayout`
    })
);
app.set("view engine", "handlebars");

//rutas

app.get('/', (req, res) => {
    res.render("Registro")
})

app.post('/login', async (req, res) => {
    try {
        const { nombre, email, password, anos, especialidad, fotos } = req.body
        const { foto } = req.files;
        const { name } = foto;
        foto.mv(`${__dirname}/public/photos/${name}`)
        const photo = `/photos/${name}`
        const usuario = await nuevoUsuario(nombre, email, password, anos, especialidad, photo)

        res.send(`<script>alert('Usuario registrado con exito'); const enlace = () =>
        { window.location.href = 'http://localhost:3000/'};enlace()</script>`)

    } catch (e) {
        res.status(500).send({
            error: `algo salio mal .... ${e}`,
            code: 500
        })
    }
})

app.put('/usuarios', async (req, res) => {
    try {
        const { id, auth } = req.body;
        const usuario = await setUsuarioStatus(id, auth)
        res.send(usuario)
    } catch (e) {
        res.status(500).send({
            error: `algo salio mal .... ${e}`,
            code: 500
        })
    }
})


app.get('/admin', async (req, res) => {
    try {
        const usuarios = await getUsuarios();
        res.render("Admin", { usuarios })
    } catch (e) {
        res.status(500).send({
            error: `algo salio mal .... ${e}`,
            code: 500
        })
    }
})

app.get('/index', async (req, res) => {
    try {
        const { token } = req.query;
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                const { nombre, email } = decoded;
                res.status(401).send(
                    res.send({
                        error: "401 No autorizado",
                        message: "Usted no está autorizado",
                        token_error: err.message,
                    }))
            };
        })
        const usuarios = await getUsuarios();
        res.render("Index", { usuarios })

    }
    catch (e) {
        res.status(500).send({
            error: `algo salio mal .... ${e}`,
            code: 500
        })
    }
})

app.get('/ingreso', (req, res) => {
    try {
        res.render("Login")
    } catch (e) {
        res.status(500).send({
            error: `algo salio mal .... ${e}`,
            code: 500
        })
    }
})


app.post("/verify", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await getUsuario(email, password);
        if (user) {
            const { nombre } = user
            const usuario = { nombre, email }
            const token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 180 , data: usuario}, secretKey);
            res.send(token);
        } else {
            res.status(401).send({
                error: "Este usuario no está registrado",
                code: 404
            })
        }
    } catch (e) {
        console.log(e)
    }
})