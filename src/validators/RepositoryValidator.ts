import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { InvalidRequestError } from '../errors';

const customValidationForScoringCriteria = (value: string, helpers: Joi.CustomHelpers) => {
  const validKeys = ['stars', 'forks', 'recency'];
  const keys = value.split(',');

  if (keys.length > 2) {
    return helpers.error('any.custom', { customMessage: 'At most two values are allowed' });
  }

  for (const key of keys) {
    if (!validKeys.includes(key)) {
      return helpers.error('any.custom', { customMessage: `The valid values are ${validKeys}. ${key} is invalid` });
    }
  }

  return value;
}

const querySchema = Joi.object({
  language: Joi.string().required(),
  created: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
  limit: Joi.number().integer().optional(),
  page: Joi.number().integer().optional(),
  order: Joi.string().valid('asc', 'desc').optional(),
  sortBy: Joi.string().optional(),
  excludedScoreCriteria: Joi.string().custom(customValidationForScoringCriteria, 'custom validation').optional(),
});

export const validateQueryParams = (req: Request, res: Response, next: NextFunction) => {
  const { error: validationError } = querySchema.validate(req.query, { abortEarly: false });

  if (validationError) {
    const errorMessage = validationError.details.map(detail => detail.message).join()
    const customMessage = validationError.details.map(detail => detail.context?.customMessage).join()
    const error = new InvalidRequestError(customMessage || errorMessage)

    return res.status(error.statusCode).json(error)
  }
  next();
};
