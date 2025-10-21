export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: string; // ISO date string
  type: 'income' | 'expense';
}

export interface MonthlyData {
  year: number;
  month: number; // 0-11 (JavaScript month format)
  transactions: Transaction[];
}

export interface AppData {
  monthlyData: MonthlyData[];
  recurring?: RecurringTransaction[];
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  isOverdue: boolean;
}

export type RecurringFrequency = 'monthly' | 'weekly';

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  type: 'income' | 'expense';
  frequency: RecurringFrequency;
  nextRunISO: string; // ISO date when the next occurrence should be posted
  // Optional scheduling helpers
  dayOfMonth?: number; // for monthly scheduling
  dayOfWeek?: number;  // 0-6 for weekly if needed later
  active: boolean;
}
