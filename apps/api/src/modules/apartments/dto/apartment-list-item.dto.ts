import { ApartmentStatus } from '@apartments/shared';

export interface ApartmentListItemProjectDto {
  id: string;
  name: string;
  city: string;
  district: string;
}

// docs/requirements.md section 7.2: the exact field list for a list item.
export interface ApartmentListItemDto {
  id: string;
  unitName: string;
  unitNumber: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  status: ApartmentStatus;
  coverImageUrl: string | null;
  project: ApartmentListItemProjectDto;
}
