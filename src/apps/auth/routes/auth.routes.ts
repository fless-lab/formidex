import { Router } from 'express';
import AuthLogicRoutes from './auth.logic.routes';
import AuthViewsRoutes from './auth.views.routes';

const router = Router();

router.use((req, res, next) => {
  req.app.set('layout', 'auth/layouts/main');
  next();
});

router.use('/', AuthViewsRoutes);
router.use('/e', AuthLogicRoutes); // e for execute (This is for executing the logic of the route)

export default router;
