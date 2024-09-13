import { Router } from 'express';
import authViewsRoutes from './auth.views.routes';

const router = Router();

router.use((req, res, next) => {
  req.app.set('layout', 'auth/layouts/main');
  next();
});

router.use('/', authViewsRoutes);

export default router;
