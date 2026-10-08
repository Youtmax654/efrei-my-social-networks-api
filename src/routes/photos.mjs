import { Router } from "express";
import { deletePhoto } from "../controllers/albums.mjs";
import { createComment, getComments } from "../controllers/photo-comments.mjs";

const router = Router();

router.get("/:photoId/comments", getComments);
router.post("/:photoId/comments", createComment);
router.delete("/:photoId", deletePhoto);

export default router;