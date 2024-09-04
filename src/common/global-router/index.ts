import { Router } from 'express';
import {
  AuthRoutes,
  OTPRoutes,
  PublicAccessRoutes,
  UserRoutes,
} from '../../apps';

const router = Router();

router.use('/', PublicAccessRoutes);
router.use('/users', UserRoutes);
router.use('/otp', OTPRoutes);
router.use('/auth', AuthRoutes);

export default router;
