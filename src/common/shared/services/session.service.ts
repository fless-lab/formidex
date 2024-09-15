// @ts-nocheck

import { Request } from 'express';
import { IUser } from '../../../apps';
import { logger } from './logger.service';

export class SessionService {
  static storeUserInSession(req: Request, user: IUser): void {
    req.session.user = user;
  }

  static getUserFromSession(req: Request): void {
    return req.session.user;
  }

  static getUserIdFromSession(req: Request): string | null {
    return req.session.user?.id || null;
  }

  static clearSession(req: Request): void {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Error while destroying user session', err);
      }
    });
  }

  static storeTokensInSession(
    req: Request,
    accessToken: string,
    refreshToken: string,
  ): void {
    req.session.tokens = {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  static getAccessTokenFromSession(req: Request): string | null {
    return req.session.tokens?.access || null;
  }

  static getRefreshTokenFromSession(req: Request): string | null {
    return req.session.tokens?.refresh || null;
  }

  static isAuthenticated(req: Request): boolean {
    return !!req.session.user;
  }
}
