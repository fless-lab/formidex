import { Router } from 'express';
import {
  forgotPasswordSchema,
  generateLoginOtpSchema,
  loginWithOtpSchema,
  loginWithPasswordSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyAccountSchema,
} from '../validators';
import { validate, bruteForceMiddleware } from '../../../common/shared';
import { AuthLogicController } from '../controllers';

const router = Router();
const authLogicController = new AuthLogicController();

router.post(
  '/login',
  validate(loginWithPasswordSchema),
  bruteForceMiddleware,
  authLogicController.loginWithPassword.bind(authLogicController),
);
router.post(
  '/register',
  validate(registerSchema),
  authLogicController.register.bind(authLogicController),
);
router.post(
  '/verify',
  validate(verifyAccountSchema),
  authLogicController.verifyAccount.bind(authLogicController),
);
router.post(
  '/login/otp',
  validate(generateLoginOtpSchema),
  authLogicController.generateLoginOtp.bind(authLogicController),
);
router.post(
  '/login/otp/confirm',
  validate(loginWithOtpSchema),
  bruteForceMiddleware,
  authLogicController.loginWithOtp.bind(authLogicController),
);
router.post(
  '/refresh',
  validate(refreshSchema),
  authLogicController.refreshToken.bind(authLogicController),
);
router.post(
  '/logout',
  validate(logoutSchema),
  authLogicController.logout.bind(authLogicController),
);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authLogicController.forgotPassword.bind(authLogicController),
);
router.patch(
  '/reset-password',
  validate(resetPasswordSchema),
  authLogicController.resetPassword.bind(authLogicController),
);

export default router;
