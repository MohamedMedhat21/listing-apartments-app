import Link from 'next/link';

import { SiteHeaderNav } from '@/components/layout/site-header-nav';
import { PageContainer } from './page-container';

export function SiteHeader() {
  return (
    <header className="border-b bg-card">
      <PageContainer className="flex min-h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-md text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Nawy Apartments
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-3">
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Browse apartments
          </Link>
          <SiteHeaderNav />
        </nav>
      </PageContainer>
    </header>
  );
}
