import type { ValidationDocument } from '../schemas/validation.schema.js';

export class CreateValidationResponseDto {
  id: string;
}

export class ValidationResponseDto {
  id: string;
  name: string;
  documentNumber: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDocument(document: ValidationDocument): ValidationResponseDto {
    return {
      id: document.id,
      name: document.name,
      documentNumber: document.documentNumber,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}