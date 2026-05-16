import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, ShieldCheck, Globe, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import ftuiBg from "../assets/FTUI.jpg";
import { loginAdmin } from "../api";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden">
      <div className="hidden md:flex md:w-[60%] lg:w-[68%] relative overflow-hidden bg-[#E2E8F0]">
        <img
          src={ftuiBg}
          alt="FT UI Building"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[1.02] contrast-[1.1] saturate-[1.1] transition-opacity duration-700"
          style={{ imageRendering: 'auto' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-900/60 via-navy-800/20 to-transparent"></div>

        <div className="absolute bottom-16 left-16 z-10 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
            Digital Gate for <br />
            <span className="text-navy-200">FT UI Announcements</span>
          </h2>
          <p className="text-white/70 text-[16px] max-w-sm leading-relaxed font-light">
            Platform komunikasi modern untuk seluruh Departemen dan Program Studi di Fakultas Teknik Universitas Indonesia.
          </p>
        </div>

      </div>

      <div className="md:w-[40%] lg:w-[32%] flex flex-col justify-center items-center p-8 lg:p-16 relative bg-white border-l border-slate-100">
        <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-navy-100 rounded-full blur-[80px] opacity-60"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-navy-50 rounded-full blur-[80px] opacity-60"></div>

        <div className="w-full max-w-sm space-y-10 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
              <div className="h-6 w-px bg-navy-200"></div>
              <span className="text-[14px] font-bold text-navy-800 tracking-tight">FTAnnounce</span>
            </div>
            <h3 className="text-3xl font-bold text-navy-900 tracking-tight">Welcome back</h3>
            <p className="text-slate-500 text-[14px]">Masukkan kredensial admin Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-navy-400 uppercase tracking-widest ml-1">Username / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400 group-focus-within:text-navy-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="email"
                  placeholder="admin/email@ui.ac.id"
                  required
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-navy-900 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-navy-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-navy-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 text-navy-900 text-[14px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-navy-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium animate-shake">
                <ShieldCheck size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-[15px] transition-all shadow-lg shadow-navy-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Masuk <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="pt-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 text-[12px] text-slate-400 font-medium">
              <button onClick={() => navigate("/")} className="hover:text-navy-600">Kembali ke Beranda</button>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <button className="hover:text-navy-600">Help Center</button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] text-slate-500 font-semibold">
              <Globe size={12} />
              <span>FT UI • Indonesia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
