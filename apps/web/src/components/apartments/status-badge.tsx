import { ApartmentStatus } from '@apartments/shared';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<ApartmentStatus, string> = {
  [ApartmentStatus.AVAILABLE]: 'Available',
  [ApartmentStatus.RESERVED]: 'Reserved',
  [ApartmentStatus.SOLD]: 'Sold',
};

const STATUS_STYLES: Record<ApartmentStatus, string> = {
  [ApartmentStatus.AVAILABLE]: 'bg-status-available/15 text-status-available',
  [ApartmentStatus.RESERVED]: 'bg-status-reserved/15 text-status-reserved',
  [ApartmentStatus.SOLD]: 'bg-status-sold/15 text-status-sold',
};

interface StatusBadgeProps {
  status: ApartmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status], 'border-transparent', className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
