import {
  Eye,
  EyeOff,
  Check,
  Paperclip,
  AlertTriangle,
  Info,
  Bell,
} from "lucide-react";

const priorityConfig = {
  urgent: {
    label: "Urgent",
    className:
      "bg-white dark:bg-navy-800 text-primary border-glass shadow-sm",
    icon: AlertTriangle,
  },
  penting: {
    label: "Penting",
    className:
      "bg-white dark:bg-navy-800 text-primary border-glass shadow-sm",
    icon: Bell,
  },
  info: {
    label: "Info",
    className:
      "bg-white dark:bg-navy-800 text-secondary border-glass shadow-sm",
    icon: Info,
  },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Baru saja";
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnnouncementCard({ announcement }) {
  const {
    author,
    role,
    date,
    priority,
    title,
    content,
    isRead,
    attachments,
  } = announcement;

  const badge = priorityConfig[priority];
  const BadgeIcon = badge.icon;

  return (
    <article className="glass-card rounded-[24px] p-5 cursor-pointer active:scale-[0.98] apple-spring hover:shadow-lg animate-slide-up group">
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-navy-50 border border-navy-200 text-navy-700 dark:bg-navy-700 dark:border-navy-600 dark:text-white flex items-center justify-center text-[11px] font-bold shrink-0">
            {author
              .split(" ")
              .filter((w) => w.length > 2 && w[0] === w[0].toUpperCase())
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-primary truncate">
              {author}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-tertiary">
              <span className="text-secondary font-medium">{role}</span>
              <span className="opacity-40">·</span>
              <span title={new Date(date).toLocaleString("id-ID")}>
                {formatDate(date)}, {formatTime(date)}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-[4px] text-[10px] font-semibold uppercase tracking-[0.04em] rounded-full border shrink-0 ${badge.className}`}
        >
          <BadgeIcon size={12} strokeWidth={2} />
          {badge.label}
        </span>
      </div>

      <h3 className="text-[15px] font-semibold text-primary mb-1.5 leading-snug tracking-[-0.01em]">
        {title}
      </h3>

      <p className="text-[13px] text-secondary leading-[1.65] mb-4">
        {content}
      </p>

      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {attachments.map((file, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-secondary bg-white border border-glass hover:bg-navy-50 dark:bg-navy-800 dark:hover:bg-navy-700 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Paperclip size={11} strokeWidth={2} />
              {file}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end pt-3 border-t border-navy-100/60 dark:border-white/10">
        {isRead ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
            <Check size={13} strokeWidth={2.5} />
            Dibaca
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-tertiary">
            <EyeOff size={13} strokeWidth={1.8} />
            Belum dibaca
          </span>
        )}
      </div>
    </article>
  );
}
