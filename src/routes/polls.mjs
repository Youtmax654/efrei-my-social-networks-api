import { Router } from "express";
import { closePoll } from "../controllers/polls.mjs";

const router = Router();

router.patch("/:pollId/close", closePoll);

export default router;