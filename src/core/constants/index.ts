import helmet from 'helmet';

export const helmetCSPConfig = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://www.google-analytics.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://www.google-analytics.com',
      'https://image.flaticon.com',
      'https://images.unsplash.com',
    ],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
      'data:',
      'chrome-extension:',
    ],
  },
});

export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  DESIGNER: 'designer',
  USER: 'user',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
