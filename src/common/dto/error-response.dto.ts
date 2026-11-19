import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { type: 'string' } },
    ],
    example: ['documentNumber must contain between 5 and 15 digits'],
  })
  message: string | string[];

  @ApiProperty({ example: '/validations' })
  path: string;

  @ApiProperty({ example: '2026-11-19T02:29:07.822Z' })
  timestamp: string;
}