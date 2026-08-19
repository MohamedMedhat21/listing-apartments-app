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
 * `POST /api/v1/apartments` body (docs/requirements.md section 7.4). Unlike
 * `QueryApartmentsDto`, this carries a JSON body rather than query strings,
 * so numbers and enums already arrive as their real JS types — no
 * `@Transform` coercion is needed here.
 */
export class CreateApartmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  unitName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  unitNumber!: string;

  @IsUUID('4')
  projectId!: string;

  // BR-15: price > 0, EGP only, numeric(14,2) in the database.
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  // BR-15: bedrooms/bathrooms >= 0.
  @IsInt()
  @Min(0)
  bedrooms!: number;

  @IsInt()
  @Min(0)
  bathrooms!: number;

  // BR-15: areaSqm > 0.
  @IsNumber()
  @IsPositive()
  areaSqm!: number;

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

  // BR-16: defaults to AVAILABLE when omitted (applied in the service/mapper).
  @IsOptional()
  @IsEnum(ApartmentStatus)
  status?: ApartmentStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  amenities?: string[];

  // BR-17: every entry must be a valid http/https URL.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { each: true })
  imageUrls?: string[];
}
