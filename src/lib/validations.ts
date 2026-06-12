import { z } from "zod";

export const expenseSchema = z.object({
  category: z.string().min(1, "Kategori seçimi zorunludur."),
  amount: z.coerce.number().min(0, "Gider tutarı 0 veya daha büyük olmalıdır."),
  description: z.string().optional(),
});

export const ledgerFormSchema = z.object({
  date: z.date({
    message: "Tarih seçimi zorunludur.",
  }),
  income: z.object({
    cash: z.coerce.number().min(0, "Nakit gelir 0 veya daha büyük olmalıdır."),
    creditCard: z.coerce.number().min(0, "Kredi kartı geliri 0 veya daha büyük olmalıdır."),
  }),
  expenses: z.array(expenseSchema),
  notes: z.string().optional(),
});

export type LedgerFormValues = z.infer<typeof ledgerFormSchema>;
