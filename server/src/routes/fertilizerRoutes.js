import { Router } from 'express';
import * as fertilizerController from '../controllers/fertilizerController.js';
import { authenticateFarmer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { fertilizerAdvisorySchema } from '../validators/index.js';

const router = Router();

router.use(authenticateFarmer);

router.post('/recommend', validate(fertilizerAdvisorySchema), fertilizerController.recommendFertilizer);
router.get('/history', fertilizerController.getFertilizerHistory);

export default router;
