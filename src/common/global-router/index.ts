import { Router } from 'express';
import {
  AuthRoutes,
  MicroSaasRoutes,
  OTPRoutes,
  PublicAccessRoutes,
} from '../../apps';

const router = Router();

router.use('/', PublicAccessRoutes);
router.use('/micro-saas', MicroSaasRoutes);
router.use('/otp', OTPRoutes);
router.use('/auth', AuthRoutes);

export default router;
