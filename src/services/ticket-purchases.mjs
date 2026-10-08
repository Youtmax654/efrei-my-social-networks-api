import mongoose from "mongoose";
import validator from "validator";
import Event from "../models/event.mjs";
import TicketPurchase from "../models/ticket-purchase.mjs";
import TicketTier from "../models/ticket-tier.mjs";

const invalidIdError = () => {
  const error = new Error("Identifiant invalide");
  error.status = 400;
  return error;
};

const getEventOrThrow = async (eventId) => {
  if (!mongoose.isValidObjectId(eventId)) {
    throw invalidIdError();
  }

  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Événement introuvable");
    error.status = 404;
    throw error;
  }

  return event;
};

const ensureTicketingAvailable = (event) => {
  if (event.isPublic !== true || event.ticketingEnabled !== true) {
    const error = new Error("La billetterie est disponible uniquement pour les événements publics activés");
    error.status = 403;
    throw error;
  }
};

const normalizeBuyer = ({ firstName, lastName, fullAddress, email }) => {
  if (![firstName, lastName, fullAddress, email].every((value) => typeof value === "string" && value.trim())) {
    const error = new Error("Les informations de l'acheteur sont obligatoires");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!validator.isEmail(normalizedEmail)) {
    const error = new Error("L'adresse email n'est pas valide");
    error.status = 400;
    throw error;
  }

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    fullAddress: fullAddress.trim(),
    email: normalizedEmail,
  };
};

const ticketPurchaseService = {
  purchaseTicket: async (eventId, ticketTierId, buyerData) => {
    const event = await getEventOrThrow(eventId);
    ensureTicketingAvailable(event);

    if (!mongoose.isValidObjectId(ticketTierId)) {
      throw invalidIdError();
    }

    const tier = await TicketTier.findOne({ _id: ticketTierId, eventId: event._id });
    if (!tier) {
      const error = new Error("Palier tarifaire introuvable pour cet événement");
      error.status = 404;
      throw error;
    }

    const buyer = normalizeBuyer(buyerData);
    const existingPurchase = await TicketPurchase.exists({ eventId: event._id, "buyer.email": buyer.email });
    if (existingPurchase) {
      const error = new Error("Cette adresse email possède déjà un billet pour cet événement");
      error.status = 409;
      throw error;
    }

    const reservedTier = await TicketTier.findOneAndUpdate(
      {
        _id: tier._id,
        eventId: event._id,
        $expr: { $lt: ["$soldQuantity", "$totalQuantity"] },
      },
      { $inc: { soldQuantity: 1 } },
      { new: true }
    );

    if (!reservedTier) {
      const error = new Error("Ce tarif est épuisé");
      error.status = 409;
      throw error;
    }

    try {
      return await new TicketPurchase({
        ticketTierId: reservedTier._id,
        eventId: event._id,
        buyer,
      }).save();
    } catch (error) {
      await TicketTier.updateOne(
        { _id: reservedTier._id, soldQuantity: { $gt: 0 } },
        { $inc: { soldQuantity: -1 } }
      );

      if (error?.code === 11000) {
        const duplicateError = new Error("Cette adresse email possède déjà un billet pour cet événement");
        duplicateError.status = 409;
        throw duplicateError;
      }
      throw error;
    }
  },
};

export default ticketPurchaseService;