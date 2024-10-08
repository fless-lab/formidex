/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import initializeViewEngine from '../view-engine';
import { initializeSessionAndFlash } from '../session-flash';
import {
  apiRateLimiter,
  clientAuthentication,
  GlobalErrorHandler,
  injectOldInputMiddleware,
  NotFoundHandler,
  oldInputMiddleware,
} from '../../../common/shared';
import { default as AllRoutes } from '../../../common/global-router';
import { config } from '../../config';
import { helmetCSPConfig } from '../../constants';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';

const app = express();
const morganEnv = config.runningProd ? 'combined' : 'dev';

// Express configuration
app.use(cors());
app.use(helmet()); // Use Helmet to add various security headers
app.use(helmetCSPConfig);
app.use(helmet.frameguard({ action: 'deny' })); // Prevent the app from being displayed in an iframe
app.use(helmet.xssFilter()); // Protect against XSS attacks
app.use(helmet.noSniff()); // Prevent MIME type sniffing
app.use(helmet.ieNoOpen()); // Prevent IE from executing downloads
app.use(morgan(morganEnv));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by'); // Disable X-Powered-By header

// Specifying public path for static files
app.use(express.static(path.join(__dirname, config.publicPathFromExpress)));

// Use express-ejs-layouts
app.use(expressLayouts);

// Initialize Session and Flash
initializeSessionAndFlash(app);

// Set view engine
initializeViewEngine(app);

// Client authentication middleware
// app.use(clientAuthentication);

// Register oldInputMiddleware globally; it will handle methods internally
app.use(oldInputMiddleware);

// Register injectOldInputMiddleware for all requests
app.use(injectOldInputMiddleware);

// Rate limiter middleware
app.use(apiRateLimiter);

// API Routes
app.use('/', AllRoutes);

// Error handlers
app.use(NotFoundHandler);
app.use(GlobalErrorHandler);

export default app;
