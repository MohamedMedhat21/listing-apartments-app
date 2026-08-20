'use client';

import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';

export default function AppError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="py-16">
      <PageContainer className="flex flex-col items-start gap-4">
        <p className="text-sm font-medium text-destructive">Unable to load apartments</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Something went wrong</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          The apartments service could not complete this request. Try again in a moment.
        </p>
        <Button type="button" onClick={retry}>
          Try again
        </Button>
      </PageContainer>
    </section>
  );
}
