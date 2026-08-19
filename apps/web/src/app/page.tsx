import { PageContainer } from '@/components/layout/page-container';
import { createServerApiClient } from '@/lib/api/server';
import { formatPrice } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const apartments = await createServerApiClient().listApartments({ limit: 1 });
  const firstApartment = apartments.data[0];

  return (
    <section className="py-8">
      <PageContainer className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">API connected</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Apartments across Egypt
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            The frontend foundation is reading live apartment data. Search and filters arrive in the
            next phase.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-xs text-muted-foreground">Apartments available to browse</p>
          <p className="mt-2 text-lg font-semibold tabular-nums">
            {apartments.meta.total.toLocaleString('en-EG')}
          </p>
          {firstApartment ? (
            <p className="mt-4 text-sm">
              First result: <span className="font-semibold">{firstApartment.unitName}</span> in{' '}
              {firstApartment.project.name} — {formatPrice(firstApartment.price)}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              The API is reachable, but it currently contains no apartments.
            </p>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
