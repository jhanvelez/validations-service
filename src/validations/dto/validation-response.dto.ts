import type {
  ExchangeRate,
  ValidationDocument,
} from '../schemas/validation.schema.js';

export class CreateValidationResponseDto {
  id: string;
}

export class ValidationResponseDto {
  id: string;
  name: string;
  documentNumber: string;
  exchangeRate: ExchangeRate;
  createdAt: Date;
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