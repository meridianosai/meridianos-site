import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/legal-doc";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "隐私政策 · 子午纪" },
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="隐私政策" updated="2026-07-29">
      <section><h2>1. 我们收集什么</h2><ul>
        <li>账号信息：邮箱、名称、登录会话记录。</li>
        <li>你主动提供的业务数据：产品资料、联系人名单、发信邮箱配置、与 AI 的会话内容。</li>
        <li>服务运行数据：操作日志、任务执行记录（用于排障、审计与用量结算）。</li>
      </ul></section>
      <section><h2>2. 我们如何使用</h2><ul>
        <li>提供与改进服务：调研、画像、序列起草与发送编排均以你的数据为输入。</li>
        <li>会话内容与资料会提交给我们接入的大模型服务处理；仅为完成你发起的任务，不用于训练我们自己的模型。</li>
        <li>长期记忆按组织与产品隔离存储，仅用于改善你自己会话中的上下文。</li>
      </ul></section>
      <section><h2>3. 第三方服务</h2><p>为完成任务，部分数据会经由以下类别的服务商处理：大模型推理、联系人数据源、邮件发送与送达追踪、云基础设施。我们只传输完成任务所必需的字段，并与服务商约定保密义务。</p></section>
      <section><h2>4. 存储与安全</h2><ul>
        <li>数据按组织隔离存储；发信邮箱凭据加密保存。</li>
        <li>我们采取访问控制、传输加密与审计日志等措施防止未授权访问。</li>
        <li>发生可能影响你数据安全的事件时，我们将依法及时通知。</li>
      </ul></section>
      <section><h2>5. 你的权利</h2><ul>
        <li>你可查阅、更正、导出属于你的数据，或申请删除账号及关联数据。</li>
        <li>联系人如向你行使退订或删除权利，平台提供强制退订与删除通道予以配合。</li>
      </ul></section>
      <section><h2>6. 政策变更与联系</h2><p>政策更新后将在本页发布并标注日期，重大变更会另行通知。对个人信息处理有任何疑问，请通过产品内渠道或你的对接人联系我们。</p></section>
    </LegalDoc>
  );
}
