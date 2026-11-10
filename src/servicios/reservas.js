const Reserva = require("../modelos/reservas");

function crearServicioReservas() {
  async function listar(filtro = {}) {
    const criterio = {};

    if (filtro.sala) {
      criterio.sala = filtro.sala;
    }

    return await Reserva.find(criterio);
  }

  async function obtenerPorId(id) {
    return await Reserva.findById(id);
  }

  async function contar() {
    return await Reserva.countDocuments();
  }

  async function crear(datos) {
    const reservaLimpia = {
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
    };

    const nuevaReserva = new Reserva(reservaLimpia);
    return await nuevaReserva.save();
  }

  async function reemplazar(id, datos) {
    const remplazo = {
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      estado: datos.estado,
    };

    return await Reserva.findByIdAndUpdate(id, remplazo, {
      returnDocument: 'after',
      runValidators: true,
      overwrite: true,
    });
  }

  async function modificar(id, datos) {
    const cambios = {};

    if (datos.persona !== undefined) cambios.persona = datos.persona;
    if (datos.estado !== undefined) cambios.estado = datos.estado;

    return await Reserva.findByIdAndUpdate(
      id,
      { $set: cambios },
      { returnDocument: 'after', runValidators: true },
    );
  }

  async function eliminar(id) {
    return await Reserva.findByIdAndDelete(id);
  }

  return {
    listar,
    obtenerPorId,
    contar,
    crear,
    reemplazar,
    modificar,
    eliminar,
  };
}

module.exports = crearServicioReservas;
