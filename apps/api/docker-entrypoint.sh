#!/bin/sh
set -e

echo "Running database migrations..."
npm run migration:run:prod

echo "Running idempotent seed..."
npm run seed:prod

echo "Starting API server..."
exec node dist/main.js
