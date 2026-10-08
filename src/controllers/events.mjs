import eventService from "../services/events.mjs";

const getUserId = (req) => {
  const userId = req.user?._id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return userId;
};

export const createEvent = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title, description, startDate, endDate, location, coverUrl, isPublic,
      groupId, ticketingEnabled, shoppingListEnabled, carpoolingEnabled } = req.body || {};

    if (!title || !description || !startDate || !endDate || !location) {
      const error = new Error("Tous les champs obligatoires doivent être renseignés");
      error.status = 400;
      throw error;
    }

    const event = await eventService.createEvent({
      title, description, startDate, endDate, location, coverUrl, isPublic,
      groupId, ticketingEnabled, shoppingListEnabled, carpoolingEnabled,
    }, userId);

    res.status(201).json(event);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const createGroupEvent = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title, description, startDate, endDate, location, coverUrl, isPublic,
      ticketingEnabled, shoppingListEnabled, carpoolingEnabled } = req.body || {};

    if (!title || !description || !startDate || !endDate || !location) {
      const error = new Error("Tous les champs obligatoires doivent être renseignés");
      error.status = 400;
      throw error;
    }

    const event = await eventService.createGroupEvent({
      title, description, startDate, endDate, location, coverUrl, isPublic,
      ticketingEnabled, shoppingListEnabled, carpoolingEnabled,
    }, userId, req.group);

    res.status(201).json(event);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await eventService.getEvents(getUserId(req));
    res.status(200).json(events);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id, getUserId(req));
    if (!event) {
      const error = new Error("Événement introuvable");
      error.status = 404;
      throw error;
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body || {}, getUserId(req));
    res.status(200).json(event);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await eventService.deleteEvent(req.params.id, getUserId(req));
    res.status(200).json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};