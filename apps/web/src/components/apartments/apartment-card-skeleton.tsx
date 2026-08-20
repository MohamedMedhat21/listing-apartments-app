import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ApartmentCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden py-0 ring-border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardHeader className="gap-2 pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}
