// @ts-nocheck
import { Request, Response, NextFunction } from 'express';

export const injectOldInputMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const formKey = req.originalUrl;
  req.session.oldInput = req.session.oldInput || {};
  res.locals.oldInput = req.session.oldInput[formKey] || {};
  delete req.session.oldInput[formKey];
  next();
};
