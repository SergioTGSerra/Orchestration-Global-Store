#!/bin/bash

npm install

npx prisma migrate reset --force
npx prisma migrate dev --name initial add-postgis add-uuid-ossp add-postgis_topology
npx prisma generate

if [ "$USE_DEV_MODE" = "true" ]; then
  npm run start:dev
else
  npm run start
fi
