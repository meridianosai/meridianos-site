"use client";

import { useEffect, useEffectEvent, useRef, useState, type SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MeridianLines } from "./meridian-lines";
import { useLanding, WAITLIST_ID, type Prefill } from "./landing-context";
import { prefersReducedMotion } from "./motion";
import { Reveal } from "./reveal";

type FormState = { kind: "idle" } | { kind: "submitting" } | { kind: "done" } | { kind: "error"; message: string };

/**
 * 内测申请。提交后 POST /api/waitlist，线索落库到复用自 meridian-ai 的
 * PostgreSQL 独立库(waitlist_signups 表)并通知飞书。含提交中/错误态处理。
 * 首屏输入框里识别到的官网会预填到「公司 / 官网」，落库时走原来的 company 字段。
 */
export function Waitlist() {
  const bus = useLanding();
  const [form, setForm] = useState<FormState>({ kind: "idle" });
  const [company, setCompany] = useState("");
  const [fromHero, setFromHero] = useState<Prefill | null>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 首屏提交是一次事件：在回调里预填、在滚动停下后聚焦联系方式
  const onPrefill = useEffectEvent((p: Prefill) => {
    setFromHero(p);
    if (p.site) setCompany(p.site);
    clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => contactRef.current?.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 900);
  });
  useEffect(() => {
    const off = bus.onPrefill((p) => onPrefill(p));
    const timer = focusTimer;
    return () => {
      off();
      clearTimeout(timer.current);
    };
  }, [bus]);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.kind === "submitting") return;

    const data = new FormData(e.currentTarget);
    const payload = {
      contact: String(data.get("contact") ?? "").trim(),
      company: company.trim(),
      name: String(data.get("name") ?? "").trim(),
    };
    if (!payload.contact) {
      setForm({ kind: "error", message: "请填写微信号或邮箱" });
      contactRef.current?.focus();
      return;
    }

    setForm({ kind: "submitting" });
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
      setForm({ kind: "done" });
    } catch (err) {
      setForm({ kind: "error", message: err instanceof Error ? err.message : "提交失败,请稍后再试" });
    }
  }

  const busy = form.kind === "submitting";
  // 只说真的带过来的东西：识别到官网才说填好了；文件和其余文字不会提交
  const heroNote = fromHero
    ? fromHero.site
      ? "已把你在首屏贴的官网填进「公司 / 官网」。"
      : "首屏填的内容不会上传。内测开放后，在产品里贴同样的资料就能开始。"
    : null;

  return (
    <section className="sec wl" id={WAITLIST_ID}>
      <svg className="wl-mer" viewBox="-310 -310 620 620" aria-hidden="true">
        <MeridianLines />
      </svg>
      <div className="wrap">
        <Reveal className="wl-card">
          <h2>申请 MeridianAI Fleet 内测</h2>
          <p>每月开放少量席位。留下联系方式，开放时第一批通知你；出海查用户优先。</p>

          {form.kind === "done" ? (
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
                onChange={() => {
                  if (form.kind === "error") setForm({ kind: "idle" });
                }}
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
              {heroNote ? <p className="wl-from">{heroNote}</p> : null}
              <Button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "提交中…" : "申请内测"}
              </Button>
              {form.kind === "error" ? (
                <p className="wl-err" role="alert">
                  {form.message}
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
