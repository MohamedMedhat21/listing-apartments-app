import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Params } from 'nestjs-pino';
import { AppConfigService } from './app-config.service';

/** Structured JSON logging via nestjs-pino (docs/requirements.md section 9). */
export function buildLoggerParams(configService: AppConfigService): Params {
  return {
    pinoHttp: {
      level: configService.isProduction ? 'info' : 'debug',
      genReqId: (req: IncomingMessage, res: ServerResponse): string => {
        const incoming = req.headers['x-correlation-id'];
        const correlationId =
          typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();
        res.setHeader('x-correlation-id', correlationId);
        return correlationId;
      },
      redact: {
        paths: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.passwordHash',
          'res.body.passwordHash',
          'res.body.accessToken',
          '*.password',
          '*.passwordHash',
          '*.accessToken',
        ],
        censor: '[Redacted]',
      },
    },
  };
}
