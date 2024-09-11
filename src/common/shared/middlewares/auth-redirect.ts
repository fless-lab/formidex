import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services';

export const authRedirect = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!SessionService.isAuthenticated(req)) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};
