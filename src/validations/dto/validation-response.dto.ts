import { ApiProperty } from '@nestjs/swagger';
import type { ValidationDocument } from '../schemas/validation.schema.js';

export class CreateValidationResponseDto {
  @ApiProperty({ example: '6afe5ef34add1ee527b4ce7b' })
  id: string;
}

export class ExchangeRateDto {
  @ApiProperty({ example: 'exchangerate-api.com' })
  provider: string;

  @ApiProperty({ example: 'USD' })
  baseCurrency: string;

  @ApiProperty({ example: 'COP' })
  targetCurrency: string;

  @ApiProperty({ example: 3308.13231 })
  rate: number;

  @ApiProperty({ example: '2026-11-19T00:02:31.000Z' })
  rateUpdatedAt: Date;

  @ApiProperty({ example: '2026-11-19T02:29:07.812Z' })
  fetchedAt: Date;
}

export class ValidationResponseDto {
  @ApiProperty({ example: '6afe5ef34add1ee527b4ce7b' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ example: '1020304050' })
  documentNumber: string;

  @ApiProperty({ type: ExchangeRateDto })
  exchangeRate: ExchangeRateDto;

  @ApiProperty({ example: '2026-11-19T02:29:07.822Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-19T02:29:07.822Z' })
  updatedAt: Date;

  static fromDocument(document: ValidationDocument): ValidationResponseDto {
    const {
      provider,
      baseCurrency,
      targetCurrency,
      rate,
      rateUpdatedAt,
      fetchedAt,
    } = document.exchangeRate;

    return {
      id: document.id,
      name: document.name,
      documentNumber: document.documentNumber,
      exchangeRate: {
        provider,
        baseCurrency,
        targetCurrency,
        rate,
        rateUpdatedAt,
        fetchedAt,
      },
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}