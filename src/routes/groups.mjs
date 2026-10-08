import { Router } from 'express';
import { addMember, createGroup, deleteGroup, getGroupById, getGroups, joinGroup, leaveGroup, updateAdmin, updateGroup } from '../controllers/groups.mjs';

const router = Router();

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroupById);
router.patch("/:id", updateGroup);
router.delete("/:id", deleteGroup);
router.post("/:id/join", joinGroup);
router.post("/:id/leave", leaveGroup);
router.post("/:id/members", addMember);
router.patch("/:id/admins", updateAdmin);

export default router;