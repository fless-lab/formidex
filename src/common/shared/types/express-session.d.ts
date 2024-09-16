import 'express-session';
import { IUser } from '../../../apps';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    emailForLoginOtp?: string;
    emailForResetPassword?: string;
    oldInput?: Record<string, any>;
    user?: IUser;
    tokens?: {
      access: string;
      refresh: string;
    };
  }
}
