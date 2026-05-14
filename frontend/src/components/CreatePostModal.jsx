import { useState } from "react";
import { X, Hash, Send, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { channelCategories } from "../data/channels";
import { createAnnouncement } from "../api";
import AnnouncementCard from "./AnnouncementCard";

const PRIORITY_OPTIONS = [
  { value: "info", label: "Informasi Biasa" },
  { value: "penting", label: "Penting (Wajib Baca)" },
  { value: "darurat", label: "Darurat" },
];

const PIN_OPTIONS = [
  { value: "none", label: "Tidak disematkan" },
  { value: "1day", label: "Sematkan 1 hari" },
  { value: "1week", label: "Sematkan 1 minggu" },
  { value: "1month", label: "Sematkan 1 bulan" },
];

function getChannelLabel(channelId) {
  for (const cat of channelCategories) {
    const ch = cat.channels.find((c) => c.id === channelId);
    if (ch) return ch.label;
  }
  return channelId;
}

export default function CreatePostModal({ channelId, user, token, onClose, onPostSuccess }) {
  const [step, setStep] = useState("form");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("info");
  const [pinDuration, setPinDuration] = useState("none");
  const [attachmentsRaw, setAttachmentsRaw] = useState("");
  const [error, setError] = useState("");

  const parsedAttachments = attachmentsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const previewData = {
    id: "preview",
    author: user?.name || "Admin",
    authorRole: user?.roleTitle || null,
    authorAccountType: user?.accountType || null,
    date: new Date().toISOString(),
    priority,
    title: title || "(Judul kosong)",
    content: content || "(Konten kosong)",
    attachments: parsedAttachments,
    pinUntil: pinDuration !== "none" ? new Date(new Date().getTime() + 86400000).toISOString() : null,
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Judul dan konten wajib diisi.");
      return;
    }
    setError("");
    setStep("preview");
  };

  const handleConfirmPost = async () => {
    setStep("posting");
    setError("");
    try {
      const result = await createAnnouncement(
        {
          channelId,
          title,
          content,
          priority,
          pinDuration,
          attachments: parsedAttachments,
        },
        token
      );
      toast.success("Pengumuman berhasil diposting!");
      setStep("success");
      setTimeout(() => {
        onPostSuccess(channelId, result.announcement);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Terjadi kesalahan saat memposting.");
      toast.error("Terjadi kesalahan saat memposting.");
      setStep("preview");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-900 w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden border border-glass flex flex-col max-h-full animate-in zoom-in-95 duration-200 apple-spring">
        <div className="flex items-center justify-between px-6 py-4 border-b border-glass shrink-0">
          <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
            {step === "form" && "Buat Pengumuman"}
            {step === "preview" && "Pratinjau Pengumuman"}
            {step === "posting" && "Memposting..."}
            {step === "success" && "Berhasil!"}
          </h2>
          <button onClick={onClose} disabled={step === "posting"}
            className="p-2 text-tertiary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-full transition-all disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {step === "form" && (
            <form id="post-form" onSubmit={handlePreview} className="space-y-5">
              <div className="flex px-4 py-3 bg-navy-50 dark:bg-navy-800 rounded-xl border border-navy-100 dark:border-navy-700">
                <div>
                  <p className="text-[12px] font-semibold text-primary">Channel Tujuan</p>
                  <p className="text-[14px] text-primary flex items-center gap-1 mt-1">
                    <Hash size={16} className="text-navy-400" />
                    {getChannelLabel(channelId)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-primary mb-1.5 flex justify-between">
                  Judul <span className="text-tertiary font-normal">{title.length}/100</span>
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                  placeholder="Singkat dan jelas..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-navy-200 dark:focus:ring-navy-700 transition-all font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-primary mb-1.5">Prioritas / Kategori</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-primary focus:outline-none focus:ring-2 focus:ring-navy-200 dark:focus:ring-navy-700 transition-all appearance-none cursor-pointer">
                    {PRIORITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-white dark:bg-navy-800">{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-primary mb-1.5">Sematkan di Atas (Pin)</label>
                  <select value={pinDuration} onChange={(e) => setPinDuration(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-primary focus:outline-none focus:ring-2 focus:ring-navy-200 dark:focus:ring-navy-700 transition-all appearance-none cursor-pointer">
                    {PIN_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-white dark:bg-navy-800">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-primary mb-1.5 hidden">Konten</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6}
                  placeholder="Tulis pengumuman di sini... (Mendukung paragraf dan styling dasar)"
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-navy-200 dark:focus:ring-navy-700 transition-all resize-none leading-relaxed" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-primary mb-1.5">Lampiran Tautan (Maks. 3)</label>
                <input type="text" value={attachmentsRaw} onChange={(e) => setAttachmentsRaw(e.target.value)}
                  placeholder="https://gdrive.ui.ac.id/..., https://..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-navy-200 dark:focus:ring-navy-700 transition-all text-sm" />
                <p className="text-[11px] text-tertiary mt-1.5">Pisahkan dengan koma jika lebih dari satu.</p>
              </div>

              {error && <p className="text-red-500 text-[13px] font-medium p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">{error}</p>}
            </form>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200 text-sm">
                Pastikan informasi sudah benar sebelum memposting. Pengumuman akan langsung terlihat oleh semua pengguna di channel <strong>{getChannelLabel(channelId)}</strong>.
              </div>
              <div>
                <p className="text-[12px] font-semibold text-tertiary uppercase tracking-wider mb-3">Tampilan Profil Pengumuman</p>
                <div className="pointer-events-none">
                  <AnnouncementCard announcement={previewData} isPreview={true} />
                </div>
              </div>
              {error && <p className="text-red-500 text-[13px] font-medium p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">{error}</p>}
            </div>
          )}

          {step === "posting" && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-navy-100 border-t-navy-600 dark:border-navy-800 dark:border-t-navy-400 rounded-full animate-spin"></div>
              <p className="text-primary font-medium">Sedang menyiarkan pengumuman...</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={32} strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-primary mb-2">Sukses!</h3>
                <p className="text-secondary">Pengumuman berhasil disiarkan ke {getChannelLabel(channelId)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-glass bg-navy-50/50 dark:bg-navy-900/30 flex justify-end gap-3 shrink-0">
          {step === "form" && (
            <>
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-secondary hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors">
                Batal
              </button>
              <button form="post-form" type="submit"
                className="px-6 py-2.5 rounded-xl font-semibold bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white shadow-sm flex items-center gap-2 transition-all active:scale-95">
                Lanjut Pratinjau <ArrowLeft size={16} className="rotate-180" />
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button onClick={() => setStep("form")}
                className="px-5 py-2.5 rounded-xl font-medium text-secondary hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors mr-auto flex items-center gap-2">
                <ArrowLeft size={16} /> Edit Lagi
              </button>
              <button onClick={handleConfirmPost}
                className="px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2 transition-all active:scale-95">
                <Send size={16} /> Siarkan Sekarang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
