import { ApartmentStatus, type CreateApartmentRequest } from '@apartments/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
export class CreateApartmentDto implements CreateApartmentRequest {
  @ApiProperty({ minLength: 1, maxLength: 150, example: 'Skyline A1' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  unitName!: string;

  @ApiProperty({ minLength: 1, maxLength: 50, example: 'A-101' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  unitNumber!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  projectId!: string;

  @ApiProperty({ description: 'Price in EGP (BR-15)', example: 2500000, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ minimum: 0, example: 3 })
  @IsInt()
  @Min(0)
  bedrooms!: number;

  @ApiProperty({ minimum: 0, example: 2 })
  @IsInt()
  @Min(0)
  bathrooms!: number;

  @ApiProperty({ minimum: 0.01, example: 180 })
  @IsNumber()
  @IsPositive()
  areaSqm!: number;

  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  floor?: number;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ enum: ApartmentStatus, default: ApartmentStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(ApartmentStatus)
  status?: ApartmentStatus;

  @ApiPropertyOptional({ type: [String], maxItems: 30 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({
    type: [String],
    maxItems: 12,
    description: 'Each entry must be a valid http/https URL (BR-17)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { each: true })
  imageUrls?: string[];
}
