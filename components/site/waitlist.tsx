"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MeridianLines } from "./meridian-lines";
import { prefersReducedMotion, useLanding, type Prefill } from "./landing-context";
import { Reveal } from "./reveal";

type Status = "idle" | "submitting" | "done" | "error";

/**
 * 内测申请。提交后 POST /api/waitlist，线索落库到复用自 meridian-ai 的
 * PostgreSQL 独立库(waitlist_signups 表)并通知飞书。含提交中/错误态处理。
 * 首屏输入框里识别到的官网会预填到「公司 / 官网」，落库时走原来的 company 字段。
 */
export function Waitlist() {
  const { prefill } = useLanding();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [company, setCompany] = useState("");
  const contactRef = useRef<HTMLInputElement>(null);

  // 首屏带过来的官网填进「公司 / 官网」：在渲染时跟着 prefill 调整，之后用户可以自己改
  const [syncedPrefill, setSyncedPrefill] = useState<Prefill | null>(null);
  if (prefill !== syncedPrefill) {
    setSyncedPrefill(prefill);
    if (prefill?.site) setCompany(prefill.site);
  }
  useEffect(() => {
    if (!prefill) return;
    // 等首屏滚过来再把焦点放进联系方式，避免打断平滑滚动
    const t = setTimeout(() => contactRef.current?.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 900);
    return () => clearTimeout(t);
  }, [prefill]);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(e.currentTarget);
    const payload = {
      contact: String(data.get("contact") ?? "").trim(),
      company: company.trim(),
      name: String(data.get("name") ?? "").trim(),
    };
    if (!payload.contact) {
      setError("请填写微信号或邮箱");
      setStatus("error");
      contactRef.current?.focus();
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

  const busy = status === "submitting";
  const fromHero = prefill
    ? `已带上你在首屏填的${prefill.site ? "官网" : "内容"}${prefill.files ? `和 ${prefill.files} 份文件的名字` : ""}。内测开放时，就从这份资料开始聊。`
    : null;

  return (
    <section className="sec wl" id="waitlist">
      <svg className="wl-mer" viewBox="-310 -310 620 620" aria-hidden="true">
        <MeridianLines />
      </svg>
      <div className="wrap">
        <Reveal className="wl-card">
          <h2>申请 MeridianAI Fleet 内测</h2>
          <p>每月开放少量席位。留下联系方式，开放时第一批通知你；出海查用户优先。</p>

          {status === "done" ? (
            <div className="wl-ok" role="status">
              已收到。开放时第一批联系你。
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Input
                ref={contactRef}
                className="field"
                name="contact"
                placeholder="微信号或邮箱（必填）"
                aria-label="微信号或邮箱"
                autoComplete="email"
                required
                disabled={busy}
                onChange={() => status === "error" && setStatus("idle")}
              />
              <div className="row">
                <Input
                  className="field"
                  name="company"
                  placeholder="公司 / 官网（选填）"
                  aria-label="公司或官网"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={busy}
                />
                <Input
                  className="field"
                  name="name"
                  placeholder="姓名 / 职位（选填）"
                  aria-label="姓名或职位"
                  autoComplete="name"
                  disabled={busy}
                />
              </div>
              {fromHero ? <p className="wl-from">{fromHero}</p> : null}
              <Button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "提交中…" : "申请内测"}
              </Button>
              {status === "error" ? (
                <p className="wl-err" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          )}
          <p className="wl-hint">首批内测免费</p>
        </Reveal>
      </div>
    </section>
  );
}
