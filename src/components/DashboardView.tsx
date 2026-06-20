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
import { Button } from "@/components/ui/button";
import { DashboardStats, DailyChartData } from "@/actions/ledger";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  Calendar,
  Plus,
  Banknote,
  CreditCard,
  Store,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ILedger } from "@/models/Ledger";

interface DashboardViewProps {
  stats: DashboardStats;
  chartData: DailyChartData[];
  todayLedger?: ILedger | null;
}

export default function DashboardView({ stats, chartData, todayLedger }: DashboardViewProps) {
  const isProfit = stats.netProfit >= 0;
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Finansal Analiz</h1>
        <p className="text-zinc-500 mt-2">
          Son 30 günün gelir, gider ve net kâr durumu.
        </p>
      </div>

      {/* TODAY'S SUMMARY BANNER */}
      {!todayLedger ? (
        <Card className="border-amber-200 bg-amber-50/50 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-900">Bugün İçin Defter Kaydı Girilmedi</h3>
                <p className="text-sm text-amber-700 mt-0.5">Günün hasılat ve giderlerini girmek için hemen kayıt oluşturabilirsiniz.</p>
              </div>
            </div>
            <Button onClick={() => router.push("/kayit")} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all shadow-xs gap-2 shrink-0 self-start sm:self-center h-11 px-5 cursor-pointer">
              <Plus className="w-4 h-4 inline mr-1.5" />
              Bugünün Kaydını Gir
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-200/60 shadow-md bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-zinc-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Bugünün Finansal Özeti
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Bugün girilen kayıtların anlık dağılımı.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-sm font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5",
                todayLedger.netProfit >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}>
                Bugünkü Net: ₺{todayLedger.netProfit.toLocaleString("tr-TR")}
              </span>
              <Button onClick={() => router.push("/kayit")} variant="outline" size="sm" className="h-9 px-4 rounded-lg text-zinc-700 border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer">
                Kaydı Düzenle
              </Button>
            </div>
          </div>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-100 p-0">
            <div className="p-5 space-y-1">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-zinc-400" />
                Nakit Gelir
              </span>
              <div className="text-xl font-bold text-zinc-800">₺{(todayLedger.income?.cash || 0).toLocaleString("tr-TR")}</div>
            </div>
            <div className="p-5 space-y-1">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                Kredi Kartı
              </span>
              <div className="text-xl font-bold text-zinc-800">₺{(todayLedger.income?.creditCard || 0).toLocaleString("tr-TR")}</div>
            </div>
            <div className="p-5 space-y-1 col-span-1">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-zinc-400" />
                Hal Gideri
              </span>
              <div className="text-xl font-bold text-rose-600">₺{(todayLedger.hal || 0).toLocaleString("tr-TR")}</div>
            </div>
            <div className="p-5 space-y-1 col-span-1">
              <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                Diğer Gider
              </span>
              <div className="text-xl font-bold text-rose-600">₺{(todayLedger.totalExpense - (todayLedger.hal || 0)).toLocaleString("tr-TR")}</div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="h-[250px] md:h-[350px] w-full mt-4">
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
                    formatter={(value: any) => [`₺${Number(value || 0).toLocaleString('tr-TR')}`, 'Net Kâr']}
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
            <div className="h-[250px] md:h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: any) => {
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
