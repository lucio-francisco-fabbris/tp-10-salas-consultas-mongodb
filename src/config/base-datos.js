const mongoose = require("mongoose");
const dns = require("node:dns");
const { obtenerUriMongoDB } = require("./entorno");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectarBaseDeDatos() {
  const uri = obtenerUriMongoDB();

  await mongoose.connect(uri);
}

async function cerrarConexion() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  conectarBaseDeDatos,
  cerrarConexion,
};
