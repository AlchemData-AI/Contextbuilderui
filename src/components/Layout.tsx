import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useLayoutStore } from '../lib/layoutStore';

export function Layout() {
  const sidebarVisible = useLayoutStore((state) => state.sidebarVisible);

  return (
    <div className="flex h-screen bg-[#FAFBFC]">
      {sidebarVisible && <Sidebar />}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
