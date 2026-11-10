const express = require("express");
const path = require("node:path");
const expressLayout = require("express-ejs-layouts");
const morgan = require("morgan");

const crearControladorApiReservas = require("./controladores/api-reservas");
const crearRouterApiReservas = require("./rutas/api-reservas");

function crearApp(
  reservasRouter,
  servicioReservas,
  identificarSolicitud,
  medirDuracion,
) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(expressLayout);
  app.set("layout", "layouts/main");

  app.use(morgan("dev"));
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  if (identificarSolicitud) app.use(identificarSolicitud);
  if (medirDuracion) app.use(medirDuracion);

  app.get("/estado", async (req, res, next) => {
    try {
      const cantidad = await servicioReservas.contar();
      res.json({
        estado: "OK",
        servicio: "Reserva de salas de estudio",
        totalReservas: cantidad,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/", (req, res) => {
    res.redirect("/reservas");
  });

  if (
    typeof reservasRouter === "function" ||
    typeof reservasRouter?.use === "function"
  ) {
    app.use("/reservas", reservasRouter);
  }

  const controladorApi = crearControladorApiReservas(servicioReservas);
  const apiReservasRouter = crearRouterApiReservas(controladorApi);
  app.use("/api/reservas", apiReservasRouter);

  app.use((req, res) => {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ error: "Endpoint no encontrado." });
    }
    res
      .status(404)
      .render(
        "no-encontrado",
        { titulo: "Página no encontrada" },
        (err, html) => {
          if (err) {
            return res.status(404).send("Página no encontrada");
          }
          res.render(html);
        },
      );
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("Error no controlado:", err.message);

    if (req.originalUrl.startsWith("/api")) {
      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }

    res.status(500).send("Error interno del servidor");
  });

  return app;
}

module.exports = crearApp;
