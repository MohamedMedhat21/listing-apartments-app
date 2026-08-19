import type { ApartmentListItem } from '@apartments/shared';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatArea, formatBathrooms, formatBedrooms, formatPrice } from '@/lib/formatters';

import { StatusBadge } from './status-badge';

interface ApartmentCardProps {
  apartment: ApartmentListItem;
}

export function ApartmentCard({ apartment }: ApartmentCardProps) {
  return (
    <Card className="h-full overflow-hidden py-0 ring-border transition-colors hover:ring-primary/30">
      <Link href={`/apartments/${apartment.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {apartment.coverImageUrl ? (
            <Image
              src={apartment.coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-muted-foreground"
            >
              <Building2 className="size-10" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <StatusBadge status={apartment.status} />
          </div>
        </div>

        <CardHeader className="gap-2 pb-2">
          <div className="space-y-1">
            <h2 className="line-clamp-2 text-base font-semibold">{apartment.unitName}</h2>
            <p className="text-xs text-muted-foreground">Unit {apartment.unitNumber}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {apartment.project.name} · {apartment.project.city}
          </p>
        </CardHeader>

        <CardContent className="mt-auto space-y-3 pb-4">
          <p className="text-lg font-semibold tabular-nums">{formatPrice(apartment.price)}</p>
          <p className="text-xs text-muted-foreground">
            {formatBedrooms(apartment.bedrooms)} · {formatBathrooms(apartment.bathrooms)} ·{' '}
            {formatArea(apartment.areaSqm)}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
