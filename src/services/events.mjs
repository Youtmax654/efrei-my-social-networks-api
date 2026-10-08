import mongoose from "mongoose";
import Event from "../models/event.mjs";

const invalidIdError = () => {
  const error = new Error("Identifiant invalide");
  error.status = 400;
  return error;
};

const validateEventDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    const error = new Error("La date de fin doit être postérieure à la date de début");
    error.status = 400;
    throw error;
  }
};

const getEventOrThrow = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw invalidIdError();
  }

  const event = await Event.findById(id);
  if (!event) {
    const error = new Error("Événement introuvable");
    error.status = 404;
    throw error;
  }

  return event;
};

const ensureOrganizer = (event, userId) => {
  const isOrganizer = event.organizers.some((organizerId) => organizerId.toString() === userId.toString());
  if (!isOrganizer) {
    const error = new Error("Accès refusé : vous devez être organisateur de l'événement");
    error.status = 403;
    throw error;
  }
};

const eventService = {
  createEvent: async (eventData, userId) => {
    validateEventDates(eventData.startDate, eventData.endDate);

    const event = new Event({
      ...eventData,
      organizers: [userId],
      participants: [userId],
    });

    return await event.save();
  },

  createGroupEvent: async (eventData, userId, group) => {
    validateEventDates(eventData.startDate, eventData.endDate);

    const participants = [...new Map(
      group.members.map((memberId) => [memberId.toString(), memberId])
    ).values()];

    const event = new Event({
      ...eventData,
      groupId: group._id,
      organizers: [userId],
      participants,
    });

    return await event.save();
  },

  getEvents: async (userId) => {
    return await Event.find({
      $or: [
        { isPublic: true },
        { organizers: userId },
        { participants: userId },
      ],
    })
      .populate("organizers", "firstName lastName email")
      .populate("participants", "firstName lastName email")
      .lean();
  },

  getEventById: async (id, userId) => {
    if (!mongoose.isValidObjectId(id)) {
      throw invalidIdError();
    }

    return await Event.findOne({
      _id: id,
      $or: [
        { isPublic: true },
        { organizers: userId },
        { participants: userId },
      ],
    })
      .populate("organizers", "firstName lastName email")
      .populate("participants", "firstName lastName email")
      .lean();
  },

  updateEvent: async (id, updateData, userId) => {
    const event = await getEventOrThrow(id);
    ensureOrganizer(event, userId);

    const nextStartDate = updateData.startDate ?? event.startDate;
    const nextEndDate = updateData.endDate ?? event.endDate;
    validateEventDates(nextStartDate, nextEndDate);

    const allowedUpdates = [
      "title", "description", "startDate", "endDate", "location", "coverUrl",
      "isPublic", "groupId", "ticketingEnabled", "shoppingListEnabled", "carpoolingEnabled",
    ];

    for (const key of Object.keys(updateData)) {
      if (allowedUpdates.includes(key)) {
        event[key] = updateData[key];
      }
    }

    return await event.save();
  },

  deleteEvent: async (id, userId) => {
    const event = await getEventOrThrow(id);
    ensureOrganizer(event, userId);
    await event.deleteOne();
  },
};

export default eventService;