import { Router } from 'express';
import profileRoutes from './profileRoutes.js';
import plotRoutes from './plotRoutes.js';
import soilRoutes from './soilRoutes.js';
import cropRoutes from './cropRoutes.js';
import diseaseRoutes from './diseaseRoutes.js';
import fertilizerRoutes from './fertilizerRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import chatRoutes from './chatRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/plots', plotRoutes);
router.use('/soil', soilRoutes);
router.use('/crop-recommendations', cropRoutes);
router.use('/disease', diseaseRoutes);
router.use('/fertilizer', fertilizerRoutes);
router.use('/weather', weatherRoutes);
router.use('/chat', chatRoutes);

export default router;
