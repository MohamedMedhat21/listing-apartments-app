import { describe, expect, it } from 'vitest';

import { ApartmentSortOption, ApartmentStatus } from '@apartments/shared';

import {
  buildListingSearchParams,
  hasActiveListingFilters,
  parseListingSearchParams,
} from './search-params';

describe('listing search params', () => {
  it('ignores whitespace-only q values (BR-10)', () => {
    expect(parseListingSearchParams({ q: '   ' })).toEqual({});
  });

  it('parses listing filters from URL params', () => {
    expect(
      parseListingSearchParams({
        q: 'palm',
        projectId: 'project-1',
        minPrice: '1000000',
        maxPrice: '5000000',
        bedrooms: '2',
        status: ApartmentStatus.AVAILABLE,
        sort: ApartmentSortOption.PRICE_ASC,
        page: '2',
        limit: '24',
      }),
    ).toEqual({
      q: 'palm',
      projectId: 'project-1',
      minPrice: 1_000_000,
      maxPrice: 5_000_000,
      bedrooms: 2,
      status: ApartmentStatus.AVAILABLE,
      sort: ApartmentSortOption.PRICE_ASC,
      page: 2,
      limit: 24,
    });
  });

  it('omits default sort, page, and limit from the URL', () => {
    const params = buildListingSearchParams({
      q: 'madinaty',
      page: 1,
      limit: 12,
      sort: ApartmentSortOption.CREATED_AT_DESC,
    });

    expect(params.toString()).toBe('q=madinaty');
  });

  it('detects active filters excluding pagination defaults', () => {
    expect(hasActiveListingFilters({ page: 2 })).toBe(false);
    expect(hasActiveListingFilters({ q: 'zayed' })).toBe(true);
  });
});
