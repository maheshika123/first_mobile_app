import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ExpensesStorage } from '@/services/ExpensesStorage';
import { BalanceSummary } from '@/types/expenses';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    isOverdue: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();

  const storage = ExpensesStorage.getInstance();

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setIsLoading(true);
    await storage.loadData();
    const summary = storage.getBalanceSummary(currentDate.getFullYear(), currentDate.getMonth());
    setBalanceSummary(summary);
    setIsLoading(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        
        <ThemedText type="title" style={styles.monthTitle}>
          {formatMonthYear(currentDate)}
        </ThemedText>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <IconSymbol name="chevron.right" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.balanceCard}>
        <ThemedText type="subtitle" style={styles.balanceLabel}>
          Current Balance
        </ThemedText>
        <ThemedText 
          type="title" 
          style={[
            styles.balanceAmount,
            { color: balanceSummary.isOverdue ? '#ff4444' : '#00aa00' }
          ]}
        >
          {formatCurrency(balanceSummary.balance)}
        </ThemedText>
        {balanceSummary.isOverdue && (
          <ThemedText style={styles.overdueText}>
            You are overdue by {formatCurrency(Math.abs(balanceSummary.balance))}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.summaryContainer}>
        <ThemedView style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
          <ThemedText style={[styles.summaryAmount, { color: '#00aa00' }]}>
            {formatCurrency(balanceSummary.totalIncome)}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Total Expenses</ThemedText>
          <ThemedText style={[styles.summaryAmount, { color: '#ff4444' }]}>
            {formatCurrency(balanceSummary.totalExpenses)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.navigationHint}>
        <ThemedText style={styles.hintText}>
          Use the Income and Expense tabs to add new transactions
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overdueText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationHint: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
