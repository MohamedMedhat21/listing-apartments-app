import { ApartmentSortOption } from '@apartments/shared';

export const SORT_OPTION_LABELS: Record<ApartmentSortOption, string> = {
  [ApartmentSortOption.CREATED_AT_DESC]: 'Newest first',
  [ApartmentSortOption.CREATED_AT_ASC]: 'Oldest first',
  [ApartmentSortOption.PRICE_ASC]: 'Price: low to high',
  [ApartmentSortOption.PRICE_DESC]: 'Price: high to low',
  [ApartmentSortOption.AREA_SQM_ASC]: 'Area: small to large',
  [ApartmentSortOption.AREA_SQM_DESC]: 'Area: large to small',
};

export const SORT_OPTIONS = Object.values(ApartmentSortOption);
