import 'express-session';
import { IUser } from '../../../apps';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: IUser;
    tokens?: {
      access: string;
      refresh: string;
    };
  }
}
