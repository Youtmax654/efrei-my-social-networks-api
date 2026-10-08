import { Router } from "express";
import { addPhoto, getAlbum } from "../controllers/albums.mjs";
import { attendEvent, createEvent, deleteEvent, getEventById, getEvents, leaveEvent, updateEvent } from "../controllers/events.mjs";
import { createPoll } from "../controllers/polls.mjs";

const router = Router();

router.post("/", createEvent);
router.post("/:id/attend", attendEvent);
router.post("/:id/leave", leaveEvent);
router.get("/:eventId/album", getAlbum);
router.post("/:eventId/album/photos", addPhoto);
router.post("/:eventId/polls", createPoll);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;