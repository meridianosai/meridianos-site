"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "./reveal";

type Status = "idle" | "submitting" | "done" | "error";

/**
 * 内测排队 CTA。提交后 POST /api/waitlist,线索落库到复用自 meridian-ai 的
 * PostgreSQL 独立库(waitlist_signups 表)。含提交中/错误态处理。
 */
export function Waitlist() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(e.currentTarget);
    const payload = {
      contact: String(data.get("contact") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
    };
    if (!payload.contact) {
      setError("请填写微信号或邮箱");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "提交失败,请稍后再试");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败,请稍后再试");
      setStatus("error");
    }
  }

  return (
    <section id="principles">
      <div className="wrap">
        <Reveal className="wl-card wl-center">
          <div className="coord" style={{ justifyContent: "center" }}>
            内测席位 · 每月少量
          </div>
          <h2>排队进入拓客引擎内测</h2>
          <p>留下联系方式,上线时第一批通知你。现有出海查用户优先。</p>

          {status === "done" ? (
            <div className="wl-ok" style={{ display: "block" }}>
              ✓ 已加入等位名单——上线时第一时间联系你。
            </div>
          ) : (
            <form className="wl-form-full" onSubmit={handleSubmit}>
              <Input
                name="contact"
                placeholder="微信号或邮箱（必填）"
                aria-label="微信号或邮箱"
                required
                disabled={status === "submitting"}
              />
              <div className="wl-row">
                <Input
                  name="company"
                  placeholder="公司名称（选填）"
                  aria-label="公司名称"
                  disabled={status === "submitting"}
                />
                <Input
                  name="name"
                  placeholder="姓名 / 职位（选填）"
                  aria-label="姓名或职位"
                  disabled={status === "submitting"}
                />
              </div>
              <Button type="submit" size="lg" disabled={status === "submitting"}>
                {status === "submitting" ? "提交中…" : "排队内测"}
              </Button>
              {status === "error" && (
                <div
                  role="alert"
                  style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "var(--destructive)",
                  }}
                >
                  {error}
                </div>
              )}
            </form>
          )}
          <div className="wl-hint">首批内测名额免费</div>
        </Reveal>
      </div>
    </section>
  );
}
