import { Router } from 'express';
import authRoutes from './auth.mjs';

const router = Router();

router.use("/auth", authRoutes);

export default router;