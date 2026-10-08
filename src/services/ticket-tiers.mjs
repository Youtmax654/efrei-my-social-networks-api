import mongoose from "mongoose";
import Event from "../models/event.mjs";
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

const ensureOrganizer = (event, userId) => {
  const isOrganizer = event.organizers.some(
    (organizerId) => organizerId.toString() === userId.toString()
  );

  if (!isOrganizer) {
    const error = new Error("Accès refusé : vous devez être organisateur de l'événement");
    error.status = 403;
    throw error;
  }
};

const normalizeTier = ({ name, price, totalQuantity }) => {
  if (typeof name !== "string" || !name.trim()) {
    const error = new Error("Le nom du tarif est obligatoire");
    error.status = 400;
    throw error;
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    const error = new Error("Le prix doit être un nombre positif ou nul");
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(totalQuantity) || totalQuantity < 1) {
    const error = new Error("La quantité totale doit être un entier supérieur à zéro");
    error.status = 400;
    throw error;
  }

  return { name: name.trim(), price, totalQuantity };
};

const ticketTierService = {
  createTicketTier: async (eventId, userId, tierData) => {
    const event = await getEventOrThrow(eventId);
    ensureTicketingAvailable(event);
    ensureOrganizer(event, userId);

    return await new TicketTier({
      ...normalizeTier(tierData),
      eventId: event._id,
    }).save();
  },

  getTicketTiers: async (eventId) => {
    const event = await getEventOrThrow(eventId);
    ensureTicketingAvailable(event);

    return await TicketTier.find({ eventId: event._id }).sort({ price: 1, name: 1 }).lean();
  },
};

export default ticketTierService;