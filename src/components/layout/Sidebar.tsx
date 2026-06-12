"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PenSquare, 
  Settings, 
  LogOut, 
  Store 
} from "lucide-react";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Kayıt Gir", href: "/kayit", icon: PenSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-zinc-950 text-zinc-100 transition-all duration-300">
      <div className="flex h-20 items-center gap-3 px-6 border-b border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
          <Store size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">Öz Akça</span>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-500 text-zinc-950"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <item.icon
                className={clsx(
                  "h-5 w-5",
                  isActive ? "text-zinc-950" : "text-zinc-400 group-hover:text-zinc-100"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
