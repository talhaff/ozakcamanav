import { getDashboardData, getTodayLedger } from "@/actions/ledger";
import DashboardView from "@/components/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch data securely on the server
  const { stats, chartData } = await getDashboardData(30);
  const todayLedger = await getTodayLedger();

  return (
    <div className="max-w-6xl mx-auto">
      <DashboardView stats={stats} chartData={chartData} todayLedger={todayLedger} />
    </div>
  );
}
