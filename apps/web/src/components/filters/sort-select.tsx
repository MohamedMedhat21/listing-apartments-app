'use client';

import { ApartmentSortOption } from '@apartments/shared';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LISTING_DEFAULT_SORT } from '@/lib/listing/search-params';
import { SORT_OPTION_LABELS, SORT_OPTIONS } from '@/lib/listing/sort-labels';
import { useListingQuery } from '@/lib/listing/use-listing-query';

export function SortSelect() {
  const { query, updateQuery } = useListingQuery();
  const value = query.sort ?? LISTING_DEFAULT_SORT;

  return (
    <div className="space-y-2">
      <Label htmlFor="apartment-sort">Sort by</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (!nextValue) {
            return;
          }

          updateQuery({
            sort:
              nextValue === LISTING_DEFAULT_SORT ? undefined : (nextValue as ApartmentSortOption),
          });
        }}
      >
        <SelectTrigger id="apartment-sort" className="min-h-11 w-full">
          <SelectValue placeholder="Sort apartments" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {SORT_OPTION_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
