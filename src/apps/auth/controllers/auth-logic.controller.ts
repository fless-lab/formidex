/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { AuthService, OTPService } from '../services';
import {
  ApiResponse,
  ErrorResponseType,
  SessionService,
  ViewService,
} from '../../../common/shared';
import { config } from '../../../core/config';

export class AuthLogicController {
  private viewService: ViewService;

  constructor() {
    this.viewService = new ViewService();
  }

  // REGISTER
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AuthService.register(req.body);
      if (response.success) {
        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/login',
            'Account created! Please log in to verify your account.',
            'success',
          );
        } else {
          ApiResponse.success(res, response, 201);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/register', error, next);
    }
  }

  // VERIFY ACCOUNT
  async verifyAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AuthService.verifyAccount(req.body);
      if (response.success) {
        if (req.accepts('html')) {
          // @ts-ignore
          const fromUrl = req.session.returnTo || '/';
          this.viewService.redirectWithFlash(
            req,
            res,
            fromUrl,
            'Account verified successfully.',
            'success',
          );
        } else {
          ApiResponse.success(res, response);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/verify', error, next);
    }
  }

  // LOGIN WITH PASSWORD
  async loginWithPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log('req.body', req.body);
      const response = (await AuthService.loginWithPassword(req.body)) as any;
      console.log('response', response);
      const { success, document } = response;
      if (success) {
        if (req.accepts('html')) {
          const { accessToken, refreshToken } = document.token;
          SessionService.storeUserInSession(req, document.user);
          SessionService.storeTokensInSession(req, accessToken, refreshToken);
          // @ts-ignore
          const fromUrl = req.session.returnTo || '/';
          this.viewService.redirectWithFlash(
            req,
            res,
            fromUrl,
            'Login successful.',
            'success',
          );
        } else {
          ApiResponse.success(res, response);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/login', error, next);
    }
  }

  // GENERATE LOGIN OTP
  async generateLoginOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;

      const response = await AuthService.generateLoginOtp(email);
      if (response.success) {
        // Stocker l'email dans la session pour utilisation lors de la validation de l'OTP
        req.session.emailForLoginOtp = email;

        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/confirm-otp',
            'OTP sent to your email.',
            'success',
          );
        } else {
          ApiResponse.success(res, response);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/generate-otp', error, next);
    }
  }

  // LOGIN WITH OTP
  async loginWithOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Récupérer l'email stocké dans la session
      const email = req.session.emailForLoginOtp;

      if (!email) {
        // Rediriger vers la page "generate otp" avec un message flash
        this.viewService.redirectWithFlash(
          req,
          res,
          '/auth/login/otp',
          'Session expired or email not found. Please generate a new OTP.',
          'error',
        );
        return;
      }

      const otpData = { ...req.body, email };

      const response = (await AuthService.loginWithOtp(otpData)) as any;
      const { success, document } = response;

      if (success) {
        if (req.accepts('html')) {
          const { accessToken, refreshToken } = document.token;
          // Supprimer l'email de la session après une connexion réussie
          delete req.session.emailForLoginOtp;
          // Stocker les informations de l'utilisateur dans la session
          SessionService.storeUserInSession(req, document.user);
          SessionService.storeTokensInSession(req, accessToken, refreshToken);

          // Rediriger vers la page précédente ou vers l'accueil
          const fromUrl = req.session.returnTo || '/';
          this.viewService.redirectWithFlash(
            req,
            res,
            fromUrl,
            'Login successful.',
            'success',
          );
        } else {
          ApiResponse.success(res, response);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/confirm-otp', error, next);
    }
  }

  // REFRESH TOKEN
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await AuthService.refresh(req.body.refreshToken);
      if (response.success) {
        ApiResponse.success(res, response);
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  // LOGOUT
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken, refreshToken } = req.body;
      const response = await AuthService.logout(accessToken, refreshToken);
      if (response.success) {
        if (req.accepts('html')) {
          req.session.destroy(() => {
            res.redirect(config.webAuth.loginEndpoint);
          });
        } else {
          ApiResponse.success(res, response, 202);
        }
      } else {
        throw response;
      }
    } catch (error) {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }

  // FORGOT PASSWORD
  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;

      const response = await AuthService.forgotPassword(email);
      if (response.success) {
        // Stocker l'email dans la session pour réinitialiser le mot de passe plus tard
        req.session.emailForResetPassword = email;

        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/reset-password',
            'Password reset email sent. Please check your email to continue.',
            'success',
          );
        } else {
          ApiResponse.success(res, response);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/forgot-password', error, next);
    }
  }

  // RESET PASSWORD
  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Récupérer l'email stocké dans la session
      const email = req.session.emailForResetPassword;

      if (!email) {
        // Rediriger vers la page "forgot password" avec un message flash
        this.viewService.redirectWithFlash(
          req,
          res,
          '/auth/forgot-password',
          'Session expired or email not found. Please enter your email again.',
          'error',
        );
        return;
      }

      const resetData = { ...req.body, email };

      const response = await AuthService.resetPassword(resetData);
      if (response.success) {
        // Supprimer l'email de la session après une réinitialisation réussie
        delete req.session.emailForResetPassword;

        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/login',
            'Password reset successfully. You can now log in.',
            'success',
          );
        } else {
          ApiResponse.success(res, response);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/reset-password', error, next);
    }
  }

  // RESEND OTP FOR ACCOUNT VERIFICATION
  async resendVerificationOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const purpose = config.otp.purposes.ACCOUNT_VERIFICATION.code;

      const response = await OTPService.generate(email, purpose);

      if (response.success) {
        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/confirm-otp',
            'A new verification code has been sent to your email.',
            'success',
          );
        } else {
          ApiResponse.success(res, response, 201);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/verify', error, next);
    }
  }

  // RESEND LOGIN OTP
  async resendLoginOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const purpose = config.otp.purposes.LOGIN_CONFIRMATION.code;

      const response = await OTPService.generate(email, purpose);

      if (response.success) {
        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/confirm-otp',
            'A new login OTP has been sent to your email.',
            'success',
          );
        } else {
          ApiResponse.success(res, response, 201);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/login', error, next);
    }
  }

  // RESEND RESET PASSWORD OTP
  async resendResetPasswordOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const purpose = config.otp.purposes.FORGOT_PASSWORD.code;

      const response = await OTPService.generate(email, purpose);

      if (response.success) {
        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/reset-password',
            'A new password reset OTP has been sent to your email.',
            'success',
          );
        } else {
          ApiResponse.success(res, response, 201);
        }
      } else {
        throw response;
      }
    } catch (error) {
      this.handleError(req, res, 'auth/pages/reset-password', error, next);
    }
  }

  // HANDLING ERRORS
  private handleError(
    req: Request,
    res: Response,
    view: string,
    error: any,
    next: NextFunction,
  ) {
    if (req.accepts('html')) {
      const realError = error.error;
      this.viewService.handleError(req, res, realError, 'auth/pages/login');
    } else {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}
