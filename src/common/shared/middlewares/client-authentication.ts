import { Request, Response, NextFunction } from 'express';
import { logger } from '../services';
import { config } from '../../../core/config';
import { ErrorResponse, WebAppResponse } from '../utils';

export const clientAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let clientToken: string | undefined;

  if (req.cookies && req.cookies['client_token']) {
    clientToken = req.cookies['client_token'];
  }

  if (!clientToken && req.headers['x-client-token']) {
    clientToken = req.headers['x-client-token'] as string;
  }

  if (!clientToken) {
    logger.warn(
      `Unauthorized access attempt from IP: ${req.ip} - No client token provided`,
    );
    const errorResponse = new ErrorResponse(
      'UNAUTHORIZED',
      'Client token is required for authentication',
    );

    return WebAppResponse.handleError(req, res, {
      success: false,
      error: errorResponse,
    });
  }

  const [username, password] = Buffer.from(clientToken, 'base64')
    .toString()
    .split(':');

  const validUser = config.basicAuthUser;
  const validPass = config.basicAuthPass;

  if (username === validUser && password === validPass) {
    logger.info(`Client authenticated successfully from IP: ${req.ip}`);
    return next();
  } else {
    logger.warn(
      `Forbidden access attempt from IP: ${req.ip} - Invalid credentials`,
    );
    const errorResponse = new ErrorResponse(
      'FORBIDDEN',
      'Invalid credentials provided for client authentication',
    );

    return WebAppResponse.handleError(req, res, {
      success: false,
      error: errorResponse,
    });
  }
};
