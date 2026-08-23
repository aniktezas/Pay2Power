import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppNavbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <AppNavbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-950/70 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </>
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
