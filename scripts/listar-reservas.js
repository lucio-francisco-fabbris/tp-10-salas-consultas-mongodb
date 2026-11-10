const {
  conectarBaseDeDatos,
  cerrarConexion,
} = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reservas");

async function listarReservas() {
  try {
    await conectarBaseDeDatos();

    const reservas = await Reserva.find();

    console.log("=== LISTADO DE RESERVAS ===");
    if (reservas.length === 0) {
      console.log("No hay reservas registradas en la base de datos.");
    } else {
      reservas.forEach((r, index) => {
        console.log(
          `${index + 1}. ID: ${r._id.toString()} | Estudiante: ${r.estudiante} | Email: ${r.email} | Sala: ${r.sala} | Fecha: ${r.fecha} | Turno: ${r.turno} | Personas: ${r.personas}`,
        );
      });
    }
    console.log(`\nCantidad total de reservas recuperadas: ${reservas.length}`);
  } catch (error) {
    console.error(" Error al listar las reservas:");
    console.error(`- [${error.name || "Error"}]: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await cerrarConexion();
    console.log("Conexión cerrada.");
  }
}

listarReservas();
