import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

const normalizeSpaces = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

export class CreateValidationDto {
  @ApiProperty({
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 100,
    description: 'Full name, letters only. Extra spaces are normalized.',
  })
  @Transform(normalizeSpaces)
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^\p{L}[\p{L} '.-]*$/u, {
    message:
      'name must contain only letters, spaces, apostrophes, dots or hyphens',
  })
  name: string;

  @ApiProperty({
    example: '1020304050',
    pattern: '^\\d{5,15}$',
    description: 'Document number as a string to preserve leading zeros.',
  })
  @Transform(normalizeSpaces)
  @IsString()
  @Matches(/^\d{5,15}$/, {
    message: 'documentNumber must contain between 5 and 15 digits',
  })
  documentNumber: string;
}