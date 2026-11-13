import { ZodError } from 'zod';
import { AppError } from './errorHandler.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.body) dataToValidate.body = req.body;
    if (schema.query) dataToValidate.query = req.query;
    if (schema.params) dataToValidate.params = req.params;

    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issue = error.issues[0];
      const message = issue ? `${issue.path.join('.')}: ${issue.message}` : 'Validation failed';
      return next(new AppError(message, 400, 'VALIDATION_ERROR', error.format()));
    }
    next(error);
  }
};
