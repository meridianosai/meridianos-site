import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/legal-doc";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "服务条款 · 子午纪" },
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <LegalDoc title="服务条款" updated="2026-07-29">
      <section><h2>1. 服务说明</h2><p>子午纪（MeridianOS）是面向企业的 AI 外联智能平台，提供市场调研、客户画像、联系人获取与冷邮件序列的起草与发送辅助。服务按账号开通范围提供，形态与功能可能随版本演进。</p></section>
      <section><h2>2. 账号与安全</h2><ul>
        <li>账号由平台方开通，你有责任妥善保管登录凭据；凭据下发生的操作视为你的操作。</li>
        <li>发现账号异常（被盗用、越权访问）应尽快通知我们，我们将协助冻结与排查。</li>
        <li>不得转让、出售账号，或以自动化方式绕过平台的访问控制。</li>
      </ul></section>
      <section><h2>3. 使用规范</h2><ul>
        <li>你保证经由平台发送的外联内容合法合规，遵守目标市场的反垃圾邮件法规（如 CAN-SPAM、GDPR 相关要求）。</li>
        <li>不得利用平台发送违法、侵权、欺诈或骚扰性内容；收件人退订请求由平台强制执行，不得规避。</li>
        <li>接入自有发信邮箱或第三方服务时，你应确保对该资源拥有合法使用权。</li>
      </ul></section>
      <section><h2>4. 数据与产出</h2><ul>
        <li>你上传的资料（产品文档、联系人名单等）归你所有；平台仅为提供服务而处理。</li>
        <li>AI 生成的调研报告、画像与邮件草稿供你审阅后使用，其准确性需要你自行判断；平台不对据此做出的商业决策承担责任。</li>
        <li>数据的收集与使用细则见《隐私政策》。</li>
      </ul></section>
      <section><h2>5. 服务变更与中止</h2><p>我们可能因维护、升级或不可抗力临时中断服务，将尽合理努力提前告知。对违反本条款的账号，我们有权限制或终止服务；你可随时申请停用账号并导出属于你的数据。</p></section>
      <section><h2>6. 责任限制</h2><p>在法律允许的范围内，平台就服务提供「现状」担保之外不作其他明示或默示担保；因使用或无法使用服务产生的间接损失，平台的责任以你在争议发生前十二个月内实际支付的费用为限。</p></section>
      <section><h2>7. 条款变更与联系</h2><p>条款更新后将在本页发布并标注日期，重大变更会另行通知；继续使用即视为接受更新。对条款有疑问，请通过产品内渠道或你的对接人联系我们。</p></section>
    </LegalDoc>
  );
}
