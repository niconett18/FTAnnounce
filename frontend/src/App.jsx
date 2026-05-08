import { useState, useEffect } from "react";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { announcements as initialAnnouncements } from "./data/announcements";

export default function App() {
  const [currentView, setCurrentView] = useState("feed"); // feed, login, admin
  const [user, setUser] = useState(null); // { role, name, dept }
  
  const [activeChannel, setActiveChannel] = useState("dtm");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === "admin") {
      setCurrentView("admin");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("login");
  };

  const handleAddAnnouncement = (channelId, newAnnouncement) => {
    setAnnouncements(prev => {
      const channelItems = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: [newAnnouncement, ...channelItems]
      };
    });
  };

  const handleChannelSelect = (channelId) => {
    setActiveChannel(channelId);
    
    // Mark all announcements in the channel as read
    if (announcements[channelId]) {
      setAnnouncements(prev => ({
        ...prev,
        [channelId]: prev[channelId].map(a => ({ ...a, isRead: true }))
      }));
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Routing Logic
  if (currentView === "login") {
    return <Login onLogin={handleLogin} onNavigate={setCurrentView} />;
  }

  if (currentView === "admin") {
    return <Admin onLogout={handleLogout} onAddAnnouncement={handleAddAnnouncement} />;
  }

  // Main Feed View
  return (
    <div className="h-full flex transition-colors duration-300">
      <Sidebar
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        announcements={announcements}
        user={user}
        onLogout={handleLogout}
        onNavigateToLogin={() => setCurrentView("login")}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
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
          <button onClick={handleLogout} className="p-2 -mr-2 text-red-500 hover:bg-red-500/10 rounded-lg">
             <LogOut size={16} />
          </button>
        </div>

        <Feed 
          activeChannel={activeChannel}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          announcements={announcements}
        />
      </div>
    </div>
  );
}
