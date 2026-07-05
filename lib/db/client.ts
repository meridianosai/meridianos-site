/**
 * Postgres 客户端(postgres-js 单例),技术栈对齐 meridian-ai/src/lib/db/client.ts。
 *
 * 用 lazy `getDb()`:仅在实际处理请求时才读取 DATABASE_URL 并建立连接池,
 * 这样 `next build` 阶段(无需连库)不会因缺少 env 而失败。
 * dev 下缓存到 globalThis 以熬过 HMR;生产每进程新建。
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  _pgClient?: ReturnType<typeof postgres>;
  _drizzle?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getDb() {
  if (globalForDb._drizzle) return globalForDb._drizzle;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL 未设置。请在 .env.local 中配置(参见 .env.example)。",
    );
  }

  const client =
    globalForDb._pgClient ??
    postgres(url, { max: 10, idle_timeout: 20, prepare: false });
  const db = drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === "development",
  });

  if (process.env.NODE_ENV !== "production") {
    globalForDb._pgClient = client;
    globalForDb._drizzle = db;
  }
  return db;
}

export { schema };
