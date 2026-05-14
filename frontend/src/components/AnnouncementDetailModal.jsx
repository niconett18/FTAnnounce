import { X, User, Paperclip } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementDetailModal({ announcement, onClose }) {
  if (!announcement) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-navy-900 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-navy-700 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-navy-800 shrink-0">
          <h2 className="text-[15px] font-semibold text-primary">
            Detail Pengumuman
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-navy-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 bg-slate-50/50 dark:bg-navy-900/50">
          <AnnouncementCard announcement={announcement} />
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 dark:border-navy-800 bg-white dark:bg-navy-900 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-medium text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}