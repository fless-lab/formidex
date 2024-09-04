/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { ViewService } from '../../../common/shared';

const path_pre = 'public/';

class PublicAccessController {
  static async showHomePage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const viewService = new ViewService();
      viewService.renderPage(req, res, 'public/pages/home');
    } catch (error) {
      const viewService = new ViewService();
      viewService.renderErrorPage(req, res, 500, 'Internal Server Error');
    }
  }
}

export default PublicAccessController;
