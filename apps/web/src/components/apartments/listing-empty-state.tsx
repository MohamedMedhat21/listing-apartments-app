'use client';

import { SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useListingQuery } from '@/lib/listing/use-listing-query';

interface ListingEmptyStateProps {
  hasActiveFilters: boolean;
}

export function ListingEmptyState({ hasActiveFilters }: ListingEmptyStateProps) {
  const { clearFilters } = useListingQuery();

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
      <SearchX aria-hidden="true" className="size-10 text-muted-foreground" strokeWidth={1.5} />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">No apartments matched your search</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {hasActiveFilters
            ? 'Try adjusting your filters or clearing them to see more results.'
            : 'There are no apartments available to browse right now.'}
        </p>
      </div>
      {hasActiveFilters ? (
        <Button type="button" variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
