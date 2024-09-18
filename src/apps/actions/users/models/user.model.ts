import { CallbackError, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUserModel } from '../types';
import { BaseModel, createBaseSchema } from '../../../../core/engine';
import { config } from '../../../../core/config';
import { USER_ROLES } from '../../../../core/constants';

const USER_MODEL_NAME = 'User';

const UserSchema = createBaseSchema<IUserModel>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    entity: {
      type: Schema.Types.ObjectId,
      ref: 'Entity',
      required: true,
    },
    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
  },
  {
    modelName: USER_MODEL_NAME,
  },
);

UserSchema.pre('save', async function (next) {
  try {
    if (this.isNew || this.isModified('password')) {
      const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

const UserModel = new BaseModel<IUserModel>(
  USER_MODEL_NAME,
  UserSchema,
).getModel();

export default UserModel;
