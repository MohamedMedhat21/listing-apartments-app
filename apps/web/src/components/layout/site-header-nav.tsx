'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SiteHeaderNav() {
  const { user, status, logout } = useAuth();
  const mounted = useIsClient();

  if (!mounted || status === 'loading') {
    return <div className="h-11 w-28 animate-pulse rounded-md bg-muted" aria-hidden="true" />;
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/apartments/new"
          className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'min-h-11')}
        >
          Add apartment
        </Link>
        <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
        <Button type="button" variant="outline" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11')}
    >
      Log in
    </Link>
  );
}
