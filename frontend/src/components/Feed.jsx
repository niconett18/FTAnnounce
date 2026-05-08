import { useState, useMemo } from "react";
import { Hash, Search, SlidersHorizontal, X, Sun, Moon } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import { channelCategories } from "../data/channels";

const FILTER_OPTIONS = ["Semua", "Urgent", "Penting", "Info"];

export default function Feed({ activeChannel, isDarkMode, toggleDarkMode, announcements }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false);

  const channelLabel = useMemo(() => {
    for (const cat of channelCategories) {
      const ch = cat.channels.find((c) => c.id === activeChannel);
      if (ch) return ch.label;
    }
    return activeChannel;
  }, [activeChannel]);

  const filteredAnnouncements = useMemo(() => {
    let items = announcements[activeChannel] || [];

    if (activeFilter !== "Semua") {
      items = items.filter(
        (a) => a.priority === activeFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activeChannel, activeFilter, searchQuery, announcements]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <header className="sticky top-0 z-20 glass-strong border-b border-glass">
        <div className="flex items-center justify-between h-[56px] px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <Hash size={17} strokeWidth={2} className="text-navy-400 dark:text-navy-300" />
            <h2 className="text-[15px] font-semibold text-primary tracking-[-0.01em] truncate">
              {channelLabel}
            </h2>
            <span className="hidden sm:inline-flex items-center h-5 px-2 text-[11px] text-tertiary bg-navy-100/50 dark:bg-navy-700/50 rounded-full font-medium tabular-nums">
              {filteredAnnouncements.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative hidden sm:block">
              <Search
                size={14}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
              />
              <input
                type="text"
                placeholder="Cari pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-52 h-8 pl-8 pr-8 text-[12px] rounded-lg glass-input text-primary placeholder-tertiary focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-secondary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-full apple-spring active:scale-90"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all duration-150 ${
                showFilters
                  ? "bg-navy-700 dark:bg-navy-500 text-white shadow-glass"
                  : "text-tertiary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col px-4 md:px-6 pb-3">
            <div className="sm:hidden relative mb-3">
              <Search
                size={14}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
              />
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-[12px] rounded-lg glass-input text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>
            <div className="flex p-1 bg-black/5 dark:bg-white/10 rounded-xl w-full max-w-sm apple-spring">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`flex-1 text-[11px] font-semibold py-1.5 rounded-[8px] apple-spring ${
                    activeFilter === opt
                      ? "bg-white dark:bg-navy-700 shadow-sm text-primary"
                      : "text-tertiary hover:text-secondary"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-3">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
                <Search size={22} strokeWidth={1.5} className="text-tertiary" />
              </div>
              <p className="text-[14px] font-medium text-secondary mb-1">
                Tidak ada pengumuman
              </p>
              <p className="text-[12px] text-tertiary max-w-xs">
                {searchQuery
                  ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                  : "Belum ada pengumuman di channel ini."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
