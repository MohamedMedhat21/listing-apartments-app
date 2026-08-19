import { Apartment } from '../entities/apartment.entity';
import { ApartmentDetailDto } from '../dto/apartment-detail.dto';
import { ApartmentListItemDto } from '../dto/apartment-list-item.dto';

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
    createdAt: apartment.createdAt,
    updatedAt: apartment.updatedAt,
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
