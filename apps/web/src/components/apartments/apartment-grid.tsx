import type { ApartmentListItem } from '@apartments/shared';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { ApartmentCard } from './apartment-card';

interface ApartmentGridProps extends ComponentProps<'div'> {
  apartments: ApartmentListItem[];
}

export function ApartmentGrid({ apartments, className, ...props }: ApartmentGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
      {...props}
    >
      {apartments.map((apartment) => (
        <ApartmentCard key={apartment.id} apartment={apartment} />
      ))}
    </div>
  );
}
