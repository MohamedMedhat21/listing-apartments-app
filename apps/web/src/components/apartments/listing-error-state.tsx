'use client';

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface ListingErrorStateProps {
  message?: string;
}

export function ListingErrorState({
  message = 'The apartments service could not complete this request.',
}: ListingErrorStateProps) {
  const router = useRouter();

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
      role="alert"
    >
      <AlertCircle aria-hidden="true" className="size-10 text-destructive" strokeWidth={1.5} />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-destructive">Unable to load apartments</h2>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <Button type="button" variant="outline" onClick={() => router.refresh()}>
        Try again
      </Button>
    </div>
  );
}
