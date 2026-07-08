type WaitlistPayload = {
  contact: string;
  company?: string | null;
  name?: string | null;
};

function buildWaitlistCard(payload: WaitlistPayload) {
  const submittedAt = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });

  return {
    msg_type: "interactive",
    card: {
      header: {
        title: {
          tag: "plain_text",
          content: "拓客引擎内测 · 新排队申请",
        },
        template: "orange",
      },
      elements: [
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**公司**\n${payload.company || "—"}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**姓名 / 职位**\n${payload.name || "—"}`,
              },
            },
          ],
        },
        {
          tag: "div",
          fields: [
            {
              is_short: false,
              text: {
                tag: "lark_md",
                content: `**联系方式**\n${payload.contact}`,
              },
            },
          ],
        },
        { tag: "hr" },
        {
          tag: "column_set",
          flex_mode: "none",
          columns: [
            {
              tag: "column",
              width: "weighted",
              weight: 1,
              vertical_align: "center",
              elements: [
                {
                  tag: "note",
                  elements: [
                    {
                      tag: "plain_text",
                      content: `提交时间：${submittedAt}`,
                    },
                  ],
                },
              ],
            },
            {
              tag: "column",
              width: "auto",
              vertical_align: "center",
              elements: [
                {
                  tag: "div",
                  text: {
                    tag: "lark_md",
                    content: "<font color='grey'>标注来源-->落地页</font>",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

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

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildWaitlistCard(payload)),
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
