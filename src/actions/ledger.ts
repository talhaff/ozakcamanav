"use server";

import connectToDatabase from "@/lib/mongodb";
import Ledger, { ILedger } from "@/models/Ledger";
import { ledgerFormSchema, LedgerFormValues } from "@/lib/validations";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { revalidatePath } from "next/cache";

// Type definitions for aggregated data
export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export interface DailyChartData {
  date: string;
  income: number;
  expense: number;
  profit: number;
}

/**
 * Saves or updates a daily ledger entry
 */
export async function saveLedger(data: LedgerFormValues) {
  try {
    // Backend validation
    const parsedData = ledgerFormSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Geçersiz veri formatı" };
    }

    await connectToDatabase();
    
    const { date, income, expenses, notes, hal } = parsedData.data;
    const targetDate = startOfDay(new Date(date));

    // Find if a ledger for this date already exists
    let ledger = await Ledger.findOne({
      date: {
        $gte: targetDate,
        $lte: endOfDay(targetDate),
      },
    });

    if (ledger) {
      // Update existing
      ledger.income = income;
      ledger.expenses = expenses;
      ledger.hal = hal;
      ledger.notes = notes;
      await ledger.save(); // pre-save hook will recalculate totals
    } else {
      // Create new
      ledger = new Ledger({
        date: targetDate,
        income,
        expenses,
        hal,
        notes,
      });
      await ledger.save();
    }

    revalidatePath("/");
    revalidatePath("/kayit");
    return { success: true, message: "Kayıt başarıyla kaydedildi." };

  } catch (error: any) {
    console.error("Save Ledger Error:", error);
    return { success: false, error: error.message || "Bilinmeyen bir hata oluştu" };
  }
}

/**
 * Fetches a ledger for a specific date
 */
export async function getLedgerByDate(dateStr: string) {
  try {
    await connectToDatabase();
    const targetDate = startOfDay(new Date(dateStr));

    const ledger = await Ledger.findOne({
      date: {
        $gte: targetDate,
        $lte: endOfDay(targetDate),
      },
    }).lean();

    if (!ledger) return null;

    // Convert ObjectIds and Dates to primitive strings for Client Components
    return JSON.parse(JSON.stringify(ledger)) as ILedger;
  } catch (error) {
    console.error("Get Ledger Error:", error);
    return null;
  }
}

/**
 * Fetches aggregated statistics and chart data for a specific date range
 */
export async function getDashboardData(days: number = 30) {
  try {
    await connectToDatabase();
    
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));

    // Get all ledgers in the range, sorted by date
    const ledgers = await Ledger.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 }).lean();

    // Calculate overall stats
    let totalIncome = 0;
    let totalExpense = 0;
    let netProfit = 0;

    // Format chart data
    const chartData: DailyChartData[] = ledgers.map((ledger) => {
      totalIncome += ledger.totalIncome;
      totalExpense += ledger.totalExpense;
      netProfit += ledger.netProfit;

      return {
        date: new Date(ledger.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        income: ledger.totalIncome,
        expense: ledger.totalExpense,
        profit: ledger.netProfit,
      };
    });

    const stats: DashboardStats = {
      totalIncome,
      totalExpense,
      netProfit,
    };

    return { stats, chartData };
  } catch (error) {
    console.error("Get Dashboard Data Error:", error);
    return {
      stats: { totalIncome: 0, totalExpense: 0, netProfit: 0 },
      chartData: [],
    };
  }
}

/**
 * Deletes a ledger entry for a specific date
 */
export async function deleteLedger(dateStr: string) {
  try {
    await connectToDatabase();
    const targetDate = startOfDay(new Date(dateStr));
    
    const result = await Ledger.deleteOne({
      date: {
        $gte: targetDate,
        $lte: endOfDay(targetDate),
      },
    });

    if (result.deletedCount > 0) {
      revalidatePath("/");
      revalidatePath("/kayit");
      return { success: true, message: "Kayıt başarıyla silindi." };
    } else {
      return { success: false, error: "Silinecek kayıt bulunamadı." };
    }
  } catch (error: any) {
    console.error("Delete Ledger Error:", error);
    return { success: false, error: error.message || "Bilinmeyen bir hata oluştu" };
  }
}

export interface ReportStats {
  totalIncome: number;
  totalCashIncome: number;
  totalCreditCardIncome: number;
  totalExpense: number;
  totalHalExpense: number;
  totalOtherExpense: number;
  netProfit: number;
  categoryBreakdown: { category: string; amount: number }[];
}

/**
 * Fetches report statistics and daily ledger details for a custom date range
 */
export async function getReportData(startDateStr: string, endDateStr: string) {
  try {
    await connectToDatabase();
    
    const startDate = startOfDay(new Date(startDateStr));
    const endDate = endOfDay(new Date(endDateStr));

    const ledgers = await Ledger.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 }).lean();

    let totalCashIncome = 0;
    let totalCreditCardIncome = 0;
    let totalHalExpense = 0;
    let totalOtherExpense = 0;

    const categoryMap: { [key: string]: number } = {};

    ledgers.forEach((ledger) => {
      totalCashIncome += ledger.income?.cash || 0;
      totalCreditCardIncome += ledger.income?.creditCard || 0;
      totalHalExpense += ledger.hal || 0;

      ledger.expenses?.forEach((exp) => {
        const amt = exp.amount || 0;
        totalOtherExpense += amt;
        const cat = exp.category || "Diğer";
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      });
    });

    const totalIncome = totalCashIncome + totalCreditCardIncome;
    const totalExpense = totalHalExpense + totalOtherExpense;
    const netProfit = totalIncome - totalExpense;

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: categoryMap[cat],
    })).sort((a, b) => b.amount - a.amount);

    return {
      success: true,
      stats: {
        totalIncome,
        totalCashIncome,
        totalCreditCardIncome,
        totalExpense,
        totalHalExpense,
        totalOtherExpense,
        netProfit,
        categoryBreakdown,
      } as ReportStats,
      ledgers: JSON.parse(JSON.stringify(ledgers)) as ILedger[],
    };
  } catch (error: any) {
    console.error("Get Report Data Error:", error);
    return { success: false, error: error.message || "Bilinmeyen bir hata oluştu" };
  }
}

/**
 * Fetches the ledger entry for today's date
 */
export async function getTodayLedger() {
  try {
    await connectToDatabase();
    const today = startOfDay(new Date());

    const ledger = await Ledger.findOne({
      date: {
        $gte: today,
        $lte: endOfDay(today),
      },
    }).lean();

    if (!ledger) return null;

    return JSON.parse(JSON.stringify(ledger)) as ILedger;
  } catch (error) {
    console.error("Get Today Ledger Error:", error);
    return null;
  }
}
