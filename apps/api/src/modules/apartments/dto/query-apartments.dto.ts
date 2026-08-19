import { ApartmentSortOption, ApartmentStatus } from '@apartments/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimmedStringOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

// Query params always arrive as strings. Returns the parsed number, or the
// original value unchanged (so @IsNumber/@IsInt fail with a clear message)
// when it doesn't parse, and undefined for a genuinely absent value.
function toNumberOrOriginal(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}

/**
 * `GET /api/v1/apartments` query params (docs/requirements.md section 7.2).
 * `whitelist: true` + `forbidNonWhitelisted: true` on the global
 * `ValidationPipe` means any key not declared here is a 400 (BR-23).
 *
 * BR-14 (`minPrice` must not exceed `maxPrice`) is a business rule, not a
 * shape check, so it is enforced in `ApartmentsService`, not here.
 */
export class QueryApartmentsDto {
  @ApiPropertyOptional({ description: 'Free-text search (BR-8)', minLength: 1, maxLength: 100 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimmedStringOrUndefined(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  projectId?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toNumberOrOriginal(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toNumberOrOriginal(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toNumberOrOriginal(value))
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ enum: ApartmentStatus })
  @IsOptional()
  @IsEnum(ApartmentStatus)
  status?: ApartmentStatus;

  @ApiPropertyOptional({ enum: ApartmentSortOption, default: ApartmentSortOption.CREATED_AT_DESC })
  @Transform(({ value }: { value: unknown }) => value ?? ApartmentSortOption.CREATED_AT_DESC)
  @IsEnum(ApartmentSortOption)
  sort: ApartmentSortOption = ApartmentSortOption.CREATED_AT_DESC;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? 1 : toNumberOrOriginal(value),
  )
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 12 })
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? 12 : toNumberOrOriginal(value),
  )
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 12;
}
