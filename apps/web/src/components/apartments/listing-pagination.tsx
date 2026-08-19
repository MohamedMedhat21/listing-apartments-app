'use client';

import type { PaginationMeta } from '@apartments/shared';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useListingQuery } from '@/lib/listing/use-listing-query';

interface ListingPaginationProps {
  meta: PaginationMeta;
}

export function ListingPagination({ meta }: ListingPaginationProps) {
  const { updateQuery } = useListingQuery();

  if (meta.totalPages <= 1) {
    return (
      <p className="text-sm text-muted-foreground">
        Showing {meta.total.toLocaleString('en-EG')} apartment{meta.total === 1 ? '' : 's'}
      </p>
    );
  }

  const canGoPrevious = meta.page > 1;
  const canGoNext = meta.page < meta.totalPages;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {meta.page.toLocaleString('en-EG')} of {meta.totalPages.toLocaleString('en-EG')} ·{' '}
        {meta.total.toLocaleString('en-EG')} apartment{meta.total === 1 ? '' : 's'}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => updateQuery({ page: meta.page - 1 }, { resetPage: false })}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => updateQuery({ page: meta.page + 1 }, { resetPage: false })}
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  );
}
