/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
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
            '/auth/verify',
            'Account created! Please verify your account.',
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
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/login',
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
      const response = (await AuthService.loginWithPassword(req.body)) as any;
      const { success, document } = response;
      if (response.success) {
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
      const response = await AuthService.generateLoginOtp(req.body.email);
      if (response.success) {
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
      const response = (await AuthService.loginWithOtp(req.body)) as any;
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
      const response = await AuthService.forgotPassword(req.body.email);
      if (response.success) {
        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/reset-password',
            'Password reset email sent.',
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
      const response = await AuthService.resetPassword(req.body);
      if (response.success) {
        if (req.accepts('html')) {
          this.viewService.redirectWithFlash(
            req,
            res,
            '/auth/login',
            'Password reset successfully.',
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

  // HANDLING ERRORS
  private handleError(
    req: Request,
    res: Response,
    view: string,
    error: any,
    next: NextFunction,
  ) {
    if (req.accepts('html')) {
      this.viewService.renderPage(req, res, view, {
        errorMessages: [error.message || 'An error occurred'],
      });
    } else {
      ApiResponse.error(res, error as ErrorResponseType);
    }
  }
}
