import Joi from 'joi';
import { USER_ROLES } from '../../../../core/constants';

export const createUserSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(USER_ROLES).optional(),
  profilePhoto: Joi.string().optional(),
});
