"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListOrdered, LayoutDashboard, PlusCircle, Receipt, LineChart, LogOut } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "New Order", href: "/orders/new", icon: PlusCircle },
    { name: "History", href: "/orders", icon: ListOrdered },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Analytics", href: "/analytics", icon: LineChart },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#111111] border-r border-gray-800 text-white flex-col min-h-screen sticky top-0 z-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
            TAZISH
          </h2>
          <p className="text-sm text-gray-500">Business Manager</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/10 text-orange-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-gray-800">
          <div className="text-xs text-center text-gray-600 mb-4">
            Sync Status: <span className="text-green-500 px-1">●</span> Online
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-medium border border-red-500/20">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (PWA Optimised) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-gray-800 z-[100] flex justify-around items-end pt-2 pb-6 px-1 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${
                  isActive ? "text-orange-400 scale-110" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon size={isActive ? 24 : 22} className={isActive ? "mb-1 text-orange-400" : "mb-1"} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide truncate">{link.name}</span>
              </Link>
            );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-16 transition-all duration-300 text-red-500/80 hover:text-red-400"
        >
          <LogOut size={22} className="mb-1" strokeWidth={2} />
          <span className="text-[10px] font-medium tracking-wide truncate">Logout</span>
        </button>
      </nav>
    </>
  );
}
