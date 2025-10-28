import { create } from 'zustand';

interface LayoutStore {
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  sidebarVisible: true,
  setSidebarVisible: (visible: boolean) => set({ sidebarVisible: visible }),
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
}));
