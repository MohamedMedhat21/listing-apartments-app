import { ApartmentStatus, UserRole } from '@apartments/shared';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponseSchema } from './error-response.schema';

export class UserSummarySchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin@nawy.local' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role!: UserRole;
}

export class LoginResponseSchema {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ description: 'Access token lifetime in seconds (BR-20)', example: 3600 })
  expiresIn!: number;

  @ApiProperty({ type: UserSummarySchema })
  user!: UserSummarySchema;
}

export class PaginationMetaSchema {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 12 })
  limit!: number;

  @ApiProperty({ example: 40 })
  total!: number;

  @ApiProperty({ example: 4 })
  totalPages!: number;
}

export class ApartmentListItemProjectSchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  district!: string;
}

export class ApartmentListItemSchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  unitName!: string;

  @ApiProperty()
  unitNumber!: string;

  @ApiProperty({ example: 2500000 })
  price!: number;

  @ApiProperty()
  bedrooms!: number;

  @ApiProperty()
  bathrooms!: number;

  @ApiProperty()
  areaSqm!: number;

  @ApiProperty({ enum: ApartmentStatus })
  status!: ApartmentStatus;

  @ApiProperty({ nullable: true, example: 'https://example.com/cover.jpg' })
  coverImageUrl!: string | null;

  @ApiProperty({ type: ApartmentListItemProjectSchema })
  project!: ApartmentListItemProjectSchema;
}

export class PaginatedApartmentListResponseSchema {
  @ApiProperty({ type: [ApartmentListItemSchema] })
  data!: ApartmentListItemSchema[];

  @ApiProperty({ type: PaginationMetaSchema })
  meta!: PaginationMetaSchema;
}

export class ApartmentDetailDeveloperSchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  logoUrl!: string | null;
}

export class ApartmentDetailProjectSchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  district!: string;

  @ApiProperty({ type: ApartmentDetailDeveloperSchema })
  developer!: ApartmentDetailDeveloperSchema;
}

export class ApartmentDetailSchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  unitName!: string;

  @ApiProperty()
  unitNumber!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ example: 2500000 })
  price!: number;

  @ApiProperty()
  bedrooms!: number;

  @ApiProperty()
  bathrooms!: number;

  @ApiProperty()
  areaSqm!: number;

  @ApiProperty({ nullable: true })
  floor!: number | null;

  @ApiProperty({ nullable: true })
  address!: string | null;

  @ApiProperty({ enum: ApartmentStatus })
  status!: ApartmentStatus;

  @ApiProperty({ type: [String] })
  amenities!: string[];

  @ApiProperty({ type: [String] })
  imageUrls!: string[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: ApartmentDetailProjectSchema })
  project!: ApartmentDetailProjectSchema;
}

export class ProjectSummaryDeveloperSchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;
}

export class ProjectSummarySchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  district!: string;

  @ApiProperty({ type: ProjectSummaryDeveloperSchema })
  developer!: ProjectSummaryDeveloperSchema;

  @ApiProperty()
  apartmentCount!: number;
}

export class ProjectCollectionResponseSchema {
  @ApiProperty({ type: [ProjectSummarySchema] })
  data!: ProjectSummarySchema[];
}

export class DeveloperSummarySchema {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  logoUrl!: string | null;

  @ApiProperty()
  projectCount!: number;
}

export class DeveloperCollectionResponseSchema {
  @ApiProperty({ type: [DeveloperSummarySchema] })
  data!: DeveloperSummarySchema[];
}

export class HealthCheckDetailsSchema {
  @ApiProperty({ example: 'up' })
  status!: string;
}

export class HealthCheckResponseSchema {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'object' },
    example: { database: { status: 'up' } },
  })
  info!: Record<string, HealthCheckDetailsSchema>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'object' },
    example: {},
  })
  error!: Record<string, HealthCheckDetailsSchema>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'object' },
    example: { database: { status: 'up' } },
  })
  details!: Record<string, HealthCheckDetailsSchema>;
}

/** Registers every concrete response schema class with Swagger's document builder. */
export const SWAGGER_EXTRA_MODELS = [
  UserSummarySchema,
  LoginResponseSchema,
  PaginationMetaSchema,
  ApartmentListItemSchema,
  PaginatedApartmentListResponseSchema,
  ApartmentDetailSchema,
  ProjectSummarySchema,
  ProjectCollectionResponseSchema,
  DeveloperSummarySchema,
  DeveloperCollectionResponseSchema,
  HealthCheckResponseSchema,
  ErrorResponseSchema,
] as const;
