'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useListingQuery } from '@/lib/listing/use-listing-query';

const DEBOUNCE_MS = 400;

function SearchInputField({
  initialQuery,
  onQueryCommit,
}: {
  initialQuery: string;
  onQueryCommit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const trimmed = value.trim();
      const current = initialQuery.trim();

      if (trimmed === current) {
        return;
      }

      onQueryCommit(trimmed);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [initialQuery, onQueryCommit, value]);

  return (
    <div className="space-y-2">
      <Label htmlFor="apartment-search">Search apartments</Label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="apartment-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search by unit name, number, or project"
          className="min-h-11 pl-9"
        />
      </div>
    </div>
  );
}

export function SearchInput() {
  const { query, updateQuery } = useListingQuery();
  const urlQuery = query.q ?? '';
  const commitQuery = useCallback(
    (trimmed: string) => updateQuery({ q: trimmed || undefined }),
    [updateQuery],
  );

  return <SearchInputField key={urlQuery} initialQuery={urlQuery} onQueryCommit={commitQuery} />;
}
