import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense {
  category: string;
  amount: number;
  description?: string;
}

export interface ILedger extends Document {
  date: Date;
  income: {
    cash: number;
    creditCard: number;
  };
  expenses: IExpense[];
  hal: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String },
});

const LedgerSchema = new Schema<ILedger>(
  {
    date: { type: Date, required: true, unique: true },
    income: {
      cash: { type: Number, default: 0, min: 0 },
      creditCard: { type: Number, default: 0, min: 0 },
    },
    expenses: { type: [ExpenseSchema], default: [] },
    hal: { type: Number, default: 0, min: 0 },
    notes: { type: String },
    // Calculated fields stored in DB for fast querying and data integrity
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate totals automatically on the backend
LedgerSchema.pre("save", function () {
  const cash = this.income?.cash || 0;
  const creditCard = this.income?.creditCard || 0;
  this.totalIncome = cash + creditCard;

  const hal = this.hal || 0;
  this.totalExpense = this.expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0) + hal;
  
  this.netProfit = this.totalIncome - this.totalExpense;
});

if (mongoose.models.Ledger) {
  delete mongoose.models.Ledger;
}

const Ledger: Model<ILedger> = mongoose.model<ILedger>("Ledger", LedgerSchema);

export default Ledger;
