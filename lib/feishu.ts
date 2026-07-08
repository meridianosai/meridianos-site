type WaitlistPayload = {
  contact: string;
  company?: string | null;
  name?: string | null;
};

/**
 * 向内测线索飞书群发送 webhook 通知。
 * FEISHU_WEBHOOK_URL 未配置时静默跳过(本地开发可不配)。
 */
export async function notifyWaitlistSignup(payload: WaitlistPayload) {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[feishu] FEISHU_WEBHOOK_URL 未设置,跳过通知");
    }
    return;
  }

  const lines = [
    "【拓客引擎内测】新排队申请",
    `联系方式: ${payload.contact}`,
    `公司: ${payload.company || "—"}`,
    `姓名/职位: ${payload.name || "—"}`,
    `时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
  ];

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msg_type: "text",
      content: { text: lines.join("\n") },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`飞书 webhook 请求失败 (${res.status}): ${body}`);
  }

  const json = (await res.json().catch(() => null)) as {
    code?: number;
    msg?: string;
  } | null;
  if (json && json.code !== 0) {
    throw new Error(`飞书 webhook 返回错误: ${json.msg ?? "unknown"}`);
  }
}
