const puerto = Number(process.env.PORT) || 3000;

const entorno = process.env.NODE_ENV || "desarrollo";

if (!Number.isInteger(puerto) || puerto <= 1 || puerto > 65535) {
  throw new Error("El puerto debe ser un número entero entre 1 y 65535.");
}

function obtenerUriMongoDB() {
  const uri = process.env.MONGODB_URI;

  if (
    !uri ||
    (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))
  ) {
    throw new Error(
      "La configuración MONGODB_URI falta o tiene un formato incorrecto.",
    );
  }

  return uri;
}

module.exports = {
  puerto,
  entorno,
  obtenerUriMongoDB,
};
