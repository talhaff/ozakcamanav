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
    
    const { date, income, expenses, notes } = parsedData.data;
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
      ledger.notes = notes;
      await ledger.save(); // pre-save hook will recalculate totals
    } else {
      // Create new
      ledger = new Ledger({
        date: targetDate,
        income,
        expenses,
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
