import { ApartmentSortOption, ApartmentStatus, type ApartmentListQuery } from '@apartments/shared';

export const LISTING_DEFAULT_LIMIT = 12;
export const LISTING_DEFAULT_SORT = ApartmentSortOption.CREATED_AT_DESC;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

function parseNonNegativeInt(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parsePrice(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseSort(value: string | undefined): ApartmentSortOption | undefined {
  if (!value) {
    return undefined;
  }

  return Object.values(ApartmentSortOption).includes(value as ApartmentSortOption)
    ? (value as ApartmentSortOption)
    : undefined;
}

function parseStatus(value: string | undefined): ApartmentStatus | undefined {
  if (!value) {
    return undefined;
  }

  return Object.values(ApartmentStatus).includes(value as ApartmentStatus)
    ? (value as ApartmentStatus)
    : undefined;
}

export function parseListingSearchParams(
  params: Record<string, string | string[] | undefined>,
): ApartmentListQuery {
  const query: ApartmentListQuery = {};

  const qRaw = firstParam(params.q);
  const q = qRaw?.trim();
  if (q) {
    query.q = q;
  }

  const projectId = firstParam(params.projectId);
  if (projectId) {
    query.projectId = projectId;
  }

  const minPrice = parsePrice(firstParam(params.minPrice));
  if (minPrice !== undefined) {
    query.minPrice = minPrice;
  }

  const maxPrice = parsePrice(firstParam(params.maxPrice));
  if (maxPrice !== undefined) {
    query.maxPrice = maxPrice;
  }

  const bedrooms = parseNonNegativeInt(firstParam(params.bedrooms));
  if (bedrooms !== undefined) {
    query.bedrooms = bedrooms;
  }

  const status = parseStatus(firstParam(params.status));
  if (status) {
    query.status = status;
  }

  const sort = parseSort(firstParam(params.sort));
  if (sort) {
    query.sort = sort;
  }

  const page = parsePositiveInt(firstParam(params.page));
  if (page) {
    query.page = page;
  }

  const limit = parsePositiveInt(firstParam(params.limit));
  if (limit !== undefined && limit <= 50) {
    query.limit = limit;
  }

  return query;
}

export function buildListingSearchParams(query: ApartmentListQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) {
    params.set('q', query.q);
  }
  if (query.projectId) {
    params.set('projectId', query.projectId);
  }
  if (query.minPrice !== undefined) {
    params.set('minPrice', String(query.minPrice));
  }
  if (query.maxPrice !== undefined) {
    params.set('maxPrice', String(query.maxPrice));
  }
  if (query.bedrooms !== undefined) {
    params.set('bedrooms', String(query.bedrooms));
  }
  if (query.status) {
    params.set('status', query.status);
  }
  if (query.sort && query.sort !== LISTING_DEFAULT_SORT) {
    params.set('sort', query.sort);
  }
  if (query.page && query.page > 1) {
    params.set('page', String(query.page));
  }
  if (query.limit && query.limit !== LISTING_DEFAULT_LIMIT) {
    params.set('limit', String(query.limit));
  }

  return params;
}

export function listingQueryToHref(pathname: string, query: ApartmentListQuery): string {
  const params = buildListingSearchParams(query);
  const serialized = params.toString();
  return serialized.length > 0 ? `${pathname}?${serialized}` : pathname;
}

export function hasActiveListingFilters(query: ApartmentListQuery): boolean {
  return (
    Boolean(query.q) ||
    Boolean(query.projectId) ||
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.bedrooms !== undefined ||
    Boolean(query.status) ||
    Boolean(query.sort && query.sort !== LISTING_DEFAULT_SORT)
  );
}

export function resolveListingQuery(
  query: ApartmentListQuery,
): Required<Pick<ApartmentListQuery, 'page' | 'limit' | 'sort'>> & ApartmentListQuery {
  return {
    ...query,
    page: query.page ?? 1,
    limit: query.limit ?? LISTING_DEFAULT_LIMIT,
    sort: query.sort ?? LISTING_DEFAULT_SORT,
  };
}
