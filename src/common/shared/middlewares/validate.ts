import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { ApiResponse, ErrorResponse } from '../utils';
import { ViewService } from '../services';

const viewService = new ViewService();

export const validate = (schema: ObjectSchema, viewName?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const { details } = error;
      const errorMessages = details.map((i) => i.message);
      const errorResponse = new ErrorResponse(
        'VALIDATION_ERROR',
        errorMessages.join(','),
      );
      if (req.accepts('html')) {
        const generalErrorView = 'errors/500';
        viewService.handleError(
          req,
          res,
          errorResponse,
          viewName || generalErrorView,
        );
      } else {
        return ApiResponse.error(res, {
          success: false,
          error: {
            message: errorResponse.message,
            suggestions: errorResponse.suggestions,
            statusCode: errorResponse.statusCode,
          } as any,
        });
      }
    } else {
      next();
    }
  };
};
