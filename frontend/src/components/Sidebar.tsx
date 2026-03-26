"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListOrdered, LayoutDashboard, PlusCircle, Receipt, LineChart } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "New Order", href: "/orders/new", icon: PlusCircle },
    { name: "Order History", href: "/orders", icon: ListOrdered },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Analytics", href: "/analytics", icon: LineChart },
  ];

  return (
    <aside className="w-64 bg-[#111111] border-r border-gray-800 text-white flex flex-col min-h-screen">
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
        <div className="text-xs text-center text-gray-600">
          Sync Status: <span className="text-green-500 px-1">●</span> Online
        </div>
      </div>
    </aside>
  );
}
