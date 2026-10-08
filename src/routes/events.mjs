import { Router } from "express";
import { attendEvent, createEvent, deleteEvent, getEventById, getEvents, leaveEvent, updateEvent } from "../controllers/events.mjs";

const router = Router();

router.post("/", createEvent);
router.post("/:id/attend", attendEvent);
router.post("/:id/leave", leaveEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;