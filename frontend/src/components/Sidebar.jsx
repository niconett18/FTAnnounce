import { useState } from "react";
import {
  Hash,
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
  Lock,
} from "lucide-react";
import { channelCategories } from "../data/channels";
import logo from "../assets/logo.png";

function getUnreadCount(channelId, announcementsData) {
  if (!announcementsData) return 0;
  const items = announcementsData[channelId] || [];
  return items.filter((a) => !a?.isRead).length;
}

function formatBadge(count) {
  if (count <= 0) return null;
  return count > 9 ? "9+" : String(count);
}

export default function Sidebar({
  activeChannel,
  onChannelSelect,
  isOpen,
  onClose,
  announcements,
  user,
  onLogout,
  onNavigateToLogin,
}) {
  const [collapsed, setCollapsed] = useState({});

  const toggleCategory = (name) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md z-30 lg:hidden apple-spring ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-white/70 dark:bg-navy-900/70 backdrop-blur-[24px] backdrop-saturate-[180%] border-r border-glass lg:static lg:translate-x-0 flex flex-col apple-spring ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-[56px] flex items-center justify-between px-4 border-b border-glass">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <h1 className="text-[14px] font-semibold text-primary leading-tight tracking-[-0.01em]">
                FTAnnounce
              </h1>
              <span className="text-[10px] text-tertiary font-medium tracking-wide">
                Fakultas Teknik UI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-navy-100/60 dark:hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2.5">
          {channelCategories.map((category) => {
            const isCollapsed = collapsed[category.name];
            return (
              <div key={category.name} className="mb-0.5">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center gap-1 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-tertiary hover:text-secondary transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight size={11} strokeWidth={2.5} />
                  ) : (
                    <ChevronDown size={11} strokeWidth={2.5} />
                  )}
                  {category.name}
                </button>

                {!isCollapsed && (
                  <div className="space-y-[1px]">
                    {category.channels.map((channel) => {
                      const isActive = activeChannel === channel.id;
                      const unread = getUnreadCount(channel.id, announcements);
                      const badge = formatBadge(unread);
                      return (
                        <button
                          key={channel.id}
                          onClick={() => {
                            onChannelSelect(channel.id);
                            onClose();
                          }}
                          className={`
                            w-full flex items-center gap-2 px-2 py-[7px] text-[13px] rounded-lg transition-all duration-150 relative group
                            ${
                              isActive
                                ? "text-primary font-medium bg-white/70 dark:bg-navy-600/70 shadow-glass border-glass"
                                : "text-secondary hover:text-primary hover:bg-white/40 dark:hover:bg-white/5"
                            }
                          `}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-navy-700 dark:bg-navy-400 rounded-r-full" />
                          )}
                          {channel.dotColor ? (
                            <div className="w-[14px] flex justify-center">
                              <span className={`w-2.5 h-2.5 rounded-full ${channel.dotColor}`}></span>
                            </div>
                          ) : (
                            <Hash
                              size={14}
                              strokeWidth={isActive ? 2.2 : 1.8}
                              className={
                                isActive
                                  ? "text-primary"
                                  : "text-tertiary group-hover:text-secondary"
                              }
                            />
                          )}
                          <span className="truncate flex-1 text-left">{channel.label}</span>
                          {badge && (
                            <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                              {badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-glass px-3 py-3">
          {user?.role === "admin" ? (
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-red-500/10 dark:hover:bg-red-500/20 group transition-all cursor-pointer text-left"
              title="Keluar"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 dark:from-navy-400 dark:to-navy-600 flex items-center justify-center text-[11px] font-semibold text-white shadow-sm group-hover:hidden">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 hidden group-hover:flex items-center justify-center shadow-sm">
                <LogOut size={14} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-primary truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[10px] text-tertiary truncate">
                  Administrator
                </p>
              </div>
            </button>
          ) : (
            <button 
              onClick={onNavigateToLogin}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-navy-50/50 dark:hover:bg-white/5 transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-800 border border-glass flex items-center justify-center shadow-sm">
                <Lock size={14} className="text-navy-500 dark:text-navy-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-primary truncate">
                  Admin Access
                </p>
                <p className="text-[10px] text-tertiary truncate">
                  Masuk sebagai admin
                </p>
              </div>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
