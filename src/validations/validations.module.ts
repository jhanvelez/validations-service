import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module.js';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module.js';
import { Validation, ValidationSchema } from './schemas/validation.schema.js';
import { ValidationsController } from './validations.controller.js';
import { ValidationsService } from './validations.service.js';

@Module({
  imports: [
    AuditModule,
    ExchangeRateModule,
    MongooseModule.forFeature([
      { name: Validation.name, schema: ValidationSchema },
    ]),
  ],
  controllers: [ValidationsController],
  providers: [ValidationsService],
})
export class ValidationsModule {}