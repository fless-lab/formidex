import { Router } from 'express';
import { authenticateRequest } from '../../../common/shared';
import { MicroSaasController } from '../controllers/micro-saas.controller';

const router = Router();

router.use(authenticateRequest); // Authenticate all micro-saas routes
router.use((req, res, next) => {
  req.app.set('layout', 'restricted/layouts/main');
  next();
});

router.get('/', MicroSaasController.showDashboard);

export default router;
