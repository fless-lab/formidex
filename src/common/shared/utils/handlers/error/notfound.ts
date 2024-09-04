import { Request, Response, NextFunction } from 'express';
import ErrorResponse from './response';
import { ViewService } from '../../../services';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const viewService = new ViewService();
  if (req.accepts('html')) {
    return viewService.renderErrorPage(
      req,
      res,
      404,
      'Page Not Found',
      '404 - Not Found',
      'The page you are looking for does not exist.',
    );
  }
  next(new ErrorResponse('NOT_FOUND_ERROR', 'Resource Not Found'));
};

export default notFoundHandler;
