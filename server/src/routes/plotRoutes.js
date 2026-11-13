import { Router } from 'express';
import * as plotController from '../controllers/plotController.js';
import * as soilController from '../controllers/soilController.js';
import * as weatherController from '../controllers/weatherController.js';
import { authenticateFarmer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { plotCreateSchema, plotUpdateSchema, plotIdParamSchema, soilRecordCreateSchema } from '../validators/index.js';

const router = Router();

router.use(authenticateFarmer);

// Plot CRUD
router.get('/', plotController.listPlots);
router.post('/', validate(plotCreateSchema), plotController.createPlot);
router.get('/:id', validate(plotIdParamSchema), plotController.getPlot);
router.put('/:id', validate(plotUpdateSchema), plotController.updatePlot);
router.delete('/:id', validate(plotIdParamSchema), plotController.deletePlot);

// Nested routes for plot
router.get('/:id/soil-records', validate(plotIdParamSchema), soilController.getSoilRecords);
router.post('/:id/soil-records', validate(soilRecordCreateSchema), soilController.createSoilRecord);
router.get('/:id/weather', validate(plotIdParamSchema), weatherController.getPlotWeather);

export default router;
