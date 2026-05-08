import { ArrowRight, Mail, Lock, User, Building } from "lucide-react";
import logo from "../assets/logo.png";

export default function Register({ onNavigate }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // After register, just navigate to login
    onNavigate("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[10%] right-[-10%] w-96 h-96 bg-navy-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md glass-strong rounded-[2rem] p-8 md:p-10 shadow-glass relative z-10 border border-glass">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="FTAnnounce Logo" className="w-20 h-20 object-contain drop-shadow-md mb-4" />
          <h1 className="text-2xl font-bold text-primary tracking-tight">Buat Akun</h1>
          <p className="text-sm text-secondary mt-1">Bergabung dengan FTAnnounce</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-primary ml-1">Nama Lengkap</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                placeholder="John Doe"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-primary ml-1">Departemen / Jurusan</label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <select defaultValue="" required className="w-full h-11 pl-10 pr-4 rounded-xl glass-input text-sm text-primary appearance-none focus:outline-none transition-all cursor-pointer bg-transparent">
                <option value="" disabled className="text-tertiary dark:bg-navy-800">Pilih Departemen...</option>
                <option value="dtm" className="dark:bg-navy-800">DTM (Teknik Mesin)</option>
                <option value="dts" className="dark:bg-navy-800">DTS (Teknik Sipil)</option>
                <option value="dte" className="dark:bg-navy-800">DTE (Teknik Elektro)</option>
                <option value="dti" className="dark:bg-navy-800">DTI (Teknik Industri)</option>
                <option value="dtmm" className="dark:bg-navy-800">DTMM (Metalurgi & Material)</option>
                <option value="dtk" className="dark:bg-navy-800">DTK (Teknik Kimia)</option>
                <option value="da" className="dark:bg-navy-800">DA (Arsitektur)</option>
                <option value="pi" className="dark:bg-navy-800">PI (Program Internasional)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-primary ml-1">Email UI / NPM</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="email"
                placeholder="npm@ui.ac.id"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-primary ml-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl glass-input text-sm text-primary placeholder-tertiary focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 mt-2 flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            Daftar Akun <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-secondary">
          Sudah punya akun?{" "}
          <button onClick={() => onNavigate("login")} className="font-semibold text-navy-600 hover:text-navy-800 dark:text-navy-300 transition-colors">
            Masuk di sini
          </button>
        </div>
      </div>
    </div>
  );
}
