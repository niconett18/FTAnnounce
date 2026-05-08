import { ArrowRight, Mail, Lock, ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";

export default function Login({ onLogin, onNavigate }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    // Mock login logic
    if (email.toLowerCase() === "admin") {
      onLogin({ role: "admin", name: "Admin FT" });
    } else {
      alert("Hanya Administrator yang diizinkan masuk ke panel ini.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-navy-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-navy-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md glass-strong rounded-[2rem] p-8 md:p-10 shadow-glass relative z-10 border border-glass">
        <div className="flex flex-col items-center mb-8 relative">
          <button 
            onClick={() => onNavigate("feed")}
            className="absolute left-0 top-0 p-2 text-tertiary hover:text-primary transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={20} />
          </button>
          <img src={logo} alt="FTAnnounce Logo" className="w-20 h-20 object-contain drop-shadow-md mb-4" />
          <h1 className="text-2xl font-bold text-primary tracking-tight">Admin Portal</h1>
          <p className="text-sm text-secondary mt-1">Sistem Informasi Pengumuman</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-primary ml-1">Email UI / Username</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                name="email"
                placeholder="npm@ui.ac.id atau 'admin'"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-tertiary ml-1">Ketik "admin" untuk masuk sebagai Admin.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-primary ml-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1 pb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-glass accent-navy-600" />
              <span className="text-xs text-secondary">Ingat saya</span>
            </label>
            <a href="#" className="text-xs font-medium text-navy-500 hover:text-navy-700 dark:text-navy-300 transition-colors">
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            Masuk <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
