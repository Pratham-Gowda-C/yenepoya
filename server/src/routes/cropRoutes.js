import { Router } from 'express';
import * as cropController from '../controllers/cropController.js';
import { authenticateFarmer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cropRecommendationRequestSchema } from '../validators/index.js';

const router = Router();

router.use(authenticateFarmer);

router.post('/', validate(cropRecommendationRequestSchema), cropController.requestRecommendations);
router.get('/', cropController.listRecommendations);
router.get('/:id', cropController.getRecommendation);

export default router;
