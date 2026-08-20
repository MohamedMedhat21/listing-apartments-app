'use client';

import { ApiClient } from './client';

function browserApiUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value) {
    throw new Error('NEXT_PUBLIC_API_URL must be configured.');
  }
  return value;
}

export function createBrowserApiClient(): ApiClient {
  return new ApiClient(browserApiUrl());
}
