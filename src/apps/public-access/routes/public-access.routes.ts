import { Router } from 'express';
import { PublicAccessController } from '../controllers';

const router = Router();

router.use((req, res, next) => {
  req.app.set('layout', 'public/layouts/main');
  next();
});

router.get('/', PublicAccessController.showHomePage);
router.get('/dev/routes/list', PublicAccessController.showRouteListPage);

export default router;
