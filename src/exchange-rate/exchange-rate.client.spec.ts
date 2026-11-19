import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  GatewayTimeoutException,
  Logger,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AxiosError, type AxiosResponse } from 'axios';
import { defer, of, throwError } from 'rxjs';
import { externalApiConfig } from '../config/configuration.js';
import { ExchangeRateClient } from './exchange-rate.client.js';
import type { ExchangeRateApiResponse } from './exchange-rate.types.js';

const config = {
  baseUrl: 'https://open.er-api.com/v6',
  timeoutMs: 3000,
  retries: 2,
  baseCurrency: 'USD',
  targetCurrency: 'COP',
};

const successPayload: ExchangeRateApiResponse = {
  result: 'success',
  base_code: 'USD',
  time_last_update_unix: 1_795_000_000,
  rates: { USD: 1, COP: 3320.18 },
};

const httpResponse = (data: ExchangeRateApiResponse) =>
  ({ data, status: 200 }) as AxiosResponse<ExchangeRateApiResponse>;

const httpError = (status: number) =>
  new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
  } as AxiosResponse);

describe('ExchangeRateClient', () => {
  let client: ExchangeRateClient;
  let attempts: number;
  const httpService = { get: vi.fn() };

  const failWith = (error: Error) => {
    httpService.get.mockReturnValue(
      defer(() => {
        attempts += 1;
        return throwError(() => error);
      }),
    );
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    attempts = 0;
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExchangeRateClient,
        { provide: HttpService, useValue: httpService },
        { provide: externalApiConfig.KEY, useValue: config },
      ],
    }).compile();

    client = moduleRef.get(ExchangeRateClient);
  });

  it('returns a snapshot of the configured currency pair', async () => {
    httpService.get.mockReturnValue(of(httpResponse(successPayload)));

    const snapshot = await client.getLatestRate();

    expect(httpService.get).toHaveBeenCalledWith('/latest/USD');
    expect(snapshot).toMatchObject({
      provider: 'exchangerate-api.com',
      baseCurrency: 'USD',
      targetCurrency: 'COP',
      rate: 3320.18,
      rateUpdatedAt: new Date(1_795_000_000 * 1000),
    });
    expect(snapshot.fetchedAt).toBeInstanceOf(Date);
  });

  it('retries server errors and fails with 502 when they persist', async () => {
    failWith(httpError(503));

    await expect(client.getLatestRate()).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(attempts).toBe(config.retries + 1);
  });

  it('does not retry client errors', async () => {
    failWith(httpError(429));

    await expect(client.getLatestRate()).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(attempts).toBe(1);
  });

  it('fails with 504 when the provider times out', async () => {
    failWith(new AxiosError('timeout of 3000ms exceeded', 'ECONNABORTED'));

    await expect(client.getLatestRate()).rejects.toBeInstanceOf(
      GatewayTimeoutException,
    );
    expect(attempts).toBe(config.retries + 1);
  });

  it('recovers when a retry succeeds', async () => {
    httpService.get.mockReturnValue(
      defer(() => {
        attempts += 1;
        return attempts === 1
          ? throwError(() => httpError(500))
          : of(httpResponse(successPayload));
      }),
    );

    await expect(client.getLatestRate()).resolves.toMatchObject({
      rate: 3320.18,
    });
    expect(attempts).toBe(2);
  });

  it.each([
    ['an error result', { result: 'error', 'error-type': 'unsupported-code' }],
    ['a missing target rate', { ...successPayload, rates: { USD: 1 } }],
    ['a non positive rate', { ...successPayload, rates: { COP: 0 } }],
  ] as const)('fails with 502 on %s', async (_case, payload) => {
    httpService.get.mockReturnValue(
      of(httpResponse(payload as ExchangeRateApiResponse)),
    );

    await expect(client.getLatestRate()).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});