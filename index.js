const express = require("express")
const mysql = require("mysql2")
const bodyparser=require("body-parser")
const multer = require('multer');

const app = express()
app.use(bodyparser.json())

const PUERTO=3000

app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true }));
//const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });  // 50 MB

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Middleware para manejar JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const conexion=mysql.createConnection(
{
    host:'localhost',
    database:'servicespasteleria',
    user:'root',
    password:'123456789'
}


)
app.listen(PUERTO, ()=>{
    console.log("Servidor http://localhost:"+PUERTO)
})

conexion.connect(error => {
    if(error)throw error
    console.log("Conexión a BD exitosa")
})


app.get("/",(req,res)=>{
    res.send("Servicio corriendo")
})


// Obtener todos los usuarios
app.get("/usuarios", (req, res) => {
    const query = "SELECT * FROM usuarios";
    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        res.json(resultado);
    });
});


// Obtener un usuario por su ID
app.get("/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM usuarios WHERE usu_id = ?";
    conexion.query(query, [id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.length === 0) {
            return res.status(404).send("Usuario no encontrado");
        }
        res.json(resultado[0]);
    });
});

//crear usuario
app.post("/usuarios", (req, res) => {
    const { usu_nombre, usu_apellidos, usu_email, usu_ncelular, usu_password, usu_estado } = req.body;
    const query = "INSERT INTO usuarios (usu_nombre, usu_apellidos, usu_email, usu_ncelular, usu_password, usu_estado) VALUES (?, ?, ?, ?, ?, ?)";
    conexion.query(query, [usu_nombre, usu_apellidos, usu_email, usu_ncelular, usu_password, usu_estado], (error, resultado) => {
        if (error) {
            console.error("Error al insertar el usuario:", error);
            return res.status(500).send("Error del servidor");
        }
        res.json({ message: "Usuario creado correctamente", id: resultado.insertId });
    });
});


// Actualizar un usuario existente
app.put("/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const { usu_nombre, usu_apellidos, usu_email, usu_ncelular, usu_password, usu_estado } = req.body;
    const query = "UPDATE usuarios SET usu_nombre = ?, usu_apellidos = ?, usu_email = ?, usu_ncelular = ?, usu_password = ?, usu_estado = ? WHERE usu_id = ?";
    conexion.query(query, [usu_nombre, usu_apellidos, usu_email, usu_ncelular, usu_password, usu_estado, id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Usuario no encontrado");
        }
        res.json({ message: "Usuario actualizado correctamente" });
    });
});


// Eliminar un usuario
app.delete("/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM usuarios WHERE usu_id = ?";
    conexion.query(query, [id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Usuario no encontrado");
        }
        res.json({ message: "Usuario eliminado correctamente" });
    });
});


//cambiado
// Listar todos los productos
app.get("/productos", (req, res) => {
    const query = "SELECT * FROM producto where estado!='0'";
    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        const object={}
        object.productos=resultado
        res.json(object);
    });
});



//cambiado
// Buscar un producto por su ID
app.get("/productos/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM producto WHERE pro_id = ?";
    conexion.query(query, [id], (error, resultado) => {
        const object={}
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.length === 0) {
            return res.status(404).send("Producto no encontrado");
        }
        object.producto=resultado[0]
        res.json(object);
    });
});


//canbiado
// Crear un nuevo producto
app.post("/productos", upload.single('pro_imagen'), (req, res) => {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { pro_nombre, pro_precio, pro_categoria, pro_stock, estado } = req.body;


    if (!req.file) {
        return res.status(400).send("Imagen no proporcionada");
    }

    const pro_imagen = req.file.buffer;
    const query = "INSERT INTO producto (pro_nombre, pro_precio, pro_categoria, pro_stock, pro_imagen, estado) VALUES (?, ?, ?, ?, ?, ?)";
    
    conexion.query(query, [pro_nombre, pro_precio, pro_categoria, pro_stock, pro_imagen, estado], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        res.json({ message: "Producto creado correctamente", id: resultado.insertId });
    });
});



//camviado
// Modificar un producto existente
app.put("/productos/:id",upload.single('pro_imagen'), (req, res) => {
    const { id } = req.params;
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { pro_nombre, pro_precio, pro_categoria, pro_stock, estado } = req.body;
    if (!req.file) {
        return res.status(400).send("Imagen no proporcionada");
    }
    const pro_imagen = req.file.buffer;
   
    const query = "UPDATE producto SET pro_nombre = ?, pro_precio = ?, pro_categoria = ?, pro_stock = ?, pro_imagen = ?, estado = ? WHERE pro_id = ?";
    conexion.query(query, [pro_nombre, pro_precio, pro_categoria, pro_stock, pro_imagen, estado, id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Producto no encontrado");
        }
        res.json({ message: "Producto actualizado correctamente" });
    });
});





//cambiado
// Eliminar un producto
app.put("/productosDe/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM producto WHERE pro_id = ?";
    conexion.query(query, [id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Producto no encontrado");
        }
        res.json({ message: "Producto eliminado correctamente" });
    });
});




//cambiado
// Login cliente
app.post("/login/cliente", (req, res) => {
    const { usu_email, usu_password } = req.body;
    const query = `
        SELECT u.* FROM usuarios u
        JOIN user_roles ur ON u.usu_id = ur.user_id
        JOIN roles r ON ur.rol_id = r.rol_id
        WHERE u.usu_email = ? AND u.usu_password = ? AND r.name = 'CLIENTE'
    `;
    conexion.query(query, [usu_email, usu_password], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.length === 0) {
            return res.status(401).send("Credenciales inválidas");
        }
        res.json({ message: "Login exitoso", usuario: resultado[0] });
    });
});


// Login admin
app.post("/login/admin", (req, res) => {
    const { usu_email, usu_password } = req.body;
    const query = `
        SELECT u.* FROM usuarios u
        JOIN user_roles ur ON u.usu_id = ur.user_id
        JOIN roles r ON ur.rol_id = r.rol_id
        WHERE u.usu_email = ? AND u.usu_password = ? AND r.name = 'Admin'
    `;
    conexion.query(query, [usu_email, usu_password], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        if (resultado.length === 0) {
            return res.status(401).send("Credenciales inválidas");
        }
        res.json({ message: "Login exitoso", usuario: resultado[0] });
    });
});



// Listar ventas
app.get("/venta", (req, res) => {
    const query = "SELECT * FROM venta";
    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        res.json(resultado);
    });
});


// Listar detalle_venta
app.get("/detalleventa", (req, res) => {
    const query = "SELECT * FROM detalle_venta";
    conexion.query(query, (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        res.json(resultado);
    });
});



///////////////////////////////////////////////////////////


// Agregar un producto al carrito
/*app.post("/carrito", (req, res) => {
    const { usu_id, pro_id, cantidad } = req.body;
    const query = "INSERT INTO Carrito (usu_id, pro_id, cantidad) VALUES (?, ?, ?)";
    conexion.query(query, [usu_id, pro_id, cantidad], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        res.json({ message: "Producto agregado al carrito", id: resultado.insertId });
    });
});*/


// Agregar o actualizar un producto en el carrito

app.post("/carrito", (req, res) => {
    const { usu_id, pro_id, cantidad } = req.body;
    const querySelect = "SELECT * FROM Carrito WHERE usu_id = ? AND pro_id = ?";
    const queryInsert = "INSERT INTO Carrito (usu_id, pro_id, cantidad) VALUES (?, ?, ?)";
    const queryUpdate = "UPDATE Carrito SET cantidad = ? WHERE usu_id = ? AND pro_id = ?";
    
    conexion.query(querySelect, [usu_id, pro_id], (error, resultados) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        
        if (resultados.length > 0) {
            // El producto ya está en el carrito, actualizar la cantidad
            conexion.query(queryUpdate, [cantidad, usu_id, pro_id], (error, resultado) => {
                if (error) {
                    console.error(error.message);
                    return res.status(500).send("Error del servidor");
                }
                res.json({ message: "Cantidad actualizada en el carrito" });
            });
        } else {
            // El producto no está en el carrito, agregar nuevo
            conexion.query(queryInsert, [usu_id, pro_id, cantidad], (error, resultado) => {
                if (error) {
                    console.error(error.message);
                    return res.status(500).send("Error del servidor");
                }
                res.json({ message: "Producto agregado al carrito", id: resultado.insertId });
            });
        }
    });
});


app.get("/carrito/:usu_id", (req, res) => {
    const { usu_id } = req.params;
    const query = `
        SELECT 
            p.pro_id,
            p.pro_nombre,
            p.pro_precio,
            p.pro_imagen,
            c.cantidad
        FROM 
            Carrito c
        JOIN 
            producto p ON c.pro_id = p.pro_id
        WHERE 
            c.usu_id = ?;
    `;
    conexion.query(query, [usu_id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        const object={}
        object.productos=resultado
        res.json(object);
    });
});





// Calcular el total, IGV y subtotal de la orden del cliente
app.get("/carritoTotal/:usu_id", (req, res) => {
    const { usu_id } = req.params;
    const query = `
        SELECT 
            SUM(p.pro_precio * c.cantidad) AS subtotal,
            SUM(p.pro_precio * c.cantidad) * 0.18 AS igv,
            SUM(p.pro_precio * c.cantidad) * 1.18 AS total
        FROM 
            Carrito c
        JOIN 
            producto p ON c.pro_id = p.pro_id
        WHERE 
            c.usu_id = ?;
    `;
    conexion.query(query, [usu_id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        res.json(resultado[0]);
    });
});








app.delete("/carrito/:usu_id/:pro_nombre", (req, res) => {
    const { usu_id, pro_nombre } = req.params;
    console.log(`Eliminando producto ${pro_nombre} del carrito del usuario ${usu_id}`);
    
    // Consulta para obtener el ID del producto basado en el nombre
    const query = "SELECT pro_id FROM producto WHERE pro_nombre = ?";
    conexion.query(query, [pro_nombre], (error, resultados) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        
        if (resultados.length === 0) {
            return res.status(404).send("Producto no encontrado");
        }
        
        const pro_id = resultados[0].pro_id;
        
        // Ahora realizas la eliminación del carrito usando el pro_id obtenido
        const deleteQuery = "DELETE FROM carrito WHERE usu_id = ? AND pro_id = ?";
        conexion.query(deleteQuery, [usu_id, pro_id], (err, resultado) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send("Error del servidor");
            }
            res.json({ message: "Producto eliminado correctamente del carrito" });
        });
    });
});



// Eliminar todos los productos del carrito de un usuario
app.delete("/carrito/:usu_id", (req, res) => {
    const { usu_id } = req.params;
    const query = "DELETE FROM Carrito WHERE usu_id = ?";
    conexion.query(query, [usu_id], (error, resultado) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send("Error del servidor");
        }
        res.json({ message: "Carrito vaciado correctamente" });
    });
});