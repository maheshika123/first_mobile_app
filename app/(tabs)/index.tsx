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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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

      {/* Main Balance Card */}
      <ThemedView style={styles.balanceCard}>
        <ThemedView style={styles.balanceHeader}>
          <IconSymbol 
            name={balanceSummary.isOverdue ? "exclamationmark.triangle.fill" : "checkmark.circle.fill"} 
            size={28} 
            color={balanceSummary.isOverdue ? '#ef4444' : '#22c55e'} 
          />
          <ThemedText type="subtitle" style={styles.balanceLabel}>
            Current Balance
          </ThemedText>
        </ThemedView>
        <ThemedText 
          type="title" 
          style={[
            styles.balanceAmount,
            { color: balanceSummary.isOverdue ? '#ef4444' : '#22c55e' }
          ]}
        >
          {formatCurrency(balanceSummary.balance)}
        </ThemedText>
        {balanceSummary.isOverdue && (
          <ThemedView style={styles.overdueContainer}>
            <ThemedText style={styles.overdueText}>
              You are spending {formatCurrency(Math.abs(balanceSummary.balance))} more than you earn
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Financial Overview Cards */}
      <ThemedView style={styles.overviewContainer}>
        <ThemedView style={[styles.overviewCard, styles.incomeCard]}>
          <ThemedView style={styles.cardHeader}>
            <ThemedView style={styles.iconContainer}>
              <IconSymbol name="arrow.up.circle.fill" size={24} color="#22c55e" />
            </ThemedView>
            <ThemedView style={styles.cardContent}>
              <ThemedText style={styles.cardLabel}>Total Income</ThemedText>
              <ThemedText style={[styles.cardAmount, { color: '#22c55e' }]}>
                {formatCurrency(balanceSummary.totalIncome)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={[styles.overviewCard, styles.expenseCard]}>
          <ThemedView style={styles.cardHeader}>
            <ThemedView style={styles.iconContainer}>
              <IconSymbol name="arrow.down.circle.fill" size={24} color="#ef4444" />
            </ThemedView>
            <ThemedView style={styles.cardContent}>
              <ThemedText style={styles.cardLabel}>Total Expenses</ThemedText>
              <ThemedText style={[styles.cardAmount, { color: '#ef4444' }]}>
                {formatCurrency(balanceSummary.totalExpenses)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Quick Stats */}
      <ThemedView style={styles.statsContainer}>
        <ThemedText style={styles.statsTitle}>Quick Stats</ThemedText>
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {balanceSummary.totalIncome > 0 ? 
                Math.round((balanceSummary.totalExpenses / balanceSummary.totalIncome) * 100) : 0}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Expense Ratio</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {balanceSummary.totalIncome > 0 ? 
                Math.round((balanceSummary.balance / balanceSummary.totalIncome) * 100) : 0}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Savings Rate</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Action Cards */}
      <ThemedView style={styles.actionContainer}>
        <ThemedText style={styles.actionTitle}>Quick Actions</ThemedText>
        <ThemedView style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionCard, styles.addIncomeCard]}>
            <IconSymbol name="plus.circle.fill" size={32} color="#22c55e" />
            <ThemedText style={styles.actionText}>Add Income</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, styles.addExpenseCard]}>
            <IconSymbol name="minus.circle.fill" size={32} color="#ef4444" />
            <ThemedText style={styles.actionText}>Add Expense</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Navigation Hint */}
      <ThemedView style={styles.navigationHint}>
        <IconSymbol name="info.circle" size={20} color="#a0a0a0" />
        <ThemedText style={styles.hintText}>
          Use the Income and Expense tabs to manage your transactions
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  balanceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#a0a0a0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -1,
  },
  overdueContainer: {
    backgroundColor: '#2d1b1b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4a2a2a',
  },
  overdueText: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
    textAlign: 'center',
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  incomeCard: {
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  expenseCard: {
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0a0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0a0a0',
    textAlign: 'center',
  },
  actionContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  addIncomeCard: {
    backgroundColor: '#1a2a1a',
    borderColor: '#22c55e',
  },
  addExpenseCard: {
    backgroundColor: '#2a1a1a',
    borderColor: '#ef4444',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
  },
  navigationHint: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  hintText: {
    fontSize: 15,
    color: '#a0a0a0',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    flex: 1,
  },
});
