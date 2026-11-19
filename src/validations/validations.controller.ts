import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CreateValidationDto } from './dto/create-validation.dto.js';
import {
  CreateValidationResponseDto,
  ValidationResponseDto,
} from './dto/validation-response.dto.js';
import { ValidationsService } from './validations.service.js';

@Controller('validations')
export class ValidationsController {
  constructor(private readonly validationsService: ValidationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateValidationDto,
  ): Promise<CreateValidationResponseDto> {
    const validation = await this.validationsService.create(dto);
    return { id: validation.id };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ): Promise<ValidationResponseDto> {
    const validation = await this.validationsService.findById(id);
    return ValidationResponseDto.fromDocument(validation);
  }
}