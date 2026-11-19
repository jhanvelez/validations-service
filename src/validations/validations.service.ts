import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  ) {}

  async create(dto: CreateValidationDto): Promise<ValidationDocument> {
    return this.validationModel.create(dto);
  }

  async findById(id: Types.ObjectId): Promise<ValidationDocument> {
    const validation = await this.validationModel.findById(id).exec();

    if (!validation) {
      throw new NotFoundException(`Validation ${id.toString()} not found`);
    }

    return validation;
  }
}