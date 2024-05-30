import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { InvalidRequestError } from '../errors';

const querySchema = Joi.object({
  language: Joi.string().required(),
  created: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
  limit: Joi.number().integer().optional(),
  page: Joi.number().integer().optional(),
  order: Joi.string().valid('asc', 'desc').optional(),
  sortBy: Joi.string().optional(),
});

export const validateQueryParams = (req: Request, res: Response, next: NextFunction) => {
  const { error: validationError } = querySchema.validate(req.query, { abortEarly: false });

  if (validationError) {
    const errorMessage = validationError.details.map(detail => detail.message).join()
    const error = new InvalidRequestError(errorMessage)

    return res.status(error.statusCode).json(error)
  }
  next();
};
