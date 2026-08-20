import { PageContainer } from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApartmentDetailsLoading() {
  return (
    <section className="py-8">
      <PageContainer className="space-y-8">
        <Skeleton className="h-9 w-36" />

        <div className="space-y-8 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />

          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4 sm:h-9" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-28" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </div>
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </PageContainer>
    </section>
  );
}
