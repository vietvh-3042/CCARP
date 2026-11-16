import type { Locale } from "../i18n";

export const domains = [
  { en: "Solution Design & Architecture", vi: "Thiết kế giải pháp & kiến trúc" },
  { en: "Claude Models, Prompting & Context Engineering", vi: "Mô hình Claude, câu lệnh & kỹ thuật ngữ cảnh" },
  { en: "Integration", vi: "Tích hợp" },
  { en: "Evaluation, Testing & Optimization", vi: "Đánh giá, kiểm thử & tối ưu" },
  { en: "Governance, Safety & Risk Management", vi: "Quản trị, an toàn & quản lý rủi ro" },
  { en: "Stakeholder Communication & Lifecycle Management", vi: "Giao tiếp với các bên liên quan & quản lý vòng đời" },
  { en: "Developer Productivity & Operational Enablement", vi: "Năng suất lập trình & hỗ trợ vận hành" },
];

export const domainLabel = (domain: number, locale: Locale) => domains[domain - 1]?.[locale] ?? "";
