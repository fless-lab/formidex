// @ts-nocheck
import { Request, Response } from 'express';
import { ErrorResponse } from '../utils';

class ViewService {
  private render(
    req: Request,
    res: Response,
    view: string,
    options: any = {},
    statusCode = 200,
  ) {
    const user = req.session.user || null;

    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');

    if (options.error instanceof ErrorResponse) {
      const error = options.error;
      statusCode = error.statusCode;
      options.suggestions = error.suggestions;

      options.errorMessages = errorMessages.concat(error.message);
    }

    const baseTitle = 'Formidex';
    const pageTitle = options.title
      ? `${options.title} - ${baseTitle}`
      : baseTitle;

    res.status(statusCode).render(view, {
      ...options,
      title: pageTitle,
      user,
      successMessages,
      errorMessages: options.errorMessages || errorMessages,
    });
  }

  renderPage(req: Request, res: Response, view: string, options: any = {}) {
    this.render(req, res, view, options);
  }

  renderErrorPage(
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    title = 'Error',
    additionalMessage = '',
  ) {
    this.render(
      req,
      res,
      `errors/${statusCode}`,
      {
        title,
        message,
        additionalMessage,
      },
      statusCode,
    );
  }

  redirectWithFlash(
    req: Request,
    res: Response,
    route: string,
    message: string,
    type: 'success' | 'error',
  ) {
    req.flash(type, message);
    res.redirect(route);
  }

  handleError(req: Request, res: Response, error: ErrorResponse, view: string) {
    this.render(req, res, view, { error });
  }
}

export default ViewService;
