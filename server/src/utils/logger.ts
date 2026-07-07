import pino from 'pino';
import { config } from '../config/index.js';

const sensitivePaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.apiKey',
  'req.body.accessToken',
  'req.body.refreshToken',
  'res.headers["set-cookie"]',
];

export const logger = pino({
  name: 'kriya',
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: sensitivePaths,
    censor: '[REDACTED]',
  },
  ...(config.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});
