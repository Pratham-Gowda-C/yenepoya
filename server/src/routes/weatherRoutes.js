import { Router } from 'express';
import * as weatherController from '../controllers/weatherController.js';
import { authenticateFarmer } from '../middleware/auth.js';

const router = Router();

router.use(authenticateFarmer);

router.get('/current', weatherController.getCurrentWeather);
router.get('/forecast', weatherController.getWeatherForecast);

export default router;
