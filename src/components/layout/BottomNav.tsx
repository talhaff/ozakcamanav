"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenSquare } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Kayıt Gir", href: "/kayit", icon: PenSquare },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-zinc-200 z-50 px-6 pb-safe flex items-center justify-center gap-12 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex flex-col items-center justify-center gap-1 w-20 h-16 rounded-2xl transition-all duration-300",
              isActive 
                ? "text-emerald-600 scale-110" 
                : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <div className={clsx(
              "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
              isActive ? "bg-emerald-50" : "bg-transparent"
            )}>
              <item.icon
                className={clsx("h-6 w-6 transition-all duration-300", isActive ? "stroke-[2.5px]" : "stroke-2")}
                aria-hidden="true"
              />
            </div>
            <span className={clsx(
              "text-[10px] font-medium transition-all duration-300",
              isActive ? "opacity-100" : "opacity-80"
            )}>
              {item.name}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
