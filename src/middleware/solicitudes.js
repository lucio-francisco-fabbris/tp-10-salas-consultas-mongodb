let siguienteSolicitudId = 1;

function identificarSolicitud(req, res, next) {
  const numero = String(siguienteSolicitudId).padStart(4, "0");

  res.locals.solicitudId = `BIB-${numero}`;
  siguienteSolicitudId++;

  next();
}

function medirDuracion(req, res, next) {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracion = Date.now() - inicio;

    console.log(
      `${res.locals.solicitudId} - ${req.method} - ${req.originalUrl} - ${res.statusCode} - ${duracion} ms`,
    );
  });

  next();
}

module.exports = {
  identificarSolicitud,
  medirDuracion,
};
