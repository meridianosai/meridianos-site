"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Building2, FileText, Plus, Send, X } from "lucide-react";
import { scrollToSection, useLanding, WAITLIST_ID } from "./landing-context";
import { prefersReducedMotion } from "./motion";

const DEMO_TEXT = "https://shenggu-audio.com";
const DEMO_FILES = ["声谷电子 · 产品目录.pdf", "声谷电子 · 产品报价.xlsx"];
const URL_RE = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s，。,]*)?/i;

/**
 * 首屏输入框：照 web-next 欢迎页（welcome-composer）。「用示例公司试试」只把资料装进框里，不替用户发送；
 * 发送示例时让理解区重放，发送自己的内容时把识别到的官网交给内测表单。
 */
export function HeroComposer() {
  const bus = useLanding();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  // 点了「用示例公司试试」之后就算示例，打字动画还没放完时发送也一样
  const [demo, setDemo] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typing = useRef<ReturnType<typeof setInterval> | null>(null);
  const canSend = demo || Boolean(text.trim()) || files.length > 0;

  useEffect(() => () => stopTyping(), []);
  // 输入框随内容长高，到上限后滚动
  useEffect(() => {
    const ta = textRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(150, ta.scrollHeight)}px`;
  }, [text]);

  function stopTyping() {
    if (typing.current) clearInterval(typing.current);
    typing.current = null;
  }

  function fillDemo() {
    stopTyping();
    setText(DEMO_TEXT);
    setFiles(DEMO_FILES);
  }

  function submit(e?: { preventDefault(): void }) {
    e?.preventDefault();
    if (!canSend) return;
    if (demo) {
      fillDemo();
      bus.replayDemo();
      scrollToSection("understand");
      return;
    }
    bus.prefill({ site: text.trim().match(URL_RE)?.[0] ?? null });
    scrollToSection(WAITLIST_ID);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function loadDemo() {
    stopTyping();
    setDemo(true);
    setFiles([]);
    textRef.current?.focus();
    if (prefersReducedMotion()) {
      fillDemo();
      return;
    }
    let i = 0;
    setText("");
    typing.current = setInterval(() => {
      i += 1;
      setText(DEMO_TEXT.slice(0, i));
      if (i >= DEMO_TEXT.length) fillDemo();
    }, 34);
  }

  return (
    <>
      <form className="wc k" style={{ "--d": 4 }} autoComplete="off" onSubmit={submit}>
        {files.length ? (
          <div className="wc-files">
            {files.map((name) => (
              <span key={name} className="wc-file">
                <FileText className="i" />
                <span>{name}</span>
                <button
                  type="button"
                  aria-label={`移除 ${name}`}
                  onClick={() => {
                    setDemo(false);
                    setFiles((f) => f.filter((x) => x !== name));
                    textRef.current?.focus();
                  }}
                >
                  <X className="i" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <label className="vh" htmlFor="heroInput">
          官网、客户链接，或说说你想了解什么
        </label>
        <textarea
          id="heroInput"
          ref={textRef}
          rows={2}
          value={text}
          placeholder="贴官网、客户链接或添加资料，告诉我你想了解什么"
          onChange={(e) => {
            stopTyping();
            setDemo(false);
            setText(e.target.value);
          }}
          onKeyDown={onKeyDown}
        />
        {/* 只取文件名显示成 chip，文件不离开浏览器 */}
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const names = Array.from(e.target.files ?? [], (f) => f.name);
            setFiles((f) => [...f, ...names.filter((n) => !f.includes(n))]);
            setDemo(false);
            e.target.value = "";
          }}
        />
        <button type="button" className="wc-plus" aria-label="添加附件" onClick={() => fileRef.current?.click()}>
          <Plus className="i" />
        </button>
        <button type="submit" className="wc-send" aria-label="发送消息" disabled={!canSend}>
          <Send className="i" />
        </button>
      </form>
      <p className="wc-ex k" style={{ "--d": 5 }}>
        <button type="button" onClick={loadDemo}>
          <Building2 className="i" />
          用示例公司试试
        </button>
        <span className="wc-beta">
          <span className="dot new" />
          MeridianAI Fleet · 内测中
        </span>
      </p>
    </>
  );
}
