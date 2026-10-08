import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  fullAddress: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
}, { _id: false });

const ticketPurchaseSchema = new mongoose.Schema({
  ticketTierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TicketTier",
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  buyer: {
    type: buyerSchema,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "ticketPurchases",
  minimize: false,
  versionKey: false,
});

ticketPurchaseSchema.index({ eventId: 1, "buyer.email": 1 }, { unique: true });

const TicketPurchase = mongoose.model("TicketPurchase", ticketPurchaseSchema);

export default TicketPurchase;