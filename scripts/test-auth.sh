#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# A disposable local PostgreSQL, never DATABASE_URL from .env or production.
test_container="homemeal-auth-test-$$"
trap 'docker rm -fv "$test_container" >/dev/null 2>&1 || true' EXIT
docker run --rm -d --name "$test_container" -e POSTGRES_USER=homemeal_test -e POSTGRES_DB=homemeal_test_auth -e POSTGRES_HOST_AUTH_METHOD=trust -p 127.0.0.1::5432 postgres:17 >/dev/null
for attempt in {1..40}; do
  if docker exec "$test_container" pg_isready -U homemeal_test -d homemeal_test_auth >/dev/null; then break; fi
  if [ "$attempt" = 40 ]; then exit 1; fi
  sleep 1
done
test_port=$(docker port "$test_container" 5432/tcp | sed 's/^127\.0\.0\.1://')
export HOMEMEAL_TEST_DATABASE_URL="postgresql://homemeal_test@127.0.0.1:${test_port}/homemeal_test_auth"
NODE_ENV=test node --import tsx --test tests/auth.test.ts
