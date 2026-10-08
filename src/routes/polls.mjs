import { Router } from "express";
import { closePoll, getPollResults, votePoll } from "../controllers/polls.mjs";

const router = Router();

router.patch("/:pollId/close", closePoll);
router.post("/:pollId/vote", votePoll);
router.get("/:pollId/results", getPollResults);

export default router;