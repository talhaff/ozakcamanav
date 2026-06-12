"use client";

import { Store, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 z-50 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
          <Store size={18} />
        </div>
        <span className="text-lg font-bold tracking-tight text-zinc-900">Öz Akça</span>
      </div>
      
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center justify-center h-9 w-9 rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        aria-label="Çıkış Yap"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}
