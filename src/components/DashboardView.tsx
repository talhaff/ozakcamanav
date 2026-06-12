"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardStats, DailyChartData } from "@/actions/ledger";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  stats: DashboardStats;
  chartData: DailyChartData[];
}

export default function DashboardView({ stats, chartData }: DashboardViewProps) {
  const isProfit = stats.netProfit >= 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Finansal Analiz</h1>
        <p className="text-zinc-500 mt-2">
          Son 30 günün gelir, gider ve net kâr durumu.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Toplam Hasılat</CardTitle>
            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">
              ₺{stats.totalIncome.toLocaleString("tr-TR")}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Toplam Gider</CardTitle>
            <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">
              ₺{stats.totalExpense.toLocaleString("tr-TR")}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-none shadow-md", isProfit ? "bg-gradient-to-br from-emerald-500 to-green-600" : "bg-gradient-to-br from-orange-500 to-red-600")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Net Kâr</CardTitle>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              {isProfit ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ₺{stats.netProfit.toLocaleString("tr-TR")}
            </div>
            <p className="text-xs text-white/80 mt-1">
              {isProfit ? "Harika gidiyorsunuz!" : "Giderlerinizi gözden geçirin."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AREA CHART FOR PROFIT TREND */}
        <Card className="col-span-1 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Günlük Net Kâr Eğilimi</CardTitle>
            <CardDescription>Son 30 gündeki günlük kâr/zarar gidişatı.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Net Kâr']}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* BAR CHART FOR INCOME VS EXPENSE */}
        <Card className="col-span-1 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Gelir ve Gider Karşılaştırması</CardTitle>
            <CardDescription>Günlük bazda Hasılat ve Masraflar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => {
                      const label = name === 'income' ? 'Hasılat' : 'Gider';
                      return [`₺${value.toLocaleString('tr-TR')}`, label];
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="income" name="income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
