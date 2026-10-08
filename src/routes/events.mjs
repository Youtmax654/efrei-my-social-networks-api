import { Router } from "express";
import { createEvent, deleteEvent, getEventById, getEvents, updateEvent } from "../controllers/events.mjs";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;