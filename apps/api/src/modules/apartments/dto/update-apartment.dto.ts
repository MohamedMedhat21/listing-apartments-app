import { ApartmentStatus } from '@apartments/shared';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * `PATCH /api/v1/apartments/:id` body (docs/requirements.md section 7.5):
 * any subset of the `POST` fields, with the same per-field rules. "At least
 * one field must be present" is a cross-field rule, so it is checked in
 * `ApartmentsService.update`, not here — see the comment on
 * `toApartmentUpdateData` in `mappers/apartment.mapper.ts` for why none of
 * these fields may have a default initializer.
 */
export class UpdateApartmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  unitName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  unitNumber?: string;

  @IsOptional()
  @IsUUID('4')
  projectId?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  areaSqm?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsEnum(ApartmentStatus)
  status?: ApartmentStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { each: true })
  imageUrls?: string[];
}
