const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: [true, "El nombre del estudiante es obligatorio."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio."],
      trim: true,
      match: [/@/, "El email debe contener un carácter '@'."],
    },
    sala: {
      type: String,
      required: [true, "La sala es obligatoria."],
      enum: {
        values: ["Sala Norte", "Sala Sur", "Sala Multimedia"],
        message:
          "La sala debe ser 'Sala Norte', 'Sala Sur' o 'Sala Multimedia'.",
      },
    },
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria."],
      trim: true,
    },
    turno: {
      type: String,
      required: [true, "El turno es obligatorio."],
      enum: {
        values: ["Mañana", "Tarde", "Noche"],
        message: "El turno debe ser 'Mañana', 'Tarde' o 'Noche'.",
      },
    },
    personas: {
      type: Number,
      required: [true, "El número de personas es obligatorio."],
      min: [1, "El número de personas debe ser como mínimo 1."],
      max: [6, "El número de personas debe ser como máximo 6."],
      validate: {
        validator: Number.isInteger,
        message: "El número de personas debe ser un número entero.",
      },
    },
    estado: {
      type: String,
      default: "pendiente",
      enum: {
        values: ["pendiente", "confirmada"],
        message: "El estado debe ser 'pendiente' o 'confirmada'.",
      },
    },
  },
  {
    versionKey: false,
  },
);

const Reserva = mongoose.model("Reserva", reservaSchema, "reservas");

module.exports = Reserva;
