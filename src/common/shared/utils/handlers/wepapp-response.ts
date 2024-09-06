import { Request, Response } from 'express';
import { ErrorResponseType } from '../../types';
import { WebResponse } from './web-response';
import ApiResponse from './api-reponse';

export class WebAppResponse {
  static handleError(
    req: Request,
    res: Response,
    error: ErrorResponseType,
  ): void {
    const isHtml = req.accepts('html');

    if (isHtml) {
      WebResponse.error(
        req,
        res,
        error.error.statusCode || 500,
        error.error.message || 'An error occurred',
      );
    } else {
      ApiResponse.error(res, error);
    }
  }
}
