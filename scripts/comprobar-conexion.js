const {
  conectarBaseDeDatos,
  cerrarConexion,
} = require("../src/config/base-datos");

async function comprobarConexion() {
  try {
    console.log("Intentando conectar a MongoDB Atlas...");
    await conectarBaseDeDatos();
    console.log("Conexión establecida con éxito a MongoDB Atlas.");
  } catch (error) {
    console.error("Error al conectar a MongoDB Atlas:");
    console.error(`- Nombre: ${error.name || "Error desconocido"}`);
    console.error(`- Mensaje: ${error.message}`);
    if (error.code) {
      console.error(`- Código/Operación: DNS o Red: ${error.code}`);
    }
    process.exitCode = 1;
  } finally {
    await cerrarConexion();
    console.log("Conexión cerrada correctamente.");
  }
}

comprobarConexion();
