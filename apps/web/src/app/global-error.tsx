'use client';

import { Geist } from 'next/font/google';

import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';

import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" className={`${geist.className} h-full`}>
      <body className="min-h-full bg-background text-foreground">
        <title>Application error | Nawy Apartments</title>
        <main className="py-16">
          <PageContainer className="flex flex-col items-start gap-4">
            <p className="text-sm font-medium text-destructive">Application error</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Something went wrong
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              The application could not load. Try again in a moment.
            </p>
            <Button type="button" onClick={retry}>
              Try again
            </Button>
          </PageContainer>
        </main>
      </body>
    </html>
  );
}
