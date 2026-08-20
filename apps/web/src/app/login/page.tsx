'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormValues } from '@apartments/shared';

import { PageContainer } from '@/components/layout/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/auth-context';
import { resolvePostLoginPath } from '@/lib/auth/post-login-redirect';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(resolvePostLoginPath(searchParams.get('next')));
    }
  }, [router, searchParams, status]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await login(values.email, values.password);
      router.replace(resolvePostLoginPath(searchParams.get('next')));
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        return;
      }

      setFormError('Unable to log in. Try again in a moment.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="min-h-11"
          {...register('email')}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="min-h-11"
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {formError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <section className="py-8">
      <PageContainer className="mx-auto max-w-md space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-primary">Admin access</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Log in</h1>
          <p className="text-sm text-muted-foreground">
            Log in with your admin account to add apartments through the browser.
          </p>
        </header>

        <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
          <LoginForm />
        </Suspense>

        <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'px-0')}>
          Back to listings
        </Link>
      </PageContainer>
    </section>
  );
}
