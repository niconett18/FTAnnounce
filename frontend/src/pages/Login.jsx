import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";
import { loginAdmin } from "../api";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const username = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      const { token, user } = await loginAdmin(username, password);
      onLogin({
        role: user.role,
        name: user.displayName,
        username: user.username,
        accountType: user.accountType,
        roleTitle: user.roleTitle || null,
        profilePicture: user.profilePicture || null,
      }, token);
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.error || "Gagal menghubungi server. Cek apakah backend berjalan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex items-center justify-center p-4 relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-navy-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-navy-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md glass-strong rounded-[2rem] p-8 md:p-10 shadow-glass relative z-10 border border-glass">
        <div className="flex flex-col items-center mb-8 relative">
          <button 
            type="button"
            onClick={() => navigate("/")}
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
            <p className="text-[10px] text-tertiary ml-1">Masukkan username admin yang terdaftar.</p>
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

          {error && (
            <p className="text-xs text-red-500 font-medium text-center px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500 text-white rounded-xl font-medium transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Memverifikasi..." : (<>Masuk <ArrowRight size={16} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
