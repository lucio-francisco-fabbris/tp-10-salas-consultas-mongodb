const { Router } = require("express");

function crearRouterApiReservas(controladorApi) {
  const router = Router();

  router.get("/", controladorApi.listar);
  router.get("/:id", controladorApi.obtenerPorId);
  router.post("/", controladorApi.crear);

  router.put("/:id", controladorApi.reemplazar);
  router.patch("/:id", controladorApi.modificar);
  router.delete("/:id", controladorApi.eliminar);
  return router;
}

module.exports = crearRouterApiReservas;
