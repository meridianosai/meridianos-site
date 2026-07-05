/**
 * 子午纪 landing-page · Drizzle schema
 *
 * 复用 meridian-ai 的 PostgreSQL 实例,但落在独立数据库(默认 meridian_landing)。
 * 命名沿用 meridian-ai 约定:snake_case 复数表名、uuid v4 主键、timestamptz defaultNow。
 */
import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

// 内测排队线索(#principles 区块的 waitlist 表单提交)
export const waitlistSignups = pgTable(
  "waitlist_signups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contact: text("contact").notNull(), // 微信号或邮箱(必填)
    company: text("company"), // 公司名称(选填)
    name: text("name"), // 姓名 / 职位(选填)
    source: text("source").notNull().default("landing"), // 线索来源标记
    userAgent: text("user_agent"), // 提交时 UA,便于甄别无效线索
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("waitlist_signups_created_at_idx").on(t.createdAt)],
);

export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type NewWaitlistSignup = typeof waitlistSignups.$inferInsert;
