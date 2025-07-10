#!/bin/sh

# This script ensures the database is ready before running migrations and starting the server.

echo "Waiting for postgres..."
# The `nc` command checks if the port is open on the 'db' host.
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run Prisma migrations to keep the database schema up to date.
echo "Running Prisma migrations..."
pnpm exec prisma migrate deploy

# Start the application in development mode with hot-reloading.
echo "Starting API server..."
pnpm start:dev 