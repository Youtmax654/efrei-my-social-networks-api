import mongoose from "mongoose";

const ticketTierSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: "La quantité totale doit être un entier",
    },
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  collection: "ticketTiers",
  minimize: false,
  versionKey: false,
});

ticketTierSchema.index({ eventId: 1 });

const TicketTier = mongoose.model("TicketTier", ticketTierSchema);

export default TicketTier;