import { ApiProperty } from '@nestjs/swagger';

/** Exact error shape from docs/requirements.md section 7.1. */
export class ErrorResponseSchema {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'minPrice must not be greater than maxPrice',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: '2026-08-18T20:15:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/api/v1/apartments' })
  path!: string;
}
