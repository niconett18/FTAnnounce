import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import Login from "./pages/Login";
import { fetchAnnouncements, setLogoutCallback } from "./api";

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/loginAdmin" replace />;
  }
  return children;
}

function MainLayout({ isAdmin, user, token, onLogout, onProfileUpdate }) {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState("dts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [announcements, setAnnouncements] = useState({});
  const [loadingChannel, setLoadingChannel] = useState(false);
  const [hasMore, setHasMore] = useState({});
  const [lastTimestamps, setLastTimestamps] = useState({});

  useEffect(() => {
    if (announcements[activeChannel]) return;

    setLoadingChannel(true);
    fetchAnnouncements(activeChannel)
      .then(result => {
        setAnnouncements(prev => ({ ...prev, [activeChannel]: result.announcements }));
        setHasMore(prev => ({ ...prev, [activeChannel]: !!result.nextTimestamp }));
        setLastTimestamps(prev => ({ ...prev, [activeChannel]: result.nextTimestamp }));
      })
      .catch(err => {
        console.error('Gagal fetch pengumuman:', err);
      })
      .finally(() => setLoadingChannel(false));
  }, [activeChannel]);

  const loadMore = async () => {
    if (!hasMore[activeChannel] || loadingChannel) return;
    const currentLast = lastTimestamps[activeChannel];
    if (!currentLast) return;

    setLoadingChannel(true);
    try {
      const result = await fetchAnnouncements(activeChannel, currentLast);
      setAnnouncements(prev => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), ...result.announcements]
      }));
      setHasMore(prev => ({ ...prev, [activeChannel]: !!result.nextTimestamp }));
      setLastTimestamps(prev => ({ ...prev, [activeChannel]: result.nextTimestamp }));
    } catch (err) {
      console.error('Gagal load more:', err);
    } finally {
      setLoadingChannel(false);
    }
  };

  const handleAddAnnouncement = (channelId, newAnnouncement) => {
    setAnnouncements(prev => ({
      ...prev,
      [channelId]: [newAnnouncement, ...(prev[channelId] || [])]
    }));
  };

  const handleChannelSelect = (channelId) => {
    setActiveChannel(channelId);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="h-full flex transition-colors duration-300">
      <Sidebar
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={isAdmin ? user : null}
        token={token}
        onLogout={handleLogout}
        onProfileUpdate={onProfileUpdate}
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
          {isAdmin && user && (
            <button onClick={handleLogout} className="p-2 -mr-2 text-red-500 hover:bg-red-500/10 rounded-lg">
              <LogOut size={16} />
            </button>
          )}
        </div>

        <Feed
          activeChannel={activeChannel}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          announcements={announcements}
          loading={loadingChannel}
          hasMore={hasMore[activeChannel]}
          onLoadMore={loadMore}
          isAdmin={isAdmin}
          user={user}
          token={token}
          onPostSuccess={handleAddAnnouncement}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    setLogoutCallback(handleLogout);
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <Router>
      <Routes>
        <Route path="/loginAdmin" element={
          user ? <Navigate to="/admin" replace /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute user={user}>
            <MainLayout isAdmin={true} user={user} token={token} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          <MainLayout isAdmin={false} user={null} token={null} onLogout={handleLogout} onProfileUpdate={() => {}} />
        } />
      </Routes>
    </Router>
  );
}
