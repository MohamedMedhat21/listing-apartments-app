import type { ApartmentDetail } from '@apartments/shared';

import {
  formatArea,
  formatBathrooms,
  formatBedrooms,
  formatFloor,
  formatPrice,
} from '@/lib/formatters';

import { StatusBadge } from './status-badge';

interface SpecGridProps {
  apartment: Pick<
    ApartmentDetail,
    'price' | 'bedrooms' | 'bathrooms' | 'areaSqm' | 'floor' | 'status'
  >;
}

const SPEC_ITEMS: Array<{
  label: string;
  value: (apartment: SpecGridProps['apartment']) => string;
}> = [
  { label: 'Price', value: (apartment) => formatPrice(apartment.price) },
  { label: 'Bedrooms', value: (apartment) => formatBedrooms(apartment.bedrooms) },
  { label: 'Bathrooms', value: (apartment) => formatBathrooms(apartment.bathrooms) },
  { label: 'Area', value: (apartment) => formatArea(apartment.areaSqm) },
  { label: 'Floor', value: (apartment) => formatFloor(apartment.floor) },
];

export function SpecGrid({ apartment }: SpecGridProps) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SPEC_ITEMS.map((item) => (
        <div key={item.label} className="rounded-lg border bg-card p-4">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">{item.value(apartment)}</dd>
        </div>
      ))}
      <div className="rounded-lg border bg-card p-4">
        <dt className="text-xs text-muted-foreground">Status</dt>
        <dd className="mt-2">
          <StatusBadge status={apartment.status} />
        </dd>
      </div>
    </dl>
  );
}
