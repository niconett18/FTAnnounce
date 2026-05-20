import { useState } from "react";
import { Hash, ChevronDown, ChevronRight, X, Settings, Save, User } from "lucide-react";
import toast from "react-hot-toast";
import { channelCategories } from "../data/channels";
import { updateAdminProfile } from "../api";
import useAppStore from "../store/useAppStore";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const { activeChannel, setActiveChannel, sidebarOpen, setSidebarOpen, user, setUser, token } = useAppStore();
  
  const [collapsed, setCollapsed] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editRole, setEditRole] = useState(user?.roleTitle || "");
  const [editPicture, setEditPicture] = useState(user?.profilePicture || "");
  const [saving, setSaving] = useState(false);

  const toggleCategory = (name) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isPersonal = user?.accountType === "personal";

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateAdminProfile({
        displayName: editName.trim(),
        roleTitle: editRole.trim(),
        profilePicture: editPicture.trim() || null,
      }, token);

      setUser({
        ...user,
        name: res.user.displayName,
        roleTitle: res.user.roleTitle,
        profilePicture: res.user.profilePicture,
      });
      toast.success("Profil berhasil disimpan!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => {
    setEditName(user?.name || "");
    setEditRole(user?.roleTitle || "");
    setEditPicture(user?.profilePicture || "");
    setShowSettings(true);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className={`fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md z-30 lg:hidden apple-spring ${
            sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-white/70 dark:bg-navy-900/70 backdrop-blur-[24px] backdrop-saturate-[180%] border-r border-glass lg:static lg:translate-x-0 flex flex-col apple-spring ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-[56px] flex items-center justify-between px-4 border-b border-glass shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <h1 className="text-[14px] font-semibold text-primary leading-tight tracking-[-0.01em]">FTAnnounce</h1>
              <span className="text-[10px] text-tertiary font-medium tracking-wide">Fakultas Teknik UI</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-navy-100/60 dark:hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

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
                            onClick={() => { setActiveChannel(channel.id); setSidebarOpen(false); }}
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

        {showSettings && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold text-primary">Pengaturan Profil</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 text-tertiary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-lg transition-all">
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-navy-50 border-2 border-navy-200 dark:bg-navy-700 dark:border-navy-600 flex items-center justify-center overflow-hidden">
                {(user?.profilePicture || editPicture) ? (
                  <img src={editPicture || user?.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-navy-400" />
                )}
              </div>
              <p className="text-[12px] font-semibold text-primary">{user?.name}</p>
              <p className="text-[10px] text-tertiary">@{user?.username} � {user?.accountType === "organization" ? "Organisasi" : "Personal"}</p>
            </div>

            {isPersonal ? (
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
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white rounded-lg text-[13px] font-medium transition-all disabled:opacity-60 mt-4">
                  <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            ) : (
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
          </div>
        )}
        
        {!user && !showSettings && (
          <div className="p-4 border-t border-glass">
             <button onClick={() => window.location.href="/loginAdmin"} className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-secondary hover:text-primary transition-colors">
               <User size={14} /> Login Admin
             </button>
          </div>
        )}
        {user && !showSettings && (
           <div className="p-4 border-t border-glass">
            <button onClick={openSettings} className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-secondary hover:text-primary transition-colors">
              <Settings size={14} /> Pengaturan Profil
            </button>
           </div>
        )}
      </aside>
    </>
  );
}

