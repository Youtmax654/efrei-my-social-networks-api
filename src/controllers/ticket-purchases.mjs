import ticketPurchaseService from "../services/ticket-purchases.mjs";

export const purchaseTicket = async (req, res) => {
  try {
    const purchase = await ticketPurchaseService.purchaseTicket(
      req.params.eventId,
      req.body?.ticketTierId,
      req.body?.buyer || {}
    );
    res.status(201).json(purchase);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};