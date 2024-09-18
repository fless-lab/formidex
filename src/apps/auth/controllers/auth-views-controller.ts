import { Request, Response } from 'express';
import { ViewService } from '../../../common/shared';

export class AuthViewsController {
  private viewService: ViewService;

  constructor() {
    this.viewService = new ViewService();
  }

  showLoginPage(req: Request, res: Response) {
    this.viewService.renderPage(req, res, 'auth/pages/login', {
      title: 'Login',
    });
  }

  showRegisterPage(req: Request, res: Response) {
    this.viewService.renderPage(req, res, 'auth/pages/register', {
      title: 'Register',
    });
  }

  showVerifyPage(req: Request, res: Response) {
    this.viewService.renderPage(req, res, 'auth/pages/verify-account', {
      title: 'Verify Account',
    });
  }

  showGenerateOtpPage(req: Request, res: Response) {
    this.viewService.renderPage(req, res, 'auth/pages/generate-otp', {
      title: 'Login with OTP',
    });
  }

  showConfirmOtpPage(req: Request, res: Response) {
    const { email } = req.query;
    this.viewService.renderPage(req, res, 'auth/pages/confirm-otp', {
      email,
      title: 'Confirm OTP',
    });
  }

  showForgotPasswordPage(req: Request, res: Response) {
    this.viewService.renderPage(req, res, 'auth/pages/forgot-password', {
      title: 'Forgot Password',
    });
  }

  showResetPasswordPage(req: Request, res: Response) {
    this.viewService.renderPage(req, res, 'auth/pages/reset-password', {
      title: 'Reset Password',
    });
  }
}
