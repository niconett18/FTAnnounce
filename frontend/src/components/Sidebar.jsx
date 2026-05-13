import { useState } from "react";
import {
  Hash, ChevronDown, ChevronRight, X, LogOut, Settings, Camera, Save, User,
} from "lucide-react";
import { channelCategories } from "../data/channels";
import { updateAdminProfile } from "../api";
import logo from "../assets/logo.png";

export default function Sidebar({
  activeChannel, onChannelSelect, isOpen, onClose, user, token, onLogout, onProfileUpdate,
}) {
  const [collapsed, setCollapsed] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editRole, setEditRole] = useState(user?.roleTitle || "");
  const [editPicture, setEditPicture] = useState(user?.profilePicture || "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ text: "", type: "" });

  const toggleCategory = (name) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isPersonal = user?.accountType === 'personal';

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg({ text: "", type: "" });
    try {
      const res = await updateAdminProfile({
        displayName: editName.trim(),
        roleTitle: editRole.trim(),
        profilePicture: editPicture.trim() || null,
      }, token);

      onProfileUpdate({
        name: res.user.displayName,
        roleTitle: res.user.roleTitle,
        profilePicture: res.user.profilePicture,
      });
      setSaveMsg({ text: "Profil tersimpan!", type: "success" });
      setTimeout(() => setSaveMsg({ text: "", type: "" }), 2000);
    } catch (err) {
      const msg = err.response?.data?.error || "Gagal menyimpan.";
      setSaveMsg({ text: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => {
    setEditName(user?.name || "");
    setEditRole(user?.roleTitle || "");
    setEditPicture(user?.profilePicture || "");
    setShowSettings(true);
    setSaveMsg({ text: "", type: "" });
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
        {/* Header */}
        <div className="h-[56px] flex items-center justify-between px-4 border-b border-glass shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <h1 className="text-[14px] font-semibold text-primary leading-tight tracking-[-0.01em]">FTAnnounce</h1>
              <span className="text-[10px] text-tertiary font-medium tracking-wide">Fakultas Teknik UI</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-navy-100/60 dark:hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Channel List */}
        {!showSettings && (
          <nav className="flex-1 overflow-y-auto py-2 px-2.5">
            {channelCategories.map((category) => {
              const isCollapsed = collapsed[category.name];
              return (
                <div key={category.name} className="mb-0.5">
                  <button onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center gap-1 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-tertiary hover:text-secondary transition-colors">
                    {isCollapsed ? <ChevronRight size={11} strokeWidth={2.5} /> : <ChevronDown size={11} strokeWidth={2.5} />}
                    {category.name}
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-[1px]">
                      {category.channels.map((channel) => {
                        const isActive = activeChannel === channel.id;
                        return (
                          <button key={channel.id}
                            onClick={() => { onChannelSelect(channel.id); onClose(); }}
                            className={`w-full flex items-center gap-2 px-2 py-[7px] text-[13px] rounded-lg transition-all duration-150 relative group ${
                              isActive
                                ? "text-primary font-medium bg-white/70 dark:bg-navy-600/70 shadow-glass border-glass"
                                : "text-secondary hover:text-primary hover:bg-white/40 dark:hover:bg-white/5"
                            }`}>
                            {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-navy-700 dark:bg-navy-400 rounded-r-full" />}
                            {channel.dotColor ? (
                              <div className="w-[14px] flex justify-center">
                                <span className={`w-2.5 h-2.5 rounded-full ${channel.dotColor}`}></span>
                              </div>
                            ) : (
                              <Hash size={14} strokeWidth={isActive ? 2.2 : 1.8}
                                className={isActive ? "text-primary" : "text-tertiary group-hover:text-secondary"} />
                            )}
                            <span className="truncate flex-1 text-left">{channel.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* Settings Panel (replaces channel list when open) */}
        {showSettings && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold text-primary">Pengaturan Profil</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 text-tertiary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-lg transition-all">
                <X size={14} />
              </button>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-navy-50 border-2 border-navy-200 dark:bg-navy-700 dark:border-navy-600 flex items-center justify-center overflow-hidden">
                {(user?.profilePicture || editPicture) ? (
                  <img src={editPicture || user?.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-navy-400" />
                )}
              </div>
              <p className="text-[12px] font-semibold text-primary">{user?.name}</p>
              <p className="text-[10px] text-tertiary">@{user?.username} • {user?.accountType === 'organization' ? 'Organisasi' : 'Personal'}</p>
            </div>

            {isPersonal ? (
              /* Personal: editable form */
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wider">Nama Tampilan</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg glass-input text-[13px] text-primary focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wider">Peran / Role</label>
                  <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)}
                    placeholder="Contoh: Dosen DTE"
                    className="w-full h-10 px-3 rounded-lg glass-input text-[13px] text-primary placeholder-tertiary focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-tertiary uppercase tracking-wider">URL Foto Profil</label>
                  <input type="text" value={editPicture} onChange={(e) => setEditPicture(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3 rounded-lg glass-input text-[13px] text-primary placeholder-tertiary focus:outline-none" />
                </div>

                {saveMsg.text && (
                  <p className={`text-[11px] font-medium text-center ${saveMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {saveMsg.text}
                  </p>
                )}

                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white rounded-lg text-[13px] font-medium transition-all disabled:opacity-60">
                  <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            ) : (
              /* Organization: display only */
              <div className="space-y-3 pt-2">
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                    <Settings size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-[12px] text-secondary font-medium">Akun Organisasi</p>
                  <p className="text-[11px] text-tertiary mt-1">Profil akun organisasi tidak dapat diubah melalui antarmuka ini. Perubahan hanya bisa dilakukan oleh administrator sistem.</p>
                </div>
              </div>
            )}

            {/* Logout at bottom of settings */}
            <div className="pt-4 border-t border-glass">
              <button onClick={onLogout}
                className="w-full h-10 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-[13px] font-medium transition-all">
                <LogOut size={14} /> Keluar dari Akun
              </button>
            </div>
          </div>
        )}

        {/* Footer (compact admin info) — only when settings is closed */}
        {!showSettings && user?.role === "admin" && (
          <div className="border-t border-glass px-3 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 dark:from-navy-400 dark:to-navy-600 flex items-center justify-center text-[11px] font-semibold text-white shadow-sm shrink-0 overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-primary truncate">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-tertiary truncate">@{user?.username || "admin"}</p>
              </div>
              <button onClick={openSettings} title="Pengaturan Profil"
                className="p-1.5 text-tertiary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-lg transition-all shrink-0">
                <Settings size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
