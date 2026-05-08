import { useState } from "react";
import { LogOut, Send, PlusCircle, AlertTriangle, Info, Bell, Check } from "lucide-react";
import { channelCategories } from "../data/channels";

export default function Admin({ onLogout, onAddAnnouncement }) {
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const channelId = fd.get("channelId");
    
    const newAnnouncement = {
      id: Date.now(),
      author: "Admin FT",
      role: "Administrator",
      date: new Date().toISOString(),
      priority: fd.get("priority"),
      title: fd.get("title"),
      content: fd.get("content"),
      readBy: 0,
      totalStudents: 300, // Dummy max
      isRead: false,
      attachments: fd.get("attachments") ? [fd.get("attachments")] : [],
    };

    onAddAnnouncement(channelId, newAnnouncement);
    setSuccessMsg(true);
    e.target.reset();
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] dark:bg-navy-900 transition-colors duration-300 pb-10">
      <header className="sticky top-0 z-20 glass-strong border-b border-glass h-16 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center shadow-glass">
            <PlusCircle size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-primary">Admin Dashboard</h1>
            <p className="text-[11px] text-tertiary">FTAnnounce Control Panel</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-10 shadow-glass">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-2">Buat Pengumuman Baru</h2>
            <p className="text-sm text-secondary">Silakan isi form di bawah ini untuk mendistribusikan informasi ke channel yang dituju.</p>
          </div>

          {successMsg && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 rounded-xl text-sm font-medium">
              <Check size={18} />
              Pengumuman berhasil dipublikasikan!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-primary ml-1">Kategori Channel</label>
                <select name="channelId" defaultValue="" required className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary appearance-none focus:outline-none transition-all cursor-pointer">
                  <option value="" disabled className="text-tertiary dark:bg-navy-800">Pilih Channel Tujuan...</option>
                  {channelCategories.map((cat) => (
                    <optgroup label={cat.name} key={cat.name} className="dark:bg-navy-800 text-navy-500 dark:text-navy-300 font-semibold">
                      {cat.channels.map(ch => (
                        <option value={ch.id} key={ch.id} className="text-primary">{ch.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-primary ml-1">Prioritas</label>
                <select name="priority" required className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary appearance-none focus:outline-none transition-all cursor-pointer">
                  <option value="info" className="dark:bg-navy-800">Info (Abu-abu)</option>
                  <option value="penting" className="dark:bg-navy-800">Penting (Kuning)</option>
                  <option value="urgent" className="dark:bg-navy-800">Urgent (Merah)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-primary ml-1">Judul Pengumuman</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Tuliskan judul pengumuman dengan jelas..."
                className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-primary ml-1">Isi Pengumuman</label>
              <textarea
                name="content"
                required
                rows="6"
                placeholder="Tuliskan detail pengumuman di sini..."
                className="w-full p-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-primary ml-1">Lampiran (Opsional)</label>
              <input
                type="text"
                name="attachments"
                placeholder="Nama file lampiran (contoh: Panduan_PDF.pdf)"
                className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>

            <div className="pt-4 border-t border-glass">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 h-12 flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white rounded-xl font-medium transition-all shadow-sm active:scale-[0.98] ml-auto"
              >
                <Send size={16} /> Publikasikan Pengumuman
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
