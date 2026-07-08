/**
 * POST /api/waitlist — 内测排队线索落库。
 *
 * 校验用 zod;写入复用 meridian-ai 的 PG 实例上的独立库(waitlist_signups 表)。
 * postgres-js 需 Node 运行时,故显式声明 runtime=nodejs。
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { waitlistSignups } from "@/lib/db/schema";
import { notifyWaitlistSignup } from "@/lib/feishu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  contact: z
    .string({ error: "请填写微信号或邮箱" })
    .trim()
    .min(1, "请填写微信号或邮箱")
    .max(200, "微信号或邮箱过长"),
  company: z.string().trim().max(200, "公司名称过长").optional(),
  name: z.string().trim().max(200, "姓名 / 职位过长").optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "无效的请求体" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "校验失败" },
      { status: 400 },
    );
  }

  const { contact, company, name } = parsed.data;

  try {
    const db = getDb();
    await db.insert(waitlistSignups).values({
      contact,
      company: company || null,
      name: name || null,
      userAgent: request.headers.get("user-agent") ?? null,
    });

    try {
      await notifyWaitlistSignup({ contact, company, name });
    } catch (notifyErr) {
      console.error("[waitlist] feishu notify failed", notifyErr);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    return NextResponse.json(
      { ok: false, error: "提交失败,请稍后再试" },
      { status: 500 },
    );
  }
}
