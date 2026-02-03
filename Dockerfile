# Base image
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Install dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Generate database client first
RUN pnpm --filter @repo/db run generate
RUN pnpm run build

# Final runtime image
FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app /app

EXPOSE 4000
CMD [ "pnpm", "--filter", "api", "start" ]
