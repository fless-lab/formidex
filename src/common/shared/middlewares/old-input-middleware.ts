// @ts-nocheck
import { Request, Response, NextFunction } from 'express';

export const oldInputMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const allowedMethods = ['POST', 'PATCH', 'PUT'];
  if (allowedMethods.includes(req.method)) {
    const formKey = req.originalUrl;

    req.session.oldInput = req.session.oldInput || {};
    req.session.oldInput[formKey] = req.body;

    const successStatusCodes = [200, 201, 202, 204, 301, 302, 303];
    res.on('finish', () => {
      if (successStatusCodes.includes(res.statusCode)) {
        delete req.session.oldInput?.[formKey];
      }
    });
  }
  next();
};
