import { ApartmentSortOption } from '../enums/apartment-sort-option.enum';
import { ApartmentStatus } from '../enums/apartment-status.enum';
import { UserRole } from '../enums/user-role.enum';

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CollectionResponse<T> {
  data: T[];
}

export interface ApartmentListQuery {
  q?: string;
  projectId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: ApartmentStatus;
  sort?: ApartmentSortOption;
  page?: number;
  limit?: number;
}

export interface ApartmentListItemProject {
  id: string;
  name: string;
  city: string;
  district: string;
}

export interface ApartmentListItem {
  id: string;
  unitName: string;
  unitNumber: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  status: ApartmentStatus;
  coverImageUrl: string | null;
  project: ApartmentListItemProject;
}

export interface ApartmentDetailDeveloper {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface ApartmentDetailProject {
  id: string;
  name: string;
  city: string;
  district: string;
  developer: ApartmentDetailDeveloper;
}

export interface ApartmentDetail {
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
  createdAt: string;
  updatedAt: string;
  project: ApartmentDetailProject;
}

export interface ProjectSummaryDeveloper {
  id: string;
  name: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  city: string;
  district: string;
  developer: ProjectSummaryDeveloper;
  apartmentCount: number;
}

export interface DeveloperSummary {
  id: string;
  name: string;
  logoUrl: string | null;
  projectCount: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserSummary {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: UserSummary;
}

export interface CreateApartmentRequest {
  unitName: string;
  unitNumber: string;
  projectId: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  description?: string;
  floor?: number;
  address?: string;
  status?: ApartmentStatus;
  amenities?: string[];
  imageUrls?: string[];
}

export type UpdateApartmentRequest = Partial<CreateApartmentRequest>;
