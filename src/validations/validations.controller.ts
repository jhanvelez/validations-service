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
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiGatewayTimeoutResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { CreateValidationDto } from './dto/create-validation.dto.js';
import {
  CreateValidationResponseDto,
  ValidationResponseDto,
} from './dto/validation-response.dto.js';
import { ValidationsService } from './validations.service.js';

@ApiTags('validations')
@Controller('validations')
export class ValidationsController {
  constructor(private readonly validationsService: ValidationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a validation enriched with the USD/COP exchange rate',
  })
  @ApiCreatedResponse({ type: CreateValidationResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiBadGatewayResponse({
    type: ErrorResponseDto,
    description: 'Exchange rate provider failed',
  })
  @ApiGatewayTimeoutResponse({
    type: ErrorResponseDto,
    description: 'Exchange rate provider timed out',
  })
  @ApiServiceUnavailableResponse({
    type: ErrorResponseDto,
    description: 'Audit log unavailable, nothing was persisted',
  })
  async create(
    @Body() dto: CreateValidationDto,
  ): Promise<CreateValidationResponseDto> {
    const validation = await this.validationsService.create(dto);
    return { id: validation.id };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stored validation by id' })
  @ApiParam({
    name: 'id',
    type: String,
    example: '6afe5ef34add1ee527b4ce7b',
  })
  @ApiOkResponse({ type: ValidationResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Malformed id',
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ): Promise<ValidationResponseDto> {
    const validation = await this.validationsService.findById(id);
    return ValidationResponseDto.fromDocument(validation);
  }
}