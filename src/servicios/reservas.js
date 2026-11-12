const Reserva = require("../modelos/reservas");

function crearServicioReservas() {
  async function listar(filtro = {}) {
    const criterio = {};

    if (filtro.sala) {
      criterio.sala = filtro.sala;
    }

    return await Reserva.find(criterio);
  }

  async function consultar(sala, orden = "estudiante", pagina = 1, limite = 2) {
    const filtro = {};

    if(sala) {
      filtro.sala = sala.trim(); 
    }
    let criterioOrden = {};
    if (orden === "personas-asc") {
      criterioOrden = { personas: 1, _id: 1 }; 
    } else if (orden === "personas-desc") {
      criterioOrden = { personas: -1, _id: 1};
    }else {
      criterioOrden = { estudiante: 1, _id: 1};
    }

    const salto = (pagina - 1) * limite;

    const total = await Reserva.countDocuments(filtro);

    const reservas = await Reserva.find(filtro)
    .select("estudiante email sala fecha turno personas estado")
    .sort(criterioOrden)
    .skip(salto)
    .limit(limite)
    .lean();

    const datosMapeados = reservas.map((reserva) => ({
      id: reserva._id,
      estudiante: reserva.estudiante,
      email: reserva.email,
      sala: reserva.sala,
      fecha: reserva.fecha,
      turno: reserva.turno,
      personas: reserva.personas,
      estado: reserva.estado,
    }));

    const paginas = Math.ceil(total / limite);

    return {
      datos: datosMapeados,
      pagina: pagina,
      limite: limite,
      total: total,
      paginas: paginas
    };
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
    consultar,
    obtenerPorId,
    contar,
    crear,
    reemplazar,
    modificar,
    eliminar,
  };
}

module.exports = crearServicioReservas;
