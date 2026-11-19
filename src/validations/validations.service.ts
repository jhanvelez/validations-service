import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditService } from '../audit/audit.service.js';
import { ExchangeRateClient } from '../exchange-rate/exchange-rate.client.js';
import { CreateValidationDto } from './dto/create-validation.dto.js';
import {
  Validation,
  type ValidationDocument,
} from './schemas/validation.schema.js';

@Injectable()
export class ValidationsService {
  private readonly logger = new Logger(ValidationsService.name);

  constructor(
    @InjectModel(Validation.name)
    private readonly validationModel: Model<Validation>,
    private readonly exchangeRateClient: ExchangeRateClient,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateValidationDto): Promise<ValidationDocument> {
    const exchangeRate = await this.exchangeRateClient.getLatestRate();
    const validation = await this.validationModel.create({
      name: dto.name,
      documentNumber: dto.documentNumber,
      exchangeRate,
    });

    await this.recordAuditOrRollback(validation);

    return validation;
  }

  async findById(id: Types.ObjectId): Promise<ValidationDocument> {
    const validation = await this.validationModel.findById(id).exec();

    if (!validation) {
      throw new NotFoundException(`Validation ${id.toString()} not found`);
    }

    return validation;
  }

  private async recordAuditOrRollback(
    validation: ValidationDocument,
  ): Promise<void> {
    try {
      await this.auditService.recordValidationCreated({
        validationId: validation.id,
        documentNumber: validation.documentNumber,
        occurredAt: validation.createdAt,
      });
    } catch (error) {
      this.logger.error(
        `Audit event failed for validation ${validation.id}, rolling back`,
        error instanceof Error ? error.stack : String(error),
      );
      await this.rollback(validation);
      throw new ServiceUnavailableException(
        'Audit log is unavailable, the validation was not created',
      );
    }
  }

  private async rollback(validation: ValidationDocument): Promise<void> {
    try {
      await this.validationModel.deleteOne({ _id: validation._id }).exec();
    } catch (error) {
      this.logger.error(
        `Rollback failed, validation ${validation.id} has no audit event`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}