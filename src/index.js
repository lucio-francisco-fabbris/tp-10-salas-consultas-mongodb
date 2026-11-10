const configuracion = require("./config/entorno");
const { conectarBaseDeDatos, cerrarConexion } = require("./config/base-datos");
const crearServicioReservas = require("./servicios/reservas");
const crearControladorReservas = require("./controladores/reservas");
const validarReserva = require("./middleware/reservas");
const {
  identificarSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const crearRouterReservas = require("./rutas/reservas");
const crearApp = require("./app");

async function iniciarServidor() {
  try {
    console.log("Conectando a la base de datos MongoDB Atlas...");
    await conectarBaseDeDatos();
    console.log("¡Conexión establecida con éxito!");

    const servicioReserva = crearServicioReservas();
    const controladorReserva = crearControladorReservas(servicioReserva);
    const reservasRouter = crearRouterReservas(
      controladorReserva,
      validarReserva,
    );

    const app = crearApp(
      reservasRouter,
      servicioReserva,
      identificarSolicitud,
      medirDuracion,
    );

    const servidor = app.listen(configuracion.puerto, () => {
      console.log(
        `Servidor escuchando en http://localhost:${configuracion.puerto}`,
      );
    });

    const apagar = async (senal) => {
      console.log(`/nRecibida señal ${senal}. Cerrando servidor...`);
      servidor.close(async () => {
        console.log("Servidor HTTP cerrado.");
        await cerrarConexion();
        console.log("Conexión con MongoDB Atlas cerrada.");
        process.exit(0);
      });
    };
    process.on("SIGINT", () => apagar("SIGINT"));
    process.on("SIGTERM", () => apagar("SIGTERM"));
  } catch (error) {
    console.error("Fallo critico al inciar el servidor:", error.stack);
    process.exit(1);
  }
}

iniciarServidor();
