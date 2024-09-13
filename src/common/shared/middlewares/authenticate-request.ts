import { Request, Response, NextFunction } from 'express';
import {
  JwtService,
  AsyncStorageService,
  logger,
  SessionService,
  ViewService,
} from '../services';
import { config } from '../../../core/config';

export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isHtmlRequest = req.accepts('html');

  if (isHtmlRequest) {
    const userId = SessionService.getUserIdFromSession(req);

    if (userId) {
      const asyncStorage = AsyncStorageService.getInstance();
      asyncStorage.run(() => {
        asyncStorage.set('currentUserId', userId);
        next();
      });
    } else {
      const viewService = new ViewService();
      // @ts-ignore
      req.session.returnTo = req.originalUrl;
      return viewService.redirectWithFlash(
        req,
        res,
        config.webAuth.loginEndpoint,
        'You must be logged in to access this page.',
        'error',
      );
    }
  } else {
    JwtService.verifyAccessToken(req, res, (authErr: any) => {
      if (authErr) {
        return next(authErr);
      }
      // @ts-ignore
      const payload = req.payload;
      if (payload && typeof payload.aud === 'string') {
        const userId = payload.aud;
        const asyncStorage = AsyncStorageService.getInstance();

        asyncStorage.run(() => {
          asyncStorage.set('currentUserId', userId);
          next();
        });
      } else {
        logger.warn(
          'Warning: Unable to attach user context, missing payload or audience field.',
        );
        next();
      }
    });
  }
};
