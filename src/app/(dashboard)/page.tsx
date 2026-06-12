import { getDashboardData } from "@/actions/ledger";
import DashboardView from "@/components/DashboardView";

export default async function DashboardPage() {
  // Fetch data for the last 30 days securely on the server
  const { stats, chartData } = await getDashboardData(30);

  return (
    <div className="max-w-6xl mx-auto">
      <DashboardView stats={stats} chartData={chartData} />
    </div>
  );
}
