'use client';

import type { ProjectSummary } from '@apartments/shared';
import { Suspense } from 'react';

import { FilterPanel } from '@/components/filters/filter-panel';
import { SearchInput } from '@/components/filters/search-input';
import { SortSelect } from '@/components/filters/sort-select';

interface ListingToolbarProps {
  projects: ProjectSummary[];
}

function ListingToolbarContent({ projects }: ListingToolbarProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
        <SearchInput />
        <SortSelect />
      </div>
      <FilterPanel projects={projects} />
    </div>
  );
}

export function ListingToolbar({ projects }: ListingToolbarProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="h-11 animate-pulse rounded-md bg-muted" />
        </div>
      }
    >
      <ListingToolbarContent projects={projects} />
    </Suspense>
  );
}
