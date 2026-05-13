import { useState } from "react";
import { X, Hash, Send, ArrowLeft, CheckCircle } from "lucide-react";
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
  { value: "1day", label: "📌 Sematkan 1 hari" },
  { value: "1week", label: "📌 Sematkan 1 minggu" },
  { value: "1month", label: "📌 Sematkan 1 bulan" },
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
    pinUntil: pinDuration !== "none" ? new Date(Date.now() + 86400000).toISOString() : null,
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
          title: title.trim(),
          content: content.trim(),
          priority,
          attachments: parsedAttachments,
          pinDuration: pinDuration !== "none" ? pinDuration : undefined,
        },
        token
      );

      onPostSuccess(channelId, {
        id: result.announcement.id,
        author: result.announcement.authorName,
        authorRole: result.announcement.authorRole || null,
        authorAccountType: result.announcement.authorAccountType || null,
        date: result.announcement.createdAt,
        priority: result.announcement.priority,
        title: result.announcement.title,
        content: result.announcement.content,
        attachments: result.announcement.attachments || [],
        pinUntil: result.announcement.pinUntil || null,
      });

      setStep("success");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || "Gagal mengirim. Cek koneksi ke backend.";
      setError(msg);
      setStep("preview");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-[2rem] shadow-2xl border border-glass">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-strong flex items-center justify-between px-6 py-4 border-b border-glass rounded-t-[2rem]">
          <div className="flex items-center gap-2.5">
            <Hash size={16} className="text-navy-400" />
            <div>
              <p className="text-[11px] text-tertiary font-medium">Membuat pengumuman di:</p>
              <p className="text-[14px] font-semibold text-primary">{getChannelLabel(channelId)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-tertiary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* FORM */}
          {step === "form" && (
            <form onSubmit={handlePreview} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-primary ml-1">Judul Pengumuman</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  placeholder="Tuliskan judul pengumuman dengan jelas..."
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-primary ml-1">Isi Pengumuman</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows="5"
                  placeholder="Tuliskan detail pengumuman di sini..."
                  className="w-full p-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-primary ml-1">Prioritas</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary appearance-none focus:outline-none transition-all cursor-pointer">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="dark:bg-navy-800">{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-primary ml-1">Sematkan (Pin)</label>
                  <select value={pinDuration} onChange={(e) => setPinDuration(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary appearance-none focus:outline-none transition-all cursor-pointer">
                    {PIN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="dark:bg-navy-800">{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-primary ml-1">Lampiran (Opsional, maks 3)</label>
                <input type="text" value={attachmentsRaw} onChange={(e) => setAttachmentsRaw(e.target.value)}
                  placeholder="Pisahkan dengan koma: doc.pdf, https://drive.google.com/..."
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all" />
              </div>

              {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}

              <div className="pt-3 border-t border-glass flex justify-end">
                <button type="submit"
                  className="px-6 h-11 flex items-center gap-2 bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]">
                  Pratinjau <Send size={15} />
                </button>
              </div>
            </form>
          )}

          {/* PREVIEW */}
          {step === "preview" && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <p className="text-[15px] font-semibold text-primary">Pratinjau Pengumuman</p>
                <p className="text-[12px] text-tertiary">
                  Seperti inilah pengumuman Anda akan terlihat oleh mahasiswa.<br />
                  <strong className="text-amber-600 dark:text-amber-400">
                    Setelah dikirim, pengumuman tidak bisa diedit atau dihapus.
                  </strong>
                </p>
              </div>

              <div className="pointer-events-none">
                <AnnouncementCard announcement={previewData} />
              </div>

              {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}

              <div className="flex items-center justify-between pt-3 border-t border-glass">
                <button onClick={() => setStep("form")}
                  className="px-5 h-11 flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-xl transition-all">
                  <ArrowLeft size={15} /> Kembali Edit
                </button>
                <button onClick={handleConfirmPost}
                  className="px-6 h-11 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]">
                  <CheckCircle size={15} /> Ya, Publikasikan
                </button>
              </div>
            </div>
          )}

          {/* POSTING */}
          {step === "posting" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-8 h-8 rounded-full border-3 border-navy-500 border-t-transparent animate-spin"></div>
              <p className="text-sm text-secondary font-medium">Mempublikasikan ke Cassandra...</p>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[15px] font-semibold text-primary">Pengumuman berhasil dipublikasikan!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
