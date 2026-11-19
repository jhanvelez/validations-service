import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import {
  appConfig,
  dynamodbConfig,
  externalApiConfig,
  mongoConfig,
} from './config/configuration.js';
import { envValidationSchema } from './config/env.validation.js';
import { ValidationsModule } from './validations/validations.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, mongoConfig, dynamodbConfig, externalApiConfig],
      validationSchema: envValidationSchema,
    }),
    MongooseModule.forRootAsync({
      inject: [mongoConfig.KEY],
      useFactory: (config: ConfigType<typeof mongoConfig>) => ({
        uri: config.uri,
      }),
    }),
    ValidationsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}