import { ApiClient } from './client';

function serverApiUrl(): string {
  const value = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!value) {
    throw new Error('INTERNAL_API_URL or NEXT_PUBLIC_API_URL must be configured.');
  }
  return value;
}

export function createServerApiClient(): ApiClient {
  return new ApiClient(serverApiUrl());
}
