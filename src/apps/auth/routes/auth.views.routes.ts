import { Router } from 'express';
import { AuthViewsController } from '../controllers';
import { authenticateRequest } from '../../../common/shared';

const router = Router();
const authViewsController = new AuthViewsController();

router.get(
  '/login',
  authViewsController.showLoginPage.bind(authViewsController),
);
router.get(
  '/register',
  authViewsController.showRegisterPage.bind(authViewsController),
);
router.get(
  '/verify',
  authenticateRequest,
  authViewsController.showVerifyPage.bind(authViewsController),
);

router.get(
  '/login/otp',
  authViewsController.showGenerateOtpPage.bind(authViewsController),
);
router.get(
  '/login/otp/confirm',
  authViewsController.showConfirmOtpPage.bind(authViewsController),
);

router.get(
  '/forgot-password',
  authViewsController.showForgotPasswordPage.bind(authViewsController),
);
router.get(
  '/reset-password',
  authViewsController.showResetPasswordPage.bind(authViewsController),
);

export default router;
