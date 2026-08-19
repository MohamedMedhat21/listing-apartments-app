'use client';

import type { ApartmentListQuery } from '@apartments/shared';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import {
  buildListingSearchParams,
  listingQueryToHref,
  parseListingSearchParams,
} from './search-params';

export function useListingQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return parseListingSearchParams(params);
  }, [searchParams]);

  const updateQuery = useCallback(
    (patch: Partial<ApartmentListQuery>, options?: { resetPage?: boolean }) => {
      const resetPage = options?.resetPage ?? !('page' in patch);
      const next: ApartmentListQuery = { ...query, ...patch };

      if (resetPage) {
        delete next.page;
      }

      router.push(listingQueryToHref(pathname, next));
    },
    [pathname, query, router],
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const currentHref = useMemo(() => {
    const params = buildListingSearchParams(query);
    const serialized = params.toString();
    return serialized.length > 0 ? `${pathname}?${serialized}` : pathname;
  }, [pathname, query]);

  return { query, updateQuery, clearFilters, pathname, currentHref };
}
