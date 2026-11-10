function formatearReserva(reservaDoc) {
  if (!reservaDoc) return null;
  const obj = reservaDoc.toObject ? reservaDoc.toObject() : reservaDoc;
  const { _id, ...resto } = obj;
  return {
    id: _id.toString(),
    ...resto,
  };
}

module.exports = { formatearReserva };
