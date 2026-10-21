# syntax=docker/dockerfile:1

# Build on the build machine's own platform: the output is plain JavaScript, so only the
# runtime stage needs to match the target (linux/amd64 on Fargate).
FROM --platform=$BUILDPLATFORM node:22-slim AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY functions/policy-issuer/package.json functions/policy-issuer/
COPY infra/package.json infra/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter policy-issuer build:lib && pnpm --filter web build

FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app
COPY --from=build /repo/apps/web/.output ./.output
COPY --from=build /repo/apps/web/.output/otel.mjs ./otel.mjs
USER node
EXPOSE 8080
CMD ["node", "--import", "./otel.mjs", ".output/index"]
