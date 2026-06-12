import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Top Header (Hidden on Desktop) */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 pt-20 pb-28 md:p-8 md:pt-8 md:pb-8">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <BottomNav />
    </div>
  );
}
