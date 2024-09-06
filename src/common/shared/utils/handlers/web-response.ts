import { Request, Response } from 'express';
import { ViewService } from '../../services';

export class WebResponse {
  static success(
    req: Request,
    res: Response,
    view: string,
    options: any = {},
    statusCode = 200,
  ): void {
    const viewService = new ViewService();
    viewService.renderPage(req, res, view, { ...options, statusCode });
  }

  static error(
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    additionalMessage = '',
  ): void {
    const viewService = new ViewService();

    if (statusCode === 401) {
      return viewService.redirectWithFlash(
        req,
        res,
        '/auth/login',
        'You must be logged in to access this page.',
        'error',
      );
    }

    viewService.renderErrorPage(
      req,
      res,
      statusCode,
      message,
      'Error',
      additionalMessage,
    );
  }
}
