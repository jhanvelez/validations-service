import {
  type ArgumentsHost,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  const reply = vi.fn();
  const response = {};
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({}),
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  const adapterHost = {
    httpAdapter: { reply, getRequestUrl: () => '/validations' },
  } as unknown as HttpAdapterHost;
  const filter = new AllExceptionsFilter(adapterHost);

  beforeEach(() => {
    reply.mockReset();
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('keeps validation messages for bad requests', () => {
    filter.catch(new BadRequestException(['name must be a string']), host);

    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: ['name must be a string'],
        path: '/validations',
      }),
      400,
    );
  });

  it('maps not found exceptions', () => {
    filter.catch(new NotFoundException('Validation x not found'), host);

    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
        message: 'Validation x not found',
      }),
      404,
    );
  });

  it('hides internal details of unexpected errors', () => {
    filter.catch(new Error('connection string leaked'), host);

    expect(reply).toHaveBeenCalledWith(
      response,
      expect.objectContaining({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Internal server error',
      }),
      500,
    );
  });
});