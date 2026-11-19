import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Validation, ValidationSchema } from './schemas/validation.schema.js';
import { ValidationsController } from './validations.controller.js';
import { ValidationsService } from './validations.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Validation.name, schema: ValidationSchema },
    ]),
  ],
  controllers: [ValidationsController],
  providers: [ValidationsService],
})
export class ValidationsModule {}