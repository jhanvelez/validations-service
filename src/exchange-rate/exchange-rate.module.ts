import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { externalApiConfig } from '../config/configuration.js';
import { ExchangeRateClient } from './exchange-rate.client.js';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [externalApiConfig.KEY],
      useFactory: (config: ConfigType<typeof externalApiConfig>) => ({
        baseURL: config.baseUrl,
        timeout: config.timeoutMs,
      }),
    }),
  ],
  providers: [ExchangeRateClient],
  exports: [ExchangeRateClient],
})
export class ExchangeRateModule {}