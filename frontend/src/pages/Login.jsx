import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { loginAdmin } from "../api";
import useAppStore from "../store/useAppStore";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAdmin(username, password);
      setUser(res.user);
      setToken(res.token);
      toast.success("Login berhasil!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal login. Periksa username dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 flex items-center justify-center p-4 border-2 dark:border-navy-600">
      <div className="max-w-md w-full glass-card p-8 rounded-2xl shadow-xl border border-white/50 animate-in zoom-in-95 duration-300 hover:shadow-2xl transition-all">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4 dark:bg-navy-800">
            <LogIn size={32} className="text-navy-700 dark:text-navy-200" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Admin Login</h1>
          <p className="text-navy-600 mt-2 text-sm dark:text-navy-300">
            Masuk untuk mengelola pengumuman FTAnnounce
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy-900 dark:text-navy-100 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none transition-all dark:bg-navy-800 dark:border-navy-700 dark:text-white dark:focus:ring-navy-700 hover:border-navy-400"
              placeholder="Masukkan username Anda"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 dark:text-navy-100 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none transition-all dark:bg-navy-800 dark:border-navy-700 dark:text-white dark:focus:ring-navy-700 hover:border-navy-400"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-800 hover:bg-navy-900 active:scale-95 group hover:shadow-lg text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-70 dark:bg-navy-700 dark:hover:bg-navy-600"
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-navy-100 text-center dark:border-navy-800">
          <p className="text-sm text-navy-600 dark:text-navy-400">
            Bukan akun admin?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-navy-800 font-semibold hover:underline dark:text-navy-200"
            >
              Kembali ke Beranda
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}




