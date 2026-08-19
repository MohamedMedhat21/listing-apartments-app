import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { STATUS_CODES } from 'http';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

interface TerminusHealthCheckResult {
  status: string;
  info: Record<string, unknown>;
  error: Record<string, unknown>;
  details: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** `@nestjs/terminus` throws `ServiceUnavailableException` with this body (7.11). */
function isTerminusHealthCheckResult(value: unknown): value is TerminusHealthCheckResult {
  return (
    isRecord(value) &&
    typeof value.status === 'string' &&
    isRecord(value.info) &&
    isRecord(value.error) &&
    isRecord(value.details)
  );
}

/**
 * Emits the exact error shape from docs/requirements.md section 7.1 for
 * every thrown exception, HTTP or otherwise. Nest's built-in exception
 * classes (`NotFoundException`, `ConflictException`, etc.) already produce
 * the right `statusCode`/`message`/`error` via `getResponse()`; this filter
 * only adds `timestamp` and `path`, and gives unexpected (non-HTTP) errors a
 * safe generic 500 body instead of leaking internals (BR-21: never a
 * passwordHash or other secret in an error message).
 *
 * Terminus health-check failures (7.11) are the one exception: they already
 * carry the `{ status, info, error, details }` body and must pass through
 * unchanged rather than being re-shaped into section 7.1.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();
      if (isTerminusHealthCheckResult(responseBody)) {
        response.status(statusCode).json(responseBody);
        return;
      }
    }

    const { statusCode, message, error } = this.resolveBody(exception);

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('Unhandled exception:', exception);
    }

    const body: ErrorResponseBody = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    };

    response.status(statusCode).json(body);
  }

  private resolveBody(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        return { statusCode, message: responseBody, error: this.reasonPhrase(statusCode) };
      }

      if (isRecord(responseBody)) {
        const message = responseBody.message;
        const error = responseBody.error;
        return {
          statusCode,
          message:
            isStringArray(message) || typeof message === 'string' ? message : exception.message,
          error: typeof error === 'string' ? error : this.reasonPhrase(statusCode),
        };
      }

      return { statusCode, message: exception.message, error: this.reasonPhrase(statusCode) };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: this.reasonPhrase(HttpStatus.INTERNAL_SERVER_ERROR),
    };
  }

  private reasonPhrase(statusCode: number): string {
    return STATUS_CODES[statusCode] ?? 'Error';
  }
}
