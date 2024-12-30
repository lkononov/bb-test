import express from 'express';

import rollerCoasterController from './controllers/rollerCoaster';
import healthCheckController from './controllers/healthCheck';

const router = express.Router();

router.use('/api/coasters', rollerCoasterController);
router.use('/healthcheck', healthCheckController);

export default router;
