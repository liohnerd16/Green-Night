import { useState } from "react";
import { CheckCircle2, Clock, Rocket, Bug, Sparkles, Wrench, CalendarDays } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useT, useLanguage } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

const changelogData = [
  {
    id: "1",
    date: { vi: "2026-03-06", en: "2026-03-06" },
    title: { vi: "Ra mắt phiên bản đầu tiên", en: "First version released" },
    description: {
      vi: "Website tổng hợp công cụ nghiên cứu khoa học với 3 chế độ hiển thị, tìm kiếm/lọc, chế độ sáng/tối, đánh giá, vote, yêu thích và chia sẻ link.",
      en: "Scientific research tools website with 3 display modes, search/filter, light/dark mode, ratings, votes, favorites and link sharing.",
    },
    status: "done",
    type: "feature",
    version: "1.0",
  },
  {
    id: "2",
    date: { vi: "2026-03-06", en: "2026-03-06" },
    title: { vi: "Quảng cáo interstitial khi sao chép link", en: "Interstitial ad on link copy" },
    description: {
      vi: "Hiển thị quảng cáo 10 giây trước khi link được sao chép. Loại bỏ các đường link trực tiếp đến website.",
      en: "Shows a 10-second ad before link is copied. Removed direct links to websites.",
    },
    status: "done",
    type: "feature",
    version: "1.1",
  },
  {
    id: "3",
    date: { vi: "2026-03-06", en: "2026-03-06" },
    title: { vi: "Trang nhật ký cập nhật & lộ trình", en: "Changelog & roadmap page" },
    description: {
      vi: "Tách riêng trang nhật ký cập nhật với hiệu ứng chuyển trang mượt mà.",
      en: "Separate changelog page with smooth page transitions.",
    },
    status: "done",
    type: "feature",
    version: "1.2",
  },
  {
    id: "4",
    date: { vi: "Sắp tới", en: "Coming soon" },
    title: { vi: "Hệ thống tài khoản người dùng", en: "User account system" },
    description: {
      vi: "Đăng ký / đăng nhập để lưu yêu thích và đánh giá theo tài khoản cá nhân.",
      en: "Sign up / login to save favorites and ratings per personal account.",
    },
    status: "planned",
    type: "feature",
  },
  {
    id: "5",
    date: { vi: "Sắp tới", en: "Coming soon" },
    title: { vi: "Bình luận & thảo luận", en: "Comments & discussions" },
    description: {
      vi: "Cho phép người dùng bình luận và trao đổi về từng website trong danh sách.",
      en: "Allow users to comment and discuss each website in the list.",
    },
    status: "planned",
    type: "feature",
  },
  {
    id: "6",
    date: { vi: "Sắp tới", en: "Coming soon" },
    title: { vi: "Đề xuất website từ cộng đồng", en: "Community website suggestions" },
    description: {
      vi: "Người dùng có thể gửi đề xuất thêm website mới, admin duyệt và công khai.",
      en: "Users can suggest new websites, admin reviews and publishes.",
    },
    status: "planned",
    type: "feature",
  },
  {
    id: "7",
    date: { vi: "Sắp tới", en: "Coming soon" },
    title: { vi: "Tối ưu hiệu suất & SEO", en: "Performance & SEO optimization" },
    description: {
      vi: "Cải thiện tốc độ tải trang, lazy loading, và tối ưu SEO cho các công cụ tìm kiếm.",
      en: "Improve page load speed, lazy loading, and SEO optimization for search engines.",
    },
    status: "planned",
    type: "improvement",
  },
];

export function Changelog() {
  const t = useT();
  const { lang } = useLanguage();
  const [filter, setFilter] = useState("all");

  const statusConfig = {
    done: { label: t(tr.changelog.done), icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
    "in-progress": { label: t(tr.changelog.inProgress), icon: Wrench, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    planned: { label: t(tr.changelog.planned), icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  };

  const typeConfig = {
    feature: { label: t(tr.changelog.feature), icon: Sparkles, color: "text-purple-600 dark:text-purple-400" },
    fix: { label: t(tr.changelog.fix), icon: Bug, color: "text-red-600 dark:text-red-400" },
    improvement: { label: t(tr.changelog.improvement), icon: Rocket, color: "text-orange-600 dark:text-orange-400" },
  };

  const filtered = filter === "all" ? changelogData : changelogData.filter((e) => e.status === filter);
  const doneCount = changelogData.filter((e) => e.status === "done").length;
  const inProgressCount = changelogData.filter((e) => e.status === "in-progress").length;
  const plannedCount = changelogData.filter((e) => e.status === "planned").length;

  const summaryFn = tr.changelog.summary[lang];
  const summaryText = typeof summaryFn === "function" ? summaryFn(doneCount, inProgressCount, plannedCount) : "";

  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{t(tr.changelog.title)}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{summaryText}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "all", label: t(tr.common.all), count: changelogData.length },
          { key: "done", label: t(tr.changelog.done), count: doneCount },
          { key: "in-progress", label: t(tr.changelog.inProgress), count: inProgressCount },
          { key: "planned", label: t(tr.changelog.planned), count: plannedCount },
        ]).map((tab) => (
          <Button key={tab.key} variant={filter === tab.key ? "default" : "outline"} size="sm" onClick={() => setFilter(tab.key)} className="text-xs">
            {tab.label}<span className="ml-1.5 opacity-70">{tab.count}</span>
          </Button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-0">
          {filtered.map((entry) => {
            const status = statusConfig[entry.status];
            const type = typeConfig[entry.type];
            const StatusIcon = status.icon;
            const TypeIcon = type.icon;
            return (
              <div key={entry.id} className="relative flex gap-4 pb-7 last:pb-0">
                <div className={`relative z-10 flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-full border-2 border-white dark:border-gray-950 ${status.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5 p-4 -mt-1 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{entry.title[lang]}</h3>
                    {entry.version && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">v{entry.version}</Badge>}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{entry.description[lang]}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-500">
                      <CalendarDays className="h-3 w-3" />{entry.date[lang]}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] ${type.color}`}>
                      <TypeIcon className="h-3 w-3" />{type.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />{status.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">{t(tr.changelog.noItems)}</p>
      )}
    </section>
  );
}