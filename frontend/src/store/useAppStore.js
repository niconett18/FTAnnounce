import { create } from 'zustand';

const useAppStore = create((set) => ({
  user: null,
  token: null,
  activeChannel: 'dts',
  isDarkMode: false,
  sidebarOpen: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setActiveChannel: (channel) => set({ activeChannel: channel }),
  setIsDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  logout: () => set({ user: null, token: null }),
}));

export default useAppStore;