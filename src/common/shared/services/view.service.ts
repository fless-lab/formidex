import { Application, Request, Response } from 'express';

class ViewService {
  // constructor(app: Application) {
  //   this.setup(app);
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private setup(app: Application) {
    //
  }

  renderPage(req: Request, res: Response, view: string, options: any = {}) {
    res.render(view, {
      ...options,
      title: options.title || 'Formidex',
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
    const view = `errors/${statusCode}`;
    res.status(statusCode).render(view, {
      title,
      message,
      additionalMessage,
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
