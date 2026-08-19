import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import { resolve } from 'node:path';

// Next loads environment files from the app directory by default. This
// monorepo deliberately keeps one root .env for db, api, and web.
loadEnvConfig(
  resolve(process.cwd(), '../..'),
  process.env.NODE_ENV !== 'production',
  console,
  true,
);

const nextConfig: NextConfig = {
  images: {
    // BR-17 permits any valid external http(s) URL, so a finite remote-host
    // allowlist cannot represent the API contract.
    unoptimized: true,
  },
};

export default nextConfig;
