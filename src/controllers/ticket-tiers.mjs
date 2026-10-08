import ticketTierService from "../services/ticket-tiers.mjs";

const getUserId = (req) => {
  const userId = req.user?._id;
  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return userId;
};

export const createTicketTier = async (req, res) => {
  try {
    const tier = await ticketTierService.createTicketTier(
      req.params.eventId,
      getUserId(req),
      req.body || {}
    );
    res.status(201).json(tier);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getTicketTiers = async (req, res) => {
  try {
    const tiers = await ticketTierService.getTicketTiers(req.params.eventId);
    res.status(200).json(tiers);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};