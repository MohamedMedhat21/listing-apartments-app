import { ApartmentStatus } from '@apartments/shared';

export interface ApartmentDetailDeveloperDto {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface ApartmentDetailProjectDto {
  id: string;
  name: string;
  city: string;
  district: string;
  developer: ApartmentDetailDeveloperDto;
}

// docs/requirements.md section 7.3: "every apartment field plus a nested
// project including its developer". `projectId` is intentionally omitted in
// favour of the expanded `project` object (no redundant flat FK alongside
// the nested resource); `deletedAt` is an internal soft-delete column, not
// part of the public contract.
export interface ApartmentDetailDto {
  id: string;
  unitName: string;
  unitNumber: string;
  description: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  floor: number | null;
  address: string | null;
  status: ApartmentStatus;
  amenities: string[];
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  project: ApartmentDetailProjectDto;
}
