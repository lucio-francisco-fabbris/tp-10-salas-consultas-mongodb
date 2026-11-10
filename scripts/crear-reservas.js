const {
  conectarBaseDeDatos,
  cerrarConexion,
} = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reservas");

async function crearReserva() {
  try {
    await conectarBaseDeDatos();

    // Objeto ficticio válido para la prueba
    const nuevaReservaData = {
      estudiante: "Lucía Gómez",
      email: "lucia@gmail.com",
      sala: "Sala Norte",
      fecha: "2026-10-25",
      turno: "Mañana",
      personas: 3,
    };

    const reserva = new Reserva(nuevaReservaData);
    const reservaGuardada = await reserva.save();

    console.log("¡Reserva creada exitosamente!");
    console.log(`- ID asignado (_id): ${reservaGuardada._id.toString()}`);
    console.log(`- Estudiante: ${reservaGuardada.estudiante}`);
    console.log(`- Sala: ${reservaGuardada.sala}`);
    console.log(`- Fecha: ${reservaGuardada.fecha}`);
  } catch (error) {
    console.error(" Error al crear la reserva:");
    if (error.name === "ValidationError") {
      console.error("- Error de Validación:");
      for (const campo in error.errors) {
        console.error(`  * ${campo}: ${error.errors[campo].message}`);
      }
    } else {
      console.error(`- [${error.name || "Error"}]: ${error.message}`);
    }
    process.exitCode = 1;
  } finally {
    await cerrarConexion();
    console.log("Conexión cerrada.");
  }
}

crearReserva();
