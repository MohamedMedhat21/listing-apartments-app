import type { Metadata } from 'next';
import type { ApartmentDetail } from '@apartments/shared';
import { ArrowLeft, Building2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ApartmentGallery } from '@/components/apartments/apartment-gallery';
import { SpecGrid } from '@/components/apartments/spec-grid';
import { PageContainer } from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ApiError } from '@/lib/api/client';
import { createServerApiClient } from '@/lib/api/server';
import { formatPrice } from '@/lib/formatters';
import { listingQueryToHref } from '@/lib/listing/search-params';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface ApartmentDetailsPageProps {
  params: Promise<{ id: string }>;
}

function projectListingHref(projectId: string): string {
  return listingQueryToHref('/', { projectId });
}

function apartmentDescription(apartment: ApartmentDetail): string {
  if (apartment.description) {
    return apartment.description;
  }

  return `${apartment.unitName} in ${apartment.project.name}, ${apartment.project.city}.`;
}

async function loadApartment(id: string): Promise<ApartmentDetail> {
  try {
    return await createServerApiClient().getApartment(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }: ApartmentDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const apartment = await createServerApiClient().getApartment(id);

    return {
      title: apartment.unitName,
      description: apartmentDescription(apartment),
    };
  } catch {
    return {
      title: 'Apartment not found',
    };
  }
}

export default async function ApartmentDetailsPage({ params }: ApartmentDetailsPageProps) {
  const { id } = await params;
  const apartment = await loadApartment(id);
  const projectHref = projectListingHref(apartment.project.id);

  return (
    <section className="py-8">
      <PageContainer className="space-y-8">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2 px-0')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to listings
        </Link>

        <div className="space-y-8 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
          <ApartmentGallery imageUrls={apartment.imageUrls} unitName={apartment.unitName} />

          <div className="space-y-6">
            <header className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Unit {apartment.unitNumber}</p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {apartment.unitName}
                </h1>
              </div>
              <p className="text-lg font-semibold tabular-nums">{formatPrice(apartment.price)}</p>
              <p className="text-sm text-muted-foreground">
                {apartment.project.name} · {apartment.project.city},{' '}
                {apartment.project.district}
              </p>
            </header>

            <SpecGrid apartment={apartment} />
          </div>
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {apartment.description ?? 'No description has been provided for this apartment.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Amenities</h2>
            {apartment.amenities.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {apartment.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="rounded-md border bg-card px-3 py-2 text-sm text-foreground"
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No amenities listed.</p>
            )}
          </section>

          {apartment.address ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Address</h2>
              <p className="text-sm text-muted-foreground">{apartment.address}</p>
            </section>
          ) : null}

          <Card>
            <CardHeader className="gap-3">
              <h2 className="text-lg font-semibold">Project and developer</h2>
              <p className="text-sm text-muted-foreground">
                {apartment.project.name} · {apartment.project.city}, {apartment.project.district}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {apartment.project.developer.logoUrl ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={apartment.project.developer.logoUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                  >
                    <Building2 className="size-5" strokeWidth={1.5} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{apartment.project.developer.name}</p>
                  <p className="text-xs text-muted-foreground">Developer</p>
                </div>
              </div>

              <Link href={projectHref} className={buttonVariants({ variant: 'outline' })}>
                View more apartments in {apartment.project.name}
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </section>
  );
}
