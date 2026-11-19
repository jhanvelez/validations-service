import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { isAxiosError } from 'axios';
import {
  type Observable,
  catchError,
  firstValueFrom,
  retry,
  throwError,
  timer,
} from 'rxjs';
import { externalApiConfig } from '../config/configuration.js';
import type {
  ExchangeRateApiResponse,
  ExchangeRateSnapshot,
} from './exchange-rate.types.js';

const PROVIDER = 'exchangerate-api.com';
const RETRY_BASE_DELAY_MS = 200;
const TIMEOUT_ERROR_CODES = new Set(['ECONNABORTED', 'ETIMEDOUT']);

@Injectable()
export class ExchangeRateClient {
  private readonly logger = new Logger(ExchangeRateClient.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(externalApiConfig.KEY)
    private readonly config: ConfigType<typeof externalApiConfig>,
  ) {}

  async getLatestRate(): Promise<ExchangeRateSnapshot> {
    const { baseCurrency, targetCurrency } = this.config;

    const { data } = await firstValueFrom(
      this.httpService
        .get<ExchangeRateApiResponse>(`/latest/${baseCurrency}`)
        .pipe(
          retry({
            count: this.config.retries,
            delay: (error: unknown, attempt) =>
              this.scheduleRetry(error, attempt),
          }),
          catchError((error: unknown) =>
            throwError(() => this.toHttpException(error)),
          ),
        ),
    );

    const rate = data.rates?.[targetCurrency];

    if (data.result !== 'success' || typeof rate !== 'number' || rate <= 0) {
      this.logger.error(
        `Invalid exchange rate payload for ${baseCurrency}/${targetCurrency}: ${data['error-type'] ?? 'missing rate'}`,
      );
      throw new BadGatewayException(
        'Exchange rate provider returned an invalid response',
      );
    }

    return {
      provider: PROVIDER,
      baseCurrency,
      targetCurrency,
      rate,
      rateUpdatedAt: new Date((data.time_last_update_unix ?? 0) * 1000),
      fetchedAt: new Date(),
    };
  }

  private scheduleRetry(error: unknown, attempt: number): Observable<number> {
    if (!this.isTransient(error)) {
      return throwError(() => error);
    }

    this.logger.warn(
      `Exchange rate request failed (${this.describe(error)}), retry ${attempt}/${this.config.retries}`,
    );
    return timer(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
  }

  private isTransient(error: unknown): boolean {
    if (!isAxiosError(error)) {
      return false;
    }

    return !error.response || error.response.status >= 500;
  }

  private toHttpException(error: unknown): HttpException {
    if (isAxiosError(error) && TIMEOUT_ERROR_CODES.has(error.code ?? '')) {
      this.logger.error(`Exchange rate provider timed out: ${error.message}`);
      return new GatewayTimeoutException(
        'Exchange rate provider did not respond in time',
      );
    }

    this.logger.error(`Exchange rate provider failed: ${this.describe(error)}`);
    return new BadGatewayException('Exchange rate provider is unavailable');
  }

  private describe(error: unknown): string {
    if (isAxiosError(error)) {
      return error.response
        ? `HTTP ${error.response.status}`
        : (error.code ?? error.message);
    }

    return error instanceof Error ? error.message : String(error);
  }
}