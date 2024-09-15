import { Request, Response, NextFunction } from 'express';
import { logger, SessionService, ViewService } from '../services';
import { IUserModel, UserService, IOTPModel, OTPService } from '../../../apps';
import { SuccessResponseType } from '../types';
import { config } from '../../../core/config';
import { ApiResponse } from '../utils';

export const ensureVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const viewService = new ViewService();

  try {
    const userId = SessionService.getUserIdFromSession(req);

    const {
      success,
      error,
      document: user,
    } = (await UserService.findOne({
      _id: userId,
    })) as SuccessResponseType<IUserModel>;

    if (!success) {
      if (req.accepts('html')) {
        return viewService.redirectWithFlash(
          req,
          res,
          '/auth/login',
          'User not found. Please log in again.',
          'error',
        );
      } else {
        return ApiResponse.error(res, error as any);
      }
    }

    if (!user?.verified) {
      // @ts-ignore
      req.session.returnTo = req.originalUrl;

      try {
        const otpResponse = (await OTPService.generate(
          user?.email as string,
          config.otp.purposes.ACCOUNT_VERIFICATION.code,
        )) as SuccessResponseType<IOTPModel>;

        if (!otpResponse.success || !otpResponse.document) {
          throw new Error('Failed to generate OTP for account verification.');
        }

        if (req.accepts('html')) {
          return viewService.redirectWithFlash(
            req,
            res,
            '/auth/verify',
            'A verification code has been sent to your email. Please verify your account.',
            'success',
          );
        } else {
          return ApiResponse.success(res, otpResponse);
        }
      } catch (otpError) {
        logger.error('Error generating OTP:', otpError as Error);

        if (req.accepts('html')) {
          return viewService.redirectWithFlash(
            req,
            res,
            '/auth/verify',
            'Failed to generate OTP. Please try again.',
            'error',
          );
        } else {
          return ApiResponse.error(res, otpError as any);
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Error in ensureVerified middleware:', error as Error);

    if (req.accepts('html')) {
      return viewService.renderErrorPage(
        req,
        res,
        500,
        'Internal Server Error',
        'Verification error',
        (error as Error).message,
      );
    } else {
      return ApiResponse.error(res, error as any);
    }
  }
};
