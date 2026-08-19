#!/bin/sh
set -e

cd /app

echo "Running database migrations..."
npm run migration:run --workspace apps/api

echo "Running idempotent seed..."
npm run seed --workspace apps/api

echo "Starting API in watch mode..."
exec npm run start:dev --workspace apps/api
