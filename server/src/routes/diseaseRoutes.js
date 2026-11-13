import { Router } from 'express';
import * as diseaseController from '../controllers/diseaseController.js';
import { authenticateFarmer } from '../middleware/auth.js';
import { uploadCropImage } from '../middleware/upload.js';

const router = Router();

router.use(authenticateFarmer);

router.post('/diagnose', uploadCropImage.single('image'), diseaseController.diagnoseDisease);
router.get('/history', diseaseController.getDiseaseHistory);

export default router;
