import { Router } from 'express';
import { getMe } from '../controllers/users.mjs';
import authRoutes from './auth.mjs';
import groupsRoutes from './groups.mjs';

const router = Router();

router.use("/auth", authRoutes);
router.use("/me", getMe);
router.use("/groups", groupsRoutes);

export default router;