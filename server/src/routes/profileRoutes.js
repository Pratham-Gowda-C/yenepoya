import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authenticateFarmer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { profileUpdateSchema } from '../validators/index.js';

const router = Router();

router.use(authenticateFarmer);

router.get('/', profileController.getProfile);
router.put('/', validate(profileUpdateSchema), profileController.updateProfile);

export default router;
