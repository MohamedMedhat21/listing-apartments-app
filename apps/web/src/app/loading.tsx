import { PageContainer } from '@/components/layout/page-container';
import { ApartmentCardSkeleton } from '@/components/apartments/apartment-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <section className="py-8">
      <PageContainer className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-64 sm:h-9" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full md:hidden" />
          <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <ApartmentCardSkeleton key={index} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
