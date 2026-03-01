"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, LogOut, Package } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#fcfcfc] border-r border-[#eaeaea] flex flex-col justify-between p-6 sticky top-0 text-[#111111] shadow-sm font-sans z-50">
      <div>
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-8 h-8 rounded-md bg-[#222222] flex items-center justify-center font-bold text-white shadow-sm">
            O
          </div>
          <span className="text-lg font-medium tracking-tight">Offstump</span>
        </div>

        <nav className="space-y-1 mt-6">
          <NavItem href="/dashboard" icon={<LayoutDashboard strokeWidth={1.5} size={18} />} label="Overview" active={pathname?.startsWith("/dashboard")} />
          <NavItem href="/customers" icon={<Users strokeWidth={1.5} size={18} />} label="Customers" active={pathname?.startsWith("/customers")} />
          <NavItem href="/bookings" icon={<CalendarDays strokeWidth={1.5} size={18} />} label="Bookings" active={pathname?.startsWith("/bookings")} />
          <NavItem href="/services" icon={<Package strokeWidth={1.5} size={18} />} label="Services" active={pathname?.startsWith("/services")} />
        </nav>
      </div>

      <button className="flex items-center gap-3 px-4 py-2.5 text-[#555555] hover:text-[#111111] hover:bg-[#f2f2f2] rounded-lg transition-all w-full mt-auto">
        <LogOut strokeWidth={1.5} size={18} />
        <span className="font-medium text-sm">Sign out</span>
      </button>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${active
          ? "bg-[#efefef] text-[#111111] font-medium border border-[#e2e2e2]"
          : "text-[#555555] hover:text-[#111111] hover:bg-[#f5f5f5] border border-transparent"
        }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
