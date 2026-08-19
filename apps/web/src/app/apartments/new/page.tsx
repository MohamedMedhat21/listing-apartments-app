'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { CreateApartmentForm } from '@/components/apartments/create-apartment-form';
import { PageContainer } from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth/auth-context';

export default function NewApartmentPage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?next=/apartments/new');
    }
  }, [router, status]);

  if (status === 'loading') {
    return (
      <section className="py-8">
        <PageContainer className="space-y-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </PageContainer>
      </section>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <section className="py-8">
      <PageContainer className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-primary">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Add apartment</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create a new apartment listing. Required fields match the API contract used by the
            backend.
          </p>
        </header>

        <CreateApartmentForm />
      </PageContainer>
    </section>
  );
}
