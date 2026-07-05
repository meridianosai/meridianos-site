/**
 * 部署时确保目标数据库存在(drizzle 迁移只跑 DDL,不建库)。
 * 从 DATABASE_URL 取目标库名,连到同实例的 postgres 维护库,若不存在则 CREATE DATABASE。
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[ensure-db] DATABASE_URL 未设置");
  process.exit(1);
}

const target = new URL(url);
const dbName = decodeURIComponent(target.pathname.replace(/^\//, ""));
if (!dbName) {
  console.error("[ensure-db] DATABASE_URL 缺少库名");
  process.exit(1);
}

// 连到维护库 postgres(建库不能在目标库自身内进行)
const adminUrl = new URL(url);
adminUrl.pathname = "/postgres";

const sql = postgres(adminUrl.toString(), { max: 1, prepare: false });
try {
  const rows = await sql`SELECT 1 FROM pg_database WHERE datname = ${dbName}`;
  if (rows.length === 0) {
    // CREATE DATABASE 不支持参数占位,标识符需双引号转义
    await sql.unsafe(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`[ensure-db] 已创建数据库 ${dbName}`);
  } else {
    console.log(`[ensure-db] 数据库 ${dbName} 已存在`);
  }
} catch (err) {
  console.error("[ensure-db] 失败:", err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
