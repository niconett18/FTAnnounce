import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Hash, Search, SlidersHorizontal, X, Sun, Moon, Plus, Pin, ChevronDown } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import AnnouncementCard from "./AnnouncementCard";
import CreatePostModal from "./CreatePostModal";
import AnnouncementDetailModal from "./AnnouncementDetailModal";
import { channelCategories } from "../data/channels";
import { fetchAnnouncements } from "../api";
import useAppStore from "../store/useAppStore";

const FILTER_OPTIONS = ["Semua", "Darurat", "Penting", "Info"];
const FILTER_MAP = { "Darurat": "darurat", "Penting": "penting", "Info": "info" };

function isPinActive(pinUntil) {
  if (!pinUntil) return false;
  return new Date(pinUntil) > new Date();
}

export default function Feed() {
  const { activeChannel, isDarkMode, setIsDarkMode, user, token } = useAppStore();
  const isAdmin = !!user;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [pinnedCollapsed, setPinnedCollapsed] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const mainRef = useRef(null);
  const { ref: observerTarget, inView } = useInView({ threshold: 0.1 });

  const channelLabel = useMemo(() => {
    for (const cat of channelCategories) {
      const ch = cat.channels.find((c) => c.id === activeChannel);
      if (ch) return ch.label;
    }
    return activeChannel;
  }, [activeChannel]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading, isError,
    refetch
  } = useInfiniteQuery({
    queryKey: ["announcements", activeChannel],
    queryFn: ({ pageParam = null }) => fetchAnnouncements(activeChannel, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextTimestamp || undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allAnnouncements = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.announcements);
  }, [data]);

  const { pinnedAnnouncements, regularAnnouncements } = useMemo(() => {
    let items = allAnnouncements;

    if (activeFilter !== "Semua") {
      const backendKey = FILTER_MAP[activeFilter];
      items = items.filter((a) => a.priority === backendKey);
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

    const pinned = items.filter((a) => isPinActive(a.pinUntil));
    const regular = items.filter((a) => !isPinActive(a.pinUntil));

    return { pinnedAnnouncements: pinned, regularAnnouncements: regular };
  }, [allAnnouncements, activeFilter, searchQuery]);

  const totalCount = pinnedAnnouncements.length + regularAnnouncements.length;

  const handleScroll = useCallback(() => {
    if (mainRef.current) {
      setPinnedCollapsed(mainRef.current.scrollTop > 80);
    }
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [activeChannel]);

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePostSuccess = () => {
    setShowPostModal(false);
    refetch(); // Invalidate or refetch current channel data to get the fresh post
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      <header className="sticky top-0 z-20 glass-strong border-b border-glass">
        <div className="flex items-center justify-between h-[56px] px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <Hash size={17} strokeWidth={2} className="text-navy-400 dark:text-navy-300" />
            <h2 className="text-[15px] font-semibold text-primary tracking-[-0.01em] truncate">
              {channelLabel}
            </h2>
            <span className="hidden sm:inline-flex items-center h-5 px-2 text-[11px] text-tertiary bg-navy-100/50 dark:bg-navy-700/50 rounded-full font-medium tabular-nums">
              {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative hidden sm:block">
              <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <input type="text" placeholder="Cari pengumuman..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-52 h-8 pl-8 pr-8 text-[12px] rounded-lg glass-input text-primary placeholder-tertiary focus:outline-none transition-all" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors">
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>

            <button onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-secondary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-full apple-spring active:scale-90"
              title="Toggle Theme">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all duration-150 ${showFilters ? "bg-navy-700 dark:bg-navy-500 text-white shadow-glass" : "text-tertiary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10"}`}>
              <SlidersHorizontal size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col px-4 md:px-6 pb-3">
            <div className="sm:hidden relative mb-3">
              <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <input type="text" placeholder="Cari..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-[12px] rounded-lg glass-input text-primary placeholder-tertiary focus:outline-none transition-all" />
            </div>
            <div className="flex p-1 bg-black/5 dark:bg-white/10 rounded-xl w-full max-w-sm apple-spring">
              {FILTER_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => setActiveFilter(opt)}
                  className={`flex-1 text-[11px] font-semibold py-1.5 rounded-[8px] apple-spring ${activeFilter === opt ? "bg-white dark:bg-navy-700 shadow-sm text-primary" : "text-tertiary hover:text-secondary"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main ref={mainRef} className="flex-1 overflow-y-auto w-full pb-20">
        {isAdmin && (
          <div className="w-full flex justify-center py-4 border-b border-glass bg-navy-50/50 dark:bg-navy-900/30">
            <button
              onClick={() => setShowPostModal(true)}
              className="group flex flex-col items-center gap-2 p-6 w-full max-w-sm border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-2xl hover:border-navy-400 dark:hover:border-navy-500 hover:bg-white/50 dark:hover:bg-navy-800/50 transition-all text-secondary hover:text-primary active:scale-95"
            >
              <div className="h-12 w-12 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center group-hover:bg-navy-200 dark:group-hover:bg-navy-700 transition-colors">
                <Plus size={24} />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold">Buat Pengumuman Baru</p>
                <p className="text-[11px] text-tertiary mt-1">Masukkan informasi ke channel {channelLabel}</p>
              </div>
            </button>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-3">
          {pinnedAnnouncements.length > 0 && (
            <div className="sticky top-0 z-10">
              {pinnedCollapsed ? (
                <div className="glass-strong rounded-2xl border border-glass shadow-sm p-1 mb-2 cursor-pointer" onClick={scrollToTop}>
                  <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-navy-500 dark:text-navy-400 font-semibold">
                    <Pin size={11} />
                    <span>Disematkan ({pinnedAnnouncements.length})</span>
                    <ChevronDown size={11} className="ml-auto" />
                  </div>
                  {pinnedAnnouncements.map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} compact={true} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {pinnedAnnouncements.map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} onClick={() => setSelectedAnnouncement(a)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {isError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-[14px] font-medium text-red-500 mb-1">Gagal memuat pengumuman</p>
              <p className="text-[12px] text-tertiary">Server backend tidak dapat dihubungi. Coba lagi nanti.</p>
            </div>
          ) : isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-[24px] p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-navy-100 dark:bg-navy-700" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-navy-100 dark:bg-navy-700 rounded w-1/3" />
                    <div className="h-2 bg-navy-100 dark:bg-navy-700 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-4 bg-navy-100 dark:bg-navy-700 rounded w-2/3 mb-2" />
                <div className="h-3 bg-navy-100 dark:bg-navy-700 rounded w-full mb-1" />
                <div className="h-3 bg-navy-100 dark:bg-navy-700 rounded w-4/5" />
              </div>
            ))
          ) : regularAnnouncements.length > 0 ? (
            regularAnnouncements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} onClick={() => setSelectedAnnouncement(a)} />
            ))
          ) : pinnedAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
                <Search size={22} strokeWidth={1.5} className="text-tertiary" />
              </div>
              <p className="text-[14px] font-medium text-secondary mb-1">Tidak ada pengumuman</p>
              <p className="text-[12px] text-tertiary max-w-xs">
                {searchQuery ? `Tidak ditemukan hasil untuk "${searchQuery}"` : "Belum ada pengumuman di channel ini."}
              </p>
            </div>
          ) : null}

          <div ref={observerTarget} className="h-10 flex items-center justify-center mt-2">
            {isFetchingNextPage && <div className="w-5 h-5 rounded-full border-2 border-navy-500 border-t-transparent animate-spin"></div>}
            {!hasNextPage && !isLoading && allAnnouncements.length > 0 && <span className="text-[11px] text-tertiary font-medium">Batas akhir pengumuman</span>}
          </div>
        </div>
      </main>

      {isAdmin && (
        <button onClick={() => setShowPostModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-navy-700 hover:bg-navy-800 dark:bg-navy-500 dark:hover:bg-navy-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 z-30 hover:shadow-xl"
          title="Buat Pengumuman Baru">
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}

      {selectedAnnouncement && (
        <AnnouncementDetailModal 
          announcement={selectedAnnouncement} 
          onClose={() => setSelectedAnnouncement(null)} 
        />
      )}

      {showPostModal && (
        <CreatePostModal
          channelId={activeChannel}
          user={user}
          token={token}
          onClose={() => setShowPostModal(false)}
          onPostSuccess={handlePostSuccess}
        />
      )}
    </div>
  );
}



