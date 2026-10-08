import { Router } from 'express';
import { createGroup, deleteGroup, getGroupById, getGroups, updateGroup } from '../controllers/groups.mjs';

const router = Router();

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroupById);
router.patch("/:id", updateGroup);
router.delete("/:id", deleteGroup);

export default router;