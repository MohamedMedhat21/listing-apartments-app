import { ApartmentStatus } from '@apartments/shared';
import { DeepPartial } from 'typeorm';
import { Apartment } from '../entities/apartment.entity';
import { ApartmentDetailDto } from '../dto/apartment-detail.dto';
import { ApartmentListItemDto } from '../dto/apartment-list-item.dto';
import { CreateApartmentDto } from '../dto/create-apartment.dto';
import { UpdateApartmentDto } from '../dto/update-apartment.dto';

export function toApartmentListItemDto(apartment: Apartment): ApartmentListItemDto {
  const project = apartment.project;
  if (!project) {
    throw new Error('toApartmentListItemDto: apartment.project must be loaded by the repository');
  }

  return {
    id: apartment.id,
    unitName: apartment.unitName,
    unitNumber: apartment.unitNumber,
    price: apartment.price,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    areaSqm: apartment.areaSqm,
    status: apartment.status,
    coverImageUrl: apartment.imageUrls[0] ?? null,
    project: {
      id: project.id,
      name: project.name,
      city: project.city,
      district: project.district,
    },
  };
}

export function toApartmentDetailDto(apartment: Apartment): ApartmentDetailDto {
  const project = apartment.project;
  const developer = project?.developer;
  if (!project || !developer) {
    throw new Error(
      'toApartmentDetailDto: apartment.project.developer must be loaded by the repository',
    );
  }

  return {
    id: apartment.id,
    unitName: apartment.unitName,
    unitNumber: apartment.unitNumber,
    description: apartment.description,
    price: apartment.price,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    areaSqm: apartment.areaSqm,
    floor: apartment.floor,
    address: apartment.address,
    status: apartment.status,
    amenities: apartment.amenities,
    imageUrls: apartment.imageUrls,
    createdAt: apartment.createdAt.toISOString(),
    updatedAt: apartment.updatedAt.toISOString(),
    project: {
      id: project.id,
      name: project.name,
      city: project.city,
      district: project.district,
      developer: {
        id: developer.id,
        name: developer.name,
        logoUrl: developer.logoUrl,
      },
    },
  };
}

/** BR-16: `status` defaults to `AVAILABLE` when the client omits it. */
export function toApartmentCreateData(dto: CreateApartmentDto): DeepPartial<Apartment> {
  return {
    unitName: dto.unitName,
    unitNumber: dto.unitNumber,
    projectId: dto.projectId,
    description: dto.description ?? null,
    price: dto.price,
    bedrooms: dto.bedrooms,
    bathrooms: dto.bathrooms,
    areaSqm: dto.areaSqm,
    floor: dto.floor ?? null,
    address: dto.address ?? null,
    status: dto.status ?? ApartmentStatus.AVAILABLE,
    amenities: dto.amenities ?? [],
    imageUrls: dto.imageUrls ?? [],
  };
}

/**
 * Builds a partial update containing only the fields the client actually
 * sent. Under this project's `tsconfig` (`target: ES2022`, so
 * `useDefineForClassFields` defaults to true), every declared class field
 * becomes its own property set to `undefined` once `class-transformer`
 * constructs the DTO — even ones the client never sent — so `Object.keys()`
 * or spreading `dto` directly would both wrongly report "no changes" as
 * "every field is present" and, worse, write NULL over every column the
 * client left untouched. Checking each field explicitly against `undefined`
 * is what makes a partial update actually partial.
 */
export function toApartmentUpdateData(dto: UpdateApartmentDto): Partial<Apartment> {
  const data: Partial<Apartment> = {};
  if (dto.unitName !== undefined) data.unitName = dto.unitName;
  if (dto.unitNumber !== undefined) data.unitNumber = dto.unitNumber;
  if (dto.projectId !== undefined) data.projectId = dto.projectId;
  if (dto.description !== undefined) data.description = dto.description;
  if (dto.price !== undefined) data.price = dto.price;
  if (dto.bedrooms !== undefined) data.bedrooms = dto.bedrooms;
  if (dto.bathrooms !== undefined) data.bathrooms = dto.bathrooms;
  if (dto.areaSqm !== undefined) data.areaSqm = dto.areaSqm;
  if (dto.floor !== undefined) data.floor = dto.floor;
  if (dto.address !== undefined) data.address = dto.address;
  if (dto.status !== undefined) data.status = dto.status;
  if (dto.amenities !== undefined) data.amenities = dto.amenities;
  if (dto.imageUrls !== undefined) data.imageUrls = dto.imageUrls;
  return data;
}
