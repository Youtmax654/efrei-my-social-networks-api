import { Router } from 'express';
import { getMe } from '../controllers/users.mjs';
import authRoutes from './auth.mjs';

const router = Router();

router.use("/auth", authRoutes);
router.use("/me", getMe);

export default router;