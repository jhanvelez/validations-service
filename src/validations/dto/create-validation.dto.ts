import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

const normalizeSpaces = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

export class CreateValidationDto {
  @Transform(normalizeSpaces)
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^\p{L}[\p{L} '.-]*$/u, {
    message:
      'name must contain only letters, spaces, apostrophes, dots or hyphens',
  })
  name: string;

  @Transform(normalizeSpaces)
  @IsString()
  @Matches(/^\d{5,15}$/, {
    message: 'documentNumber must contain between 5 and 15 digits',
  })
  documentNumber: string;
}