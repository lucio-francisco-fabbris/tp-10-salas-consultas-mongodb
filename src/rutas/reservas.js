const express = require("express");

function crearRouterReservas(controladorReservas, validarReserva) {
  const router = express.Router();

  router.use((req, res, next) => {
    res.locals.seccion = "Reservas de salas";
    next();
  });

  router.get("/", controladorReservas.listar);

  router.get("/nueva", controladorReservas.mostrarNueva);

  router.get("/:id", controladorReservas.mostrarDetalle);

  router.post("/", validarReserva, controladorReservas.crear);

  return router;
}

module.exports = crearRouterReservas;
