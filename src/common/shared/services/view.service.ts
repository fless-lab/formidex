// @ts-nocheck
import { Request, Response } from 'express';

class ViewService {
  // private setup(app: Application) {
  // Setup logic if necessary
  // }

  renderPage(req: Request, res: Response, view: string, options: any = {}) {
    const user = req.session.user || null;

    res.render(view, {
      ...options,
      title: options.title || 'Formidex',
      user,
      successMessages: req.flash('success'),
      errorMessages: req.flash('error'),
    });
  }

  renderErrorPage(
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    title = 'Error',
    additionalMessage = '',
  ) {
    const user = req.session.user || null;

    const view = `errors/${statusCode}`;
    res.status(statusCode).render(view, {
      title,
      message,
      additionalMessage,
      user,
      successMessages: req.flash('success'),
      errorMessages: req.flash('error'),
    });
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
}

export default ViewService;
