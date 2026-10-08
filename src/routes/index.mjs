import { Router } from 'express';
import { getMe } from '../controllers/users.mjs';
import authRoutes from './auth.mjs';
import eventsRoutes from './events.mjs';
import groupsRoutes from './groups.mjs';
import photosRoutes from './photos.mjs';
import threadsRoutes from './threads.mjs';

const router = Router();

router.use("/auth", authRoutes);
router.use("/me", getMe);
router.use("/groups", groupsRoutes);
router.use("/events", eventsRoutes);
router.use("/threads", threadsRoutes);
router.use("/photos", photosRoutes);

export default router;