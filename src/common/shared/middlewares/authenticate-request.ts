import { Request, Response, NextFunction } from 'express';
import {
  JwtService,
  AsyncStorageService,
  logger,
  SessionService,
} from '../services';
import { authRedirect } from './auth-redirect';

export const authenticatedRequest = (
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
      return authRedirect(req, res, next);
    }
  } else {
    JwtService.verifyAccessToken(req, res, (authErr: any) => {
      if (authErr) {
        return next(authErr);
      }
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
