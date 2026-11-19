import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateValidationDto } from './create-validation.dto.js';

const validateDto = async (payload: Record<string, unknown>) => {
  const dto = plainToInstance(CreateValidationDto, payload);
  const errors = await validate(dto);
  return { dto, properties: errors.map((error) => error.property) };
};

describe('CreateValidationDto', () => {
  it('accepts a valid payload and normalizes whitespace', async () => {
    const { dto, properties } = await validateDto({
      name: '  María   José Pérez ',
      documentNumber: ' 1020304050 ',
    });

    expect(properties).toEqual([]);
    expect(dto.name).toBe('María José Pérez');
    expect(dto.documentNumber).toBe('1020304050');
  });

  it.each([
    ['empty name', { name: '', documentNumber: '1020304050' }, 'name'],
    [
      'name with digits',
      { name: 'Juan 23', documentNumber: '1020304050' },
      'name',
    ],
    [
      'document with letters',
      { name: 'Juan', documentNumber: '10AB30' },
      'documentNumber',
    ],
    [
      'document too short',
      { name: 'Juan', documentNumber: '1234' },
      'documentNumber',
    ],
    [
      'document as number',
      { name: 'Juan', documentNumber: 1020304050 },
      'documentNumber',
    ],
  ])('rejects %s', async (_case, payload, property) => {
    const { properties } = await validateDto(payload);

    expect(properties).toContain(property);
  });
});