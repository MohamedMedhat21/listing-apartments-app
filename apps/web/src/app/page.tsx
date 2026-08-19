import type { ProjectSummary } from '@apartments/shared';

import { ApartmentGrid } from '@/components/apartments/apartment-grid';
import { ListingEmptyState } from '@/components/apartments/listing-empty-state';
import { ListingErrorState } from '@/components/apartments/listing-error-state';
import { ListingPagination } from '@/components/apartments/listing-pagination';
import { ListingToolbar } from '@/components/apartments/listing-toolbar';
import { PageContainer } from '@/components/layout/page-container';
import { ApiError } from '@/lib/api/client';
import { createServerApiClient } from '@/lib/api/server';
import {
  hasActiveListingFilters,
  parseListingSearchParams,
  resolveListingQuery,
} from '@/lib/listing/search-params';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: PageProps<'/'>) {
  const resolvedSearchParams = await searchParams;
  const query = resolveListingQuery(parseListingSearchParams(resolvedSearchParams));
  const api = createServerApiClient();

  let projects: ProjectSummary[] = [];
  let fetchError: string | null = null;
  let apartmentsResponse: Awaited<ReturnType<typeof api.listApartments>> | null = null;

  try {
    const [apartmentsResult, projectsResult] = await Promise.all([
      api.listApartments(query),
      api.listProjects(),
    ]);
    apartmentsResponse = apartmentsResult;
    projects = projectsResult.data;
  } catch (error) {
    if (error instanceof ApiError) {
      fetchError = error.message;
    } else {
      fetchError = 'The apartments service could not complete this request.';
    }
  }

  const hasActiveFilters = hasActiveListingFilters(query);

  return (
    <section className="py-8">
      <PageContainer className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-primary">Browse listings</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Apartments across Egypt
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Search by unit name, number, or project. Filter by price, bedrooms, and availability,
            then share the URL to revisit the same results.
          </p>
        </header>

        <ListingToolbar projects={projects} />

        {fetchError ? (
          <ListingErrorState message={fetchError} />
        ) : apartmentsResponse && apartmentsResponse.data.length === 0 ? (
          <ListingEmptyState hasActiveFilters={hasActiveFilters} />
        ) : apartmentsResponse ? (
          <div className="space-y-6">
            <ApartmentGrid apartments={apartmentsResponse.data} />
            <ListingPagination meta={apartmentsResponse.meta} />
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
}
