import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExchangeRateClient } from '../exchange-rate/exchange-rate.client.js';
import { CreateValidationDto } from './dto/create-validation.dto.js';
import {
  Validation,
  type ValidationDocument,
} from './schemas/validation.schema.js';

@Injectable()
export class ValidationsService {
  constructor(
    @InjectModel(Validation.name)
    private readonly validationModel: Model<Validation>,
    private readonly exchangeRateClient: ExchangeRateClient,
  ) {}

  async create(dto: CreateValidationDto): Promise<ValidationDocument> {
    const exchangeRate = await this.exchangeRateClient.getLatestRate();
    return this.validationModel.create({
      name: dto.name,
      documentNumber: dto.documentNumber,
      exchangeRate,
    });
  }

  async findById(id: Types.ObjectId): Promise<ValidationDocument> {
    const validation = await this.validationModel.findById(id).exec();

    if (!validation) {
      throw new NotFoundException(`Validation ${id.toString()} not found`);
    }

    return validation;
  }
}