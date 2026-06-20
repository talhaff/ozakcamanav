"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Banknote, 
  CreditCard, 
  Store, 
  Receipt, 
  Printer, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getReportData, ReportStats } from "@/actions/ledger";
import { ILedger } from "@/models/Ledger";

export default function ReportView() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    stats: ReportStats;
    ledgers: ILedger[];
  } | null>(null);

  const [expandedLedgerId, setExpandedLedgerId] = useState<string | null>(null);

  // Fetch report data on submit
  async function fetchReport() {
    setIsLoading(true);
    try {
      const res = await getReportData(startDate.toISOString(), endDate.toISOString());
      if (res.success && res.stats && res.ledgers) {
        setReportData({
          stats: res.stats,
          ledgers: res.ledgers,
        });
      } else {
        toast.error(res.error || "Rapor yüklenirken bir hata oluştu.");
      }
    } catch (error) {
      toast.error("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  // Load report data automatically on component mount
  useEffect(() => {
    fetchReport();
  }, []);

  const handlePreset = (type: "this-month" | "last-month" | "last-7-days" | "last-30-days") => {
    const today = new Date();
    if (type === "this-month") {
      setStartDate(startOfMonth(today));
      setEndDate(today);
    } else if (type === "last-month") {
      const prevMonth = subMonths(today, 1);
      setStartDate(startOfMonth(prevMonth));
      setEndDate(endOfMonth(prevMonth));
    } else if (type === "last-7-days") {
      setStartDate(subDays(today, 6));
      setEndDate(today);
    } else if (type === "last-30-days") {
      setStartDate(subDays(today, 29));
      setEndDate(today);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLedgerId(expandedLedgerId === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Detaylı Finansal Rapor</h1>
          <p className="text-zinc-500 mt-1">İstediğiniz tarih aralığı için gelir, gider ve kâr detaylarını inceleyin.</p>
        </div>
        {reportData && (
          <Button 
            onClick={handlePrint}
            variant="outline" 
            className="gap-2 border-zinc-200 bg-white hover:bg-zinc-50 shadow-xs self-start sm:self-center"
          >
            <Printer className="w-4 h-4" />
            Yazdır / PDF Kaydet
          </Button>
        )}
      </div>

      {/* PRINT HEADER */}
      <div className="hidden print:block border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900">Öz Akça Manav Finansal Raporu</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Rapor Aralığı: {format(startDate, "d MMMM yyyy", { locale: tr })} - {format(endDate, "d MMMM yyyy", { locale: tr })}
        </p>
      </div>

      {/* DATE FILTERS CONTAINER */}
      <Card className="border-zinc-200/60 shadow-sm bg-white/60 backdrop-blur-xl print:hidden">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-zinc-500 mr-2">Hızlı Seçimler:</span>
            <Button size="sm" variant="secondary" className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800" onClick={() => handlePreset("this-month")}>Bu Ay</Button>
            <Button size="sm" variant="secondary" className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800" onClick={() => handlePreset("last-month")}>Geçen Ay</Button>
            <Button size="sm" variant="secondary" className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800" onClick={() => handlePreset("last-7-days")}>Son 7 Gün</Button>
            <Button size="sm" variant="secondary" className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800" onClick={() => handlePreset("last-30-days")}>Son 30 Gün</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5 space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Başlangıç Tarihi</label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant="outline"
                    className="w-full h-11 text-left font-medium border-zinc-200 bg-white hover:bg-zinc-50 shadow-xs flex items-center justify-between"
                  />
                }>
                  <span>{format(startDate, "d MMMM yyyy", { locale: tr })}</span>
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date > new Date() || date > endDate}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="sm:col-span-5 space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Bitiş Tarihi</label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant="outline"
                    className="w-full h-11 text-left font-medium border-zinc-200 bg-white hover:bg-zinc-50 shadow-xs flex items-center justify-between"
                  />
                }>
                  <span>{format(endDate, "d MMMM yyyy", { locale: tr })}</span>
                  <CalendarIcon className="h-4 w-4 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date > new Date() || date < startDate}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="sm:col-span-2">
              <Button 
                onClick={fetchReport}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-xs gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Raporu Göster"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATS SUMMARY SECTION */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* REVENUE CARD */}
          <Card className="border-zinc-200/60 shadow-sm bg-white print:border-zinc-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Toplam Gelir (Hasılat)</CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">Seçilen aralıktaki toplam giriş</CardDescription>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 print:bg-zinc-100 print:text-zinc-800">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-extrabold text-zinc-900">
                ₺{reportData.stats.totalIncome.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </div>
              <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2 text-sm">
                <div className="flex justify-between items-center text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-zinc-400" />
                    Nakit Hasılat:
                  </span>
                  <span className="font-semibold text-zinc-900">
                    ₺{reportData.stats.totalCashIncome.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                    Kredi Kartı Hasılatı:
                  </span>
                  <span className="font-semibold text-zinc-900">
                    ₺{reportData.stats.totalCreditCardIncome.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EXPENSE CARD */}
          <Card className="border-zinc-200/60 shadow-sm bg-white print:border-zinc-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Toplam Gider</CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">Tüm mal alımları ve yan harcamalar</CardDescription>
              </div>
              <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 print:bg-zinc-100 print:text-zinc-800">
                <TrendingDown className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-extrabold text-zinc-900">
                ₺{reportData.stats.totalExpense.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </div>
              <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2 text-sm">
                <div className="flex justify-between items-center text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-zinc-400" />
                    Hal Mal Alışı (Ana):
                  </span>
                  <span className="font-semibold text-zinc-900">
                    ₺{reportData.stats.totalHalExpense.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-zinc-400" />
                    Diğer Giderler:
                  </span>
                  <span className="font-semibold text-zinc-900">
                    ₺{reportData.stats.totalOtherExpense.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NET PROFIT CARD */}
          <Card className={cn(
            "border-zinc-200/60 shadow-sm transition-all duration-500",
            reportData.stats.netProfit >= 0 
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none" 
              : "bg-gradient-to-br from-rose-500 to-red-600 text-white border-none"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-white/90 uppercase tracking-wider">Net Kâr / Zarar</CardTitle>
                <CardDescription className="text-xs text-white/70 mt-0.5">Gelir ve giderlerin net farkı</CardDescription>
              </div>
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                <Wallet className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-extrabold">
                ₺{reportData.stats.netProfit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </div>
              <div className="pt-2 border-t border-white/25 flex flex-col gap-1 text-xs">
                <span className="text-white/80">
                  {reportData.stats.netProfit >= 0 
                    ? "Tebrikler! Seçilen tarih aralığında işletmeniz kâr durumunda." 
                    : "Dikkat! Seçilen tarih aralığında harcamalarınız gelirinizi aşmış."}
                </span>
                <span className="font-medium text-white">
                  Kâr Oranı: %{reportData.stats.totalIncome > 0 
                    ? ((reportData.stats.netProfit / reportData.stats.totalIncome) * 100).toFixed(1) 
                    : "0.0"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DETAIL LAYOUTS */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* EXPENSE CATEGORY BREAKDOWN */}
          <Card className="col-span-1 lg:col-span-4 border-zinc-200/60 shadow-sm bg-white/60 backdrop-blur-xl print:border-zinc-300 print:col-span-12">
            <CardHeader className="border-b border-zinc-100/50 pb-5">
              <CardTitle className="text-lg flex items-center gap-2 text-zinc-800">
                <Receipt className="w-5 h-5 text-rose-500" />
                Diğer Gider Dağılımı
              </CardTitle>
              <CardDescription>Operasyonel gider kalemlerinin kategorik analizi.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {reportData.stats.categoryBreakdown.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-sm">
                  Kayıtlı operasyonel gider bulunmamaktadır.
                </div>
              ) : (
                reportData.stats.categoryBreakdown.map((cat, idx) => {
                  const percentage = reportData.stats.totalOtherExpense > 0 
                    ? (cat.amount / reportData.stats.totalOtherExpense) * 100 
                    : 0;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-zinc-700">{cat.category}</span>
                        <span className="font-semibold text-zinc-900">
                          ₺{cat.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          <span className="text-xs font-normal text-zinc-400 ml-1.5">({percentage.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* DETAILED DAILY LIST */}
          <Card className="col-span-1 lg:col-span-8 border-zinc-200/60 shadow-sm bg-white/60 backdrop-blur-xl print:border-zinc-300 print:col-span-12">
            <CardHeader className="border-b border-zinc-100/50 pb-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-800">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Günlük Defter Kayıtları
                </CardTitle>
                <CardDescription>Seçili aralıktaki tüm günlerin özet listesi.</CardDescription>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full print:border">
                {reportData.ledgers.length} Gün Kayıtlı
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50 text-zinc-500 font-medium">
                      <th className="py-4 px-6">Tarih</th>
                      <th className="py-4 px-4 text-right">Gelir</th>
                      <th className="py-4 px-4 text-right">Hal Gideri</th>
                      <th className="py-4 px-4 text-right">Diğer Gider</th>
                      <th className="py-4 px-4 text-right">Net Kâr</th>
                      <th className="py-4 px-6 text-center print:hidden">Detay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100/80">
                    {reportData.ledgers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-zinc-400">
                          Seçilen tarih aralığında kaydedilmiş herhangi bir defter kaydı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      reportData.ledgers.map((ledger) => {
                        const dateText = format(new Date(ledger.date), "dd MMM yyyy, EEE", { locale: tr });
                        const isProfit = ledger.netProfit >= 0;
                        const isExpanded = expandedLedgerId === (ledger._id as any);
                        
                        return (
                          <>
                            <tr key={ledger._id as any} className="hover:bg-zinc-50/40 transition-colors">
                              <td className="py-4 px-6 font-semibold text-zinc-800">{dateText}</td>
                              <td className="py-4 px-4 text-right text-emerald-600 font-semibold">
                                ₺{(ledger.totalIncome || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-4 text-right text-rose-600 font-semibold">
                                ₺{(ledger.hal || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-4 text-right text-rose-600">
                                ₺{(ledger.totalExpense - (ledger.hal || 0)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                              </td>
                              <td className={cn(
                                "py-4 px-4 text-right font-bold",
                                isProfit ? "text-emerald-700" : "text-orange-600"
                              )}>
                                ₺{(ledger.netProfit || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-6 text-center print:hidden">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-full"
                                  onClick={() => toggleExpand(ledger._id as any)}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                                </Button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-zinc-50/60 print:hidden">
                                <td colSpan={6} className="py-5 px-8">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600">
                                    <div className="space-y-2 bg-white p-4 rounded-xl border border-zinc-100 shadow-2xs">
                                      <h4 className="font-bold text-zinc-800 text-sm flex items-center gap-1.5">
                                        <Wallet className="w-4 h-4 text-emerald-500" />
                                        Gelir Dağılımı
                                      </h4>
                                      <div className="flex justify-between border-b border-zinc-100 pb-1">
                                        <span>Nakit Gelir:</span>
                                        <span className="font-semibold text-zinc-800">₺{(ledger.income?.cash || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Kredi Kartı Geliri:</span>
                                        <span className="font-semibold text-zinc-800">₺{(ledger.income?.creditCard || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-2 bg-white p-4 rounded-xl border border-zinc-100 shadow-2xs">
                                      <h4 className="font-bold text-zinc-800 text-sm flex items-center gap-1.5">
                                        <Receipt className="w-4 h-4 text-rose-500" />
                                        Operasyonel Gider Listesi
                                      </h4>
                                      {ledger.expenses && ledger.expenses.length > 0 ? (
                                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                                          {ledger.expenses.map((exp, expIdx) => (
                                            <div key={expIdx} className="flex justify-between text-zinc-600 border-b border-zinc-50 pb-1 last:border-0 last:pb-0">
                                              <span className="font-medium">{exp.category} {exp.description && <span className="text-[10px] text-zinc-400 font-normal">({exp.description})</span>}</span>
                                              <span className="font-semibold text-zinc-800">₺{(exp.amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-zinc-400 py-3 italic">Hiç yan masraf kaydedilmemiş.</div>
                                      )}
                                    </div>
                                    {ledger.notes && (
                                      <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-xl border border-zinc-100 shadow-2xs">
                                        <h4 className="font-bold text-zinc-800 text-sm mb-1.5 flex items-center gap-1.5">
                                          <FileText className="w-4 h-4 text-zinc-400" />
                                          Günün Notu
                                        </h4>
                                        <p className="text-zinc-600 leading-relaxed italic">{ledger.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
