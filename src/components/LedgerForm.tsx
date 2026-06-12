"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  CalendarIcon, 
  Plus, 
  Trash2, 
  Loader2, 
  Banknote, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Receipt,
  FileText
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { ledgerFormSchema, LedgerFormValues } from "@/lib/validations";
import { saveLedger, getLedgerByDate } from "@/actions/ledger";

export default function LedgerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LedgerFormValues>({
    resolver: zodResolver(ledgerFormSchema),
    defaultValues: {
      date: new Date(),
      income: {
        cash: 0,
        creditCard: 0,
      },
      expenses: [],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "expenses",
    control: form.control,
  });

  async function onSubmit(data: LedgerFormValues) {
    setIsSubmitting(true);
    try {
      const res = await saveLedger(data);
      if (res.success) {
        toast.success(res.message);
        form.reset();
        form.setValue("date", new Date());
      } else {
        toast.error(res.error || "Bir hata oluştu.");
      }
    } catch (error) {
      toast.error("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calculate dynamic totals for the UI
  const watchedIncome = form.watch("income");
  const watchedExpenses = form.watch("expenses");
  const watchedDate = form.watch("date");
  
  const totalIncome = (Number(watchedIncome?.cash) || 0) + (Number(watchedIncome?.creditCard) || 0);
  const totalExpense = watchedExpenses?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
  const netProfit = totalIncome - totalExpense;

  const lastFetchedDateRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchLedger() {
      if (!watchedDate) return;
      
      const currentStr = format(watchedDate, "yyyy-MM-dd");
      if (lastFetchedDateRef.current === currentStr) return;
      
      lastFetchedDateRef.current = currentStr;
      
      const res = await getLedgerByDate(watchedDate.toISOString());
      
      if (res) {
        form.reset({
          date: watchedDate,
          income: res.income,
          expenses: res.expenses || [],
          notes: res.notes || "",
        });
      } else {
        form.reset({
          date: watchedDate,
          income: { cash: 0, creditCard: 0 },
          expenses: [],
          notes: "",
        });
      }
    }
    fetchLedger();
  }, [watchedDate, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 pb-20">
        
        {/* Datalist for autocomplete */}
        <datalist id="expense-categories">
          <option value="Toptancı" />
          <option value="Yemek" />
          <option value="Çalışan Maaşı" />
          <option value="Elektrik Faturası" />
          <option value="Su Faturası" />
          <option value="Kira" />
          <option value="Market Alışverişi" />
          <option value="Vergi / Muhasebe" />
          <option value="Diğer" />
        </datalist>

        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Günlük Kayıt Gir</h1>
          <p className="text-zinc-500">Bugün (veya geçmişteki bir gün) için nakit, kredi kartı hasılatı ve giderlerinizi işleyin.</p>
        </div>

        {/* TOP ROW: Date & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="col-span-1 border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Tarih Seçimi
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <FormControl>
                        <PopoverTrigger render={
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full h-11 pl-4 text-left font-medium border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm",
                              !field.value && "text-muted-foreground"
                            )}
                          />
                        }>
                          {field.value ? (
                            format(field.value, "d MMMM yyyy", { locale: tr })
                          ) : (
                            <span>Tarih Seç</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1 border-none shadow-lg shadow-emerald-500/10 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2 pt-5 px-5 relative z-10">
              <CardTitle className="text-sm text-emerald-50 font-medium tracking-wide uppercase">Toplam Hasılat</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 relative z-10">
              <div className="text-3xl font-bold tracking-tight">₺{totalIncome.toLocaleString("tr-TR")}</div>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-none shadow-lg shadow-rose-500/10 bg-gradient-to-br from-rose-500 to-rose-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingDown className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2 pt-5 px-5 relative z-10">
              <CardTitle className="text-sm text-rose-50 font-medium tracking-wide uppercase">Toplam Gider</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 relative z-10">
              <div className="text-3xl font-bold tracking-tight">₺{totalExpense.toLocaleString("tr-TR")}</div>
            </CardContent>
          </Card>

          <Card className={cn(
            "col-span-1 border-none shadow-xl relative overflow-hidden transition-all duration-500",
            netProfit >= 0 ? "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-black/20" : "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/20"
          )}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2 pt-5 px-5 relative z-10">
              <CardTitle className="text-sm font-medium tracking-wide uppercase text-zinc-300">Net Kâr</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 relative z-10">
              <div className="text-3xl font-bold tracking-tight">
                ₺{netProfit.toLocaleString("tr-TR")}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* INCOME SECTION */}
          <Card className="col-span-1 lg:col-span-5 border-zinc-200/60 shadow-sm bg-white/60 backdrop-blur-xl">
            <CardHeader className="border-b border-zinc-100/50 pb-6 bg-zinc-50/50 rounded-t-xl">
              <CardTitle className="text-xl flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Gelirler (Hasılat)
              </CardTitle>
              <CardDescription>Günlük kasanızı ve pos cihazını girin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="income.cash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-zinc-700 font-medium mb-2">
                      <Banknote className="w-4 h-4 text-zinc-400" />
                      Nakit Hasılat (₺)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        className="text-2xl font-semibold h-14 bg-white border-zinc-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-xs transition-all" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="income.creditCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-zinc-700 font-medium mb-2">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                      Kredi Kartı Hasılatı (₺)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        className="text-2xl font-semibold h-14 bg-white border-zinc-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-xs transition-all" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* EXPENSES SECTION */}
          <Card className="col-span-1 lg:col-span-7 border-zinc-200/60 shadow-sm flex flex-col bg-white/60 backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100/50 pb-6 bg-zinc-50/50 rounded-t-xl">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-rose-500" />
                  Gider Kalemleri
                </CardTitle>
                <CardDescription className="mt-1">Toptancı, personel, fatura vb. masraflar.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ category: "", amount: 0, description: "" })}
                className="gap-2 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 rounded-full px-5 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Gider Ekle
              </Button>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 pt-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-2xl mx-2">
                  <div className="bg-white p-4 rounded-full shadow-xs mb-3">
                    <Receipt className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900">Masrafınız yok mu?</h3>
                  <p className="text-sm text-zinc-500 mt-1">Bugün yapılan harcamaları kaydetmek için <br/>'Gider Ekle' butonunu kullanın.</p>
                </div>
              )}
              {fields.map((field, index) => (
                <div key={field.id} className="group flex gap-4 items-start p-5 bg-white rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kategori</FormLabel>
                            <FormControl>
                              <Input list="expense-categories" placeholder="Örn: Toptancı, Fatura..." className="h-11 bg-zinc-50/50 focus-visible:bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`expenses.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tutar (₺)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" className="h-11 font-medium bg-zinc-50/50 focus-visible:bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`expenses.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Açıklama veya detay (Opsiyonel)" className="text-sm h-10 border-dashed bg-transparent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-full h-10 w-10 shrink-0 mt-6 opacity-50 group-hover:opacity-100 transition-opacity"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* NOTES & SUBMIT */}
        <div className="flex flex-col gap-6">
          <Card className="border-zinc-200/60 shadow-sm bg-white/60 backdrop-blur-xl">
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-zinc-700 font-medium mb-2">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      Günün Notu (Opsiyonel)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Bugün hava yağmurluydu, satışlar azdı, şu ürün hızlı bitti vb." className="h-12 bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end sticky bottom-6 z-20">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full md:w-auto md:min-w-[280px] h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Günü Kaydet"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
