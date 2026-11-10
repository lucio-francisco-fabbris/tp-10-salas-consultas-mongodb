const mongoose = require("mongoose");

function crearControladorReservas(servicioReserva) {
  async function listar(req, res, next) {
    try {
      const reservas = await servicioReserva.listar();
      res.render("reservas/lista", {
        title: "Listado de Reservas",
        titulo: "Listado de Reservas",
        reservas,
      });
    } catch (error) {
      next(error);
    }
  }

  async function mostrarDetalle(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).render("no-encontrado", {
          title: "Reserva no encontrada",
          titulo: "Reservas no encontradas",
        });
      }

      const reserva = await servicioReserva.obtenerPorId(id);
      if (!reserva) {
        return res
          .status(404)
          .render("404", { titulo: "Reserva no encontrada" });
      }

      res.render("reservas/detalle", {
        title: "Detalle de Reserva",
        titulo: "Detalle de Reserva",
        reserva,
      });
    } catch (error) {
      next(error);
    }
  }

  function mostrarNueva(req, res) {
    res.render("reservas/nueva", {
      title: "Nueva Reserva",
      titulo: "Nueva Reserva",
      reserva: {},
      valores: {},
      error: null,
    });
  }

  async function crear(req, res, next) {
    try {
      await servicioReserva.crear(req.body);
      res.redirect("/reservas");
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).render("reservas/nueva", {
          title: "Nueva Reserva",
          titulo: "Nueva Reserva",
          reserva: req.body,
          valores: req.body,
          error: "Por favor corrija los errores en el formulario.",
        });
      }
      next(error);
    }
  }

  return {
    listar,
    mostrarDetalle,
    mostrarNueva,
    crear,
  };
}

module.exports = crearControladorReservas;
