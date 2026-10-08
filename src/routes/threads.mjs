import { Router } from "express";
import { createMessage, createReply, getMessages } from "../controllers/threads.mjs";

const router = Router();

router.get("/:targetType/:targetId/messages", getMessages);
router.post("/:targetType/:targetId/messages", createMessage);
router.post("/messages/:messageId/replies", createReply);

export default router;