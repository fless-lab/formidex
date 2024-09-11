import { Application } from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import RedisStore from 'connect-redis';
import { config } from '../../config';
import { DB } from '../../../core/framework';

const redis = DB.redis;
redis.init();
const client = redis.getClient();

export const initializeSessionAndFlash = (app: Application): void => {
  app.use(
    session({
      store: new RedisStore({ client }),
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.runningProd,
        maxAge: config.session.maxAge,
        sameSite: config.session.sameSite,
        httpOnly: config.session.httpOnly,
      },
    }),
  );
  app.use(flash());
};
