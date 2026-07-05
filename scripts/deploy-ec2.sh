#!/usr/bin/env bash
# 在 EC2 上执行:构建镜像 → 自动建库+迁移 → 起 web → 健康检查。
# 前置:meridian-ai 已部署(提供共享网络 meridian_default 与 postgres 容器)。
set -euo pipefail
cd "$(dirname "$0")/.."

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "需要 Docker Compose" >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "缺少 .env(设置 GitHub secret SITE_ENV_FILE,或在 EC2 应用目录手建)。" >&2
  exit 1
fi

for key in POSTGRES_USER POSTGRES_PASSWORD SITE_DB; do
  if ! grep -Eq "^${key}=.+" .env; then
    echo "缺少 .env key: ${key}" >&2
    exit 1
  fi
done

if ! docker network inspect meridian_default >/dev/null 2>&1; then
  echo "共享网络 meridian_default 不存在——请先部署 meridian-ai(承载共享 PostgreSQL)。" >&2
  exit 1
fi

env_value() { grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- || true; }

"${COMPOSE[@]}" config --quiet
"${COMPOSE[@]}" build migrate web
"${COMPOSE[@]}" run --rm migrate          # 自动建库 + drizzle 迁移
"${COMPOSE[@]}" up -d --no-deps --remove-orphans web
"${COMPOSE[@]}" ps

app_port="$(env_value SITE_APP_PORT)"
app_port="${app_port:-3005}"
for _ in $(seq 1 30); do
  status="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${app_port}/" || true)"
  if [ "$status" != "000" ] && [ "$status" -lt 500 ]; then
    echo "健康检查通过 HTTP ${status}"
    exit 0
  fi
  sleep 2
done

echo "健康检查失败;web 日志:" >&2
"${COMPOSE[@]}" logs --tail=120 web >&2
exit 1
