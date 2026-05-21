import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Login from "./pages/Login";
import { setLogoutCallback } from "./api";
import useAppStore from "./store/useAppStore";

function MainLayout() {
  const navigate = useNavigate();
  const { user, isDarkMode, setSidebarOpen, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="h-full flex transition-colors duration-300 bg-slate-50 dark:bg-navy-900 text-slate-800 dark:text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative h-screen">
        <div className="lg:hidden flex items-center justify-between h-[56px] px-4 glass-strong border-b border-glass sticky top-0 z-20">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-navy-100/50 dark:hover:bg-white/10 rounded-lg transition-all"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            <span className="ml-2 text-[14px] font-semibold text-primary tracking-[-0.01em]">
              FTAnnounce
            </span>
          </div>
          {user && (
            <button onClick={handleLogout} className="p-2 -mr-2 text-red-500 hover:bg-red-500/10 rounded-lg">
              <LogOut size={16} />
            </button>
          )}
        </div>
        <Feed />
      </div>
    </div>
  );
}

export default function App() {
  const logout = useAppStore(state => state.logout);

  useEffect(() => {
    setLogoutCallback(() => {
      logout();
      window.location.href = '/loginAdmin';
    });
  }, [logout]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/loginAdmin" element={<Login />} />
      </Routes>
    </Router>
  );
}


