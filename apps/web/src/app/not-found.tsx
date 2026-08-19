import Link from 'next/link';

import { PageContainer } from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="py-16">
      <PageContainer className="flex flex-col items-start gap-4">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Page not found</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          This page does not exist, or the apartment is no longer available.
        </p>
        <Link href="/" className={buttonVariants()}>
          Browse apartments
        </Link>
      </PageContainer>
    </section>
  );
}
