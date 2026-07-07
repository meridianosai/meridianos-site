# 子午纪 landing-page · 多阶段镜像(对齐 meridian-ai,改用 npm + Next standalone)
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps:含 devDeps,供 build 与 migrate ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder:Next standalone 构建 ----
FROM base AS builder
ENV NODE_ENV=production
# build 不连库(client 为 lazy),给合法占位即可
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG NEXT_PUBLIC_SITE_URL=https://meridianos.ai
ARG NEXT_PUBLIC_SEO_NOINDEX=false
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SEO_NOINDEX=$NEXT_PUBLIC_SEO_NOINDEX
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- migrator:部署时自动建库 + 迁移(一次性运行)----
FROM deps AS migrator
ENV NODE_ENV=production
COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY lib ./lib
COPY scripts ./scripts
CMD ["sh", "-c", "node scripts/ensure-db.mjs && npx drizzle-kit migrate"]

# ---- runner:standalone 运行时(最小镜像)----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
