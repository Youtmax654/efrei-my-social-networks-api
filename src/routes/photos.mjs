import { Router } from "express";
import { deletePhoto } from "../controllers/albums.mjs";

const router = Router();

router.delete("/:photoId", deletePhoto);

export default router;