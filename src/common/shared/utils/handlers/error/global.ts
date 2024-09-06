/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response, NextFunction } from 'express';
import ErrorResponse from './response';
import { WebAppResponse } from '../wepapp-response';
import { config } from '../../../../../core/config';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let errorResponse: ErrorResponse;

  if (err instanceof ErrorResponse) {
    errorResponse = err;
  } else {
    errorResponse = new ErrorResponse(
      'GENERAL_ERROR',
      err.message || 'An unexpected error occurred',
      [],
    );
  }

  const errorPayload = {
    success: false,
    error: {
      statusCode: errorResponse.statusCode,
      message: errorResponse.message,
      code: errorResponse.code,
      suggestions: errorResponse.suggestions,
    },
    stack: !config.runningProd ? err.stack : undefined,
  };

  WebAppResponse.handleError(req, res, errorPayload as any);
};

export default errorHandler;
