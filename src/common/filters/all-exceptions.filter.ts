import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface ErrorBody {
  message: string | string[];
  error: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const request: unknown = context.getRequest();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const { message, error } = this.toErrorBody(exception, statusCode);

    httpAdapter.reply(
      context.getResponse(),
      {
        statusCode,
        error,
        message,
        path: httpAdapter.getRequestUrl(request),
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }

  private toErrorBody(exception: unknown, statusCode: number): ErrorBody {
    if (!(exception instanceof HttpException)) {
      return {
        message: 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { message: response, error: exception.name };
    }

    const body = response as Partial<ErrorBody>;
    return {
      message: body.message ?? exception.message,
      error: body.error ?? HttpStatus[statusCode] ?? exception.name,
    };
  }
}