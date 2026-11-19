import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ConfigType } from '@nestjs/config';
import type { Params } from 'nestjs-pino';
import { appConfig } from '../../config/configuration.js';

const REQUEST_ID_HEADER = 'x-request-id';

export const buildLoggerParams = (
  config: ConfigType<typeof appConfig>,
): Params => ({
  pinoHttp: {
    level: config.logLevel,
    transport:
      config.env === 'development'
        ? { target: 'pino-pretty', options: { singleLine: true } }
        : undefined,
    genReqId: (request: IncomingMessage, response: ServerResponse) => {
      const header = request.headers[REQUEST_ID_HEADER];
      const requestId =
        typeof header === 'string' && header.length > 0 ? header : randomUUID();
      response.setHeader(REQUEST_ID_HEADER, requestId);
      return requestId;
    },
    autoLogging: {
      ignore: (request: IncomingMessage) =>
        request.url?.startsWith('/health') ?? false,
    },
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  },
});