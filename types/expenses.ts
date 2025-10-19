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
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  isOverdue: boolean;
}
