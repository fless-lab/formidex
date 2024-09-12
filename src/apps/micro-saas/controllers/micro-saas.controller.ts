import { Request, Response } from 'express';
import { ViewService } from '../../../common/shared';

class MicroSaasController {
  static showDashboard(req: Request, res: Response) {
    const viewService = new ViewService();
    viewService.renderPage(req, res, 'restricted/pages/dashboard', {
      title: 'Micro SaaS - Formidex',
    });
  }
}

export { MicroSaasController };
