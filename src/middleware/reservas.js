function validarReserva(req, res, next) {
  const estudiante = req.body.estudiante;

  if (!estudiante || estudiante.trim() === "") {
    return res.status(400).render("reservas/nueva", {
      title: "Nueva reserva",
      error: "El estudiante es obligatorio",
      valores: req.body,
    });
  }

  const email = req.body.email;

  if (!email || !email.includes("@")) {
    return res.status(400).render("reservas/nueva", {
      title: "Nueva reserva",
      error: "El email no es válido",
      valores: req.body,
    });
  }

  const sala = req.body.sala;

  if (
    sala !== "Sala Norte" &&
    sala !== "Sala Sur" &&
    sala !== "Sala Multimedia"
  ) {
    return res.status(400).render("reservas/nueva", {
      title: "Nueva reserva",
      error: "La sala no es válida",
      valores: req.body,
    });
  }

  const fecha = req.body.fecha;

  if (!fecha || fecha.trim() === "") {
    return res.status(400).render("reservas/nueva", {
      title: "Nueva reserva",
      error: "La fecha es obligatoria",
      valores: req.body,
    });
  }

  const turno = req.body.turno;

  if (turno !== "Mañana" && turno !== "Tarde" && turno !== "Noche") {
    return res.status(400).render("reservas/nueva", {
      title: "Nueva reserva",
      error: "El turno no es válido",
      valores: req.body,
    });
  }

  const personas = Number(req.body.personas);

  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    return res.status(400).render("reservas/nueva", {
      title: "Nueva reserva",
      error: "La cantidad de personas debe ser un número entero entre 1 y 6",
      valores: req.body,
    });
  }

  req.reservaValidada = {
    estudiante: estudiante.trim(),
    email: email.trim(),
    sala,
    fecha: fecha.trim(),
    turno,
    personas,
  };

  next();
}

module.exports = validarReserva;
