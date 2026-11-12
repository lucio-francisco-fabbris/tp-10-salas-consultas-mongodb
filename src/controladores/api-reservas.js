const mongoose = require("mongoose");
const { formatearReserva } = require("../utils/formatear");

function crearControladorApiReservas(servicioReserva) {
  async function listar(req, res, next) {
    try {
      const permitidos = ["sala", "orden", "pagina", "limite"];
      const { sala, orden, pagina, limite } = req.query;
      const recibidos = Object.keys(req.query);
      const extras = recibidos.filter((param) => !permitidos.includes(param));

      if (extras.length > 0) {
        return res.status(400).json({ error: "Parámetros desconocidos en la URL." });
      }

      if (sala !== undefined) {
        if (Array.isArray(sala)) {
          return res.status(400).json({ error: "El filtro de sala no puede estar repetido." });
        }
        const salaLimpia = sala.trim();
        if (salaLimpia === "") {
          return res.status(400).json({ error: "El nombre de la sala no puede estar vacío." });
        }
      }

      let ordenLimpio;
      if (orden !== undefined) {
        if (Array.isArray(orden)) {
          return res.status(400).json({ error: "El parámetro orden no puede estar repetido." });
        }

        ordenLimpio = orden.trim();
        const ordenesPermitidos = ["estudiante", "personas-asc", "personas-desc"];

        if (!ordenesPermitidos.includes(ordenLimpio)) {
          return res.status(400).json({ error: "Orden desconocido. Use: estudiante, personas-asc o personas-desc." });
        }
      }

      let numPagina = 1;
      if (pagina !== undefined) {
        if (Array.isArray(pagina)) {
          return res.status(400).json({ error: "El parámetro pagina no puede estar repetido." });
        }
        numPagina = Number(pagina);
        if (!Number.isInteger(numPagina) || numPagina < 1 || numPagina > 1000) {
          return res.status(400).json({ error: "El parámetro pagina debe ser un número entero entre 1 y 1000." });
        }
      }

      let numLimite = 2;
      if (limite !== undefined) {
        if (Array.isArray(limite)) {
          return res.status(400).json({ error: "El parámetro limite no puede estar repetido." });
        }
        numLimite = Number(limite);
        if (!Number.isInteger(numLimite) || numLimite < 1 || numLimite > 20) {
          return res.status(400).json({ error: "El parámetro limite debe ser un número entero entre 1 y 20." });
        }
      }

      const respuesta = await servicioReserva.consultar(sala, ordenLimpio, numPagina, numLimite);

      return res.status(200).json(respuesta);
    } catch (error) {
      next(error);
    }
  }

  async function obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ error: "El ID proporcionado no tiene un formato válido." });
      }

      const reserva = await servicioReserva.obtenerPorId(id);
      if (!reserva) {
        return res.status(404).json({
          error: "No se encontró ninguna reserva con el ID especificado.",
        });
      }

      return res.status(200).json(formatearReserva(reserva));
    } catch (error) {
      next(error);
    }
  }

  async function crear(req, res, next) {
    try {
      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return res.status(400).json({
          error: "El cuerpo de la solicitud debe ser un objeto JSON válido.",
        });
      }

      const reservaGuardada = await servicioReserva.crear(req.body);
      const reservaFormateada = formatearReserva(reservaGuardada);

      const locationUrl = `/api/reservas/${reservaFormateada.id}`;
      res.setHeader("Location", locationUrl);

      return res.status(201).json(reservaFormateada);
    } catch (error) {
      if (error.name === "ValidationError") {
        const errores = Object.values(error.errors).map((e) => e.message);
        return res
          .status(400)
          .json({ error: "Error de validación", detalles: errores });
      }
      next(error);
    }
  }

  async function reemplazar(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Formato de ID inválido." });
      }

      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return res
          .status(400)
          .json({ error: "El cuerpo debe ser un JSON válido." });
      }

      const permitidos = [
        "estudiante",
        "email",
        "sala",
        "fecha",
        "turno",
        "personas",
        "estado",
      ];
      const recibidos = Object.keys(req.body);
      const faltantes = permitidos.filter(
        (campo) => !recibidos.includes(campo),
      );
      const extras = recibidos.filter((campo) => !permitidos.includes(campo));

      if (faltantes.length > 0 || extras.length > 0) {
        return res.status(400).json({
          error:
            "El método PUT exige exactamente los 7 campos editables y ningún campo extra.",
          faltantes,
          extras,
        });
      }

      const reservaActualizada = await servicioReserva.reemplazar(id, req.body);
      if (!reservaActualizada) {
        return res
          .status(404)
          .json({ error: "No se encontró ninguna reserva para reemplazar." });
      }

      return res.status(200).json(formatearReserva(reservaActualizada));
    } catch (error) {
      if (error.name === "ValidationError" || error.name === "CastError") {
        return res
          .status(400)
          .json({ error: "Error de validación", detalles: error.message });
      }
      next(error);
    }
  }

  async function modificar(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Formato de ID inválido." });
      }

      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      ) {
        return res
          .status(400)
          .json({ error: "El cuerpo debe ser un JSON válido." });
      }

      const permitidos = ["personas", "estado"];
      const recibidos = Object.keys(req.body);
      const extras = recibidos.filter((campo) => !permitidos.includes(campo));

      if (extras.length > 0) {
        return res.status(400).json({
          error: "PATCH solo permite modificar 'personas' y 'estado'.",
          extras,
        });
      }

      if (recibidos.length === 0) {
        return res.status(400).json({
          error: "PATCH requiere al menos un campo válido para modificar.",
        });
      }

      const reservaActualizada = await servicioReserva.modificar(id, req.body);
      if (!reservaActualizada) {
        return res
          .status(404)
          .json({ error: "No se encontró ninguna reserva para modificar." });
      }

      return res.status(200).json(formatearReserva(reservaActualizada));
    } catch (error) {
      if (error.name === "ValidationError" || error.name === "CastError") {
        return res
          .status(400)
          .json({ error: "Error de validación", detalles: error.message });
      }
      next(error);
    }
  }

  async function eliminar(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Formato de ID inválido." });
      }

      const eliminada = await servicioReserva.eliminar(id);
      if (!eliminada) {
        return res
          .status(404)
          .json({ error: "No se encontró ninguna reserva para eliminar." });
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  return {
    listar,
    obtenerPorId,
    crear,
    reemplazar,
    modificar,
    eliminar,
  };
}

module.exports = crearControladorApiReservas;
