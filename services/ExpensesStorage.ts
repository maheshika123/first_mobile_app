import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, BalanceSummary, MonthlyData, Transaction } from '../types/expenses';

const STORAGE_KEY = 'expenses_app_data';

export class ExpensesStorage {
  private static instance: ExpensesStorage;
  private data: AppData = { monthlyData: [] };

  static getInstance(): ExpensesStorage {
    if (!ExpensesStorage.instance) {
      ExpensesStorage.instance = new ExpensesStorage();
    }
    return ExpensesStorage.instance;
  }

  async loadData(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  getMonthlyData(year: number, month: number): MonthlyData {
    const existing = this.data.monthlyData.find(
      m => m.year === year && m.month === month
    );
    
    if (existing) {
      return existing;
    }

    const newData: MonthlyData = {
      year,
      month,
      transactions: []
    };
    
    this.data.monthlyData.push(newData);
    return newData;
  }

  async addTransaction(year: number, month: number, transaction: Omit<Transaction, 'id'>): Promise<void> {
    const monthlyData = this.getMonthlyData(year, month);
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    monthlyData.transactions.push(newTransaction);
    await this.saveData();
  }

  async deleteTransaction(year: number, month: number, transactionId: string): Promise<void> {
    const monthlyData = this.getMonthlyData(year, month);
    monthlyData.transactions = monthlyData.transactions.filter(t => t.id !== transactionId);
    await this.saveData();
  }

  getBalanceSummary(year: number, month: number): BalanceSummary {
    const monthlyData = this.getMonthlyData(year, month);
    
    const totalIncome = monthlyData.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthlyData.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      isOverdue: balance < 0
    };
  }

  getAllTransactions(year: number, month: number): Transaction[] {
    const monthlyData = this.getMonthlyData(year, month);
    return monthlyData.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
