import { useState } from "react";
import {
  Paperclip,
  AlertTriangle,
  Info,
  Bell,
  Pin,
  Eye,
  CheckCircle2
} from "lucide-react";
import useAppStore from "../store/useAppStore";
import { markAsRead, getReaderId } from "../api";

const priorityConfig = {
  darurat: {
    label: "Darurat",
    className: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: AlertTriangle,
  },
  penting: {
    label: "Penting",
    className: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: Bell,
  },
  info: {
    label: "Informasi",
    className: "text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800",
    icon: Info,
  },
};

function formatAbsoluteDate(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function isPinActive(pinUntil) {
  if (!pinUntil) return false;
  return new Date(pinUntil) > new Date();
}

export default function AnnouncementCard({ announcement, compact = false, onClick, onRead }) {
  const { user } = useAppStore();
  const isAdmin = !!user;

  const [hasRead, setHasRead] = useState(() => {
    if (isAdmin) return false;
    try {
      const stored = JSON.parse(localStorage.getItem('ftannounce_reads') || '[]');
      return stored.includes(announcement.id);
    } catch { return false; }
  });
  const [readCount, setReadCount] = useState(announcement.readCount || 0);

  const {
    author,
    authorRole,
    authorAccountType,
    date,
    priority,
    title,
    content,
    attachments,
    pinUntil,
  } = announcement;

  const pinned = isPinActive(pinUntil);
  const badge = priorityConfig[priority] || priorityConfig.info;
  const BadgeIcon = badge.icon;

  // Mode compact: hanya judul + pin icon (untuk collapsed pinned section)
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer hover:bg-navy-100/50 dark:hover:bg-white/5 rounded-lg transition-all">
        <Pin size={12} className="text-navy-500 dark:text-navy-400 shrink-0" />
        <span className="text-primary font-medium truncate">{title}</span>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
      </div>
    );
  }

  return (
    <article onClick={onClick} className={`bg-white dark:bg-navy-800 rounded-xl p-5 border border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 hover:shadow-md active:scale-[0.99] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${onClick ? "cursor-pointer" : ""} ${pinned ? "border-l-4 border-l-navy-500 dark:border-l-navy-400" : ""}`}>
      {/* Pin indicator */}
      {pinned && (
        <div className="flex items-center gap-1.5 mb-3 text-[11px] text-navy-500 dark:text-navy-400 font-semibold">
          <Pin size={12} />
          Disematkan
        </div>
      )}

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
            {/* Personal account: tampilkan role di bawah nama */}
            {authorAccountType === 'personal' && authorRole && (
              <p className="text-[11px] text-tertiary truncate">{authorRole}</p>
            )}
            <p className="text-[11px] text-tertiary">
              {formatAbsoluteDate(date)}
            </p>
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
        <div className="flex flex-wrap gap-1.5">
          {attachments.map((file, i) => {
            const isUrl = file.startsWith('http://') || file.startsWith('https://');
            const chipClass = "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-secondary bg-white border border-glass dark:bg-navy-800 rounded-lg shadow-sm";
            return isUrl ? (
              <a
                key={i}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className={`${chipClass} hover:bg-navy-50 dark:hover:bg-navy-700 hover:text-navy-600 dark:hover:text-navy-300 transition-all cursor-pointer`}
              >
                <Paperclip size={11} strokeWidth={2} />
                {file.split('/').pop() || file}
              </a>
            ) : (
              <span key={i} className={chipClass}>
                <Paperclip size={11} strokeWidth={2} />
                {file}
              </span>
            );
          })}
        </div>
      )}
      {/* --- PASTE KODE INI DI SINI (TEPAT DI BAWAH ATTACHMENT DAN DI ATAS </article>) --- */}
      {!compact && (priority === 'darurat' || priority === 'penting') && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          {isAdmin ? (
            <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
              <Eye size={14} />
              <span>Dibaca oleh {readCount} Mahasiswa</span>
            </div>
          ) : (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (hasRead) return;
                setHasRead(true);
                try {
                  const readerId = getReaderId();
                  const result = await markAsRead(announcement.id, readerId);
                  setReadCount(result.readCount);
                  const stored = JSON.parse(localStorage.getItem('ftannounce_reads') || '[]');
                  stored.push(announcement.id);
                  localStorage.setItem('ftannounce_reads', JSON.stringify(stored));
                  if (onRead) onRead();
                } catch (err) {
                  setHasRead(false);
                }
              }}
              disabled={hasRead}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                hasRead
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              <CheckCircle2 size={14} />
              {hasRead ? 'Telah Dibaca' : 'Tandai Telah Dibaca'}
            </button>
          )}
        </div>
      )}
      {/* -------------------------------------------------------------------------------- */}
    </article>
  );
}


