/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { ViewService } from '../../../common/shared';

class PublicAccessController {
  static async showHomePage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const viewService = new ViewService();
      viewService.renderPage(req, res, 'public/pages/home', {
        title: 'Welcome To Formidex',
      });
    } catch (error) {
      const viewService = new ViewService();
      viewService.renderErrorPage(
        req,
        res,
        500,
        (error as any).message || 'Internal Server Error',
      );
    }
  }
}

export default PublicAccessController;
