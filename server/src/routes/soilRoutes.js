import { Router } from 'express';
import * as soilController from '../controllers/soilController.js';
import { authenticateFarmer } from '../middleware/auth.js';

const router = Router();

router.use(authenticateFarmer);

router.post('/analyze', soilController.analyzeSoil);

export default router;
