import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

interface IncomeExpenseBarChartProps {
  totalIncome: number;
  totalExpenses: number;
}

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80;
const maxBarHeight = 200;

export default function IncomeExpenseBarChart({ totalIncome, totalExpenses }: IncomeExpenseBarChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatPercentage = (amount: number, total: number) => {
    if (total === 0) return '0.0';
    return ((amount / total) * 100).toFixed(1);
  };

  const totalAmount = totalIncome + totalExpenses;
  const maxValue = Math.max(totalIncome, totalExpenses);
  
  // Calculate bar heights (minimum 20px for visibility)
  const incomeBarHeight = maxValue > 0 ? Math.max((totalIncome / maxValue) * maxBarHeight, 20) : 20;
  const expenseBarHeight = maxValue > 0 ? Math.max((totalExpenses / maxValue) * maxBarHeight, 20) : 20;

  if (totalAmount === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <IconSymbol name="chart.bar" size={24} color="#a0a0a0" />
          <ThemedText style={styles.title}>Monthly Income vs Expenses</ThemedText>
        </ThemedView>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="chart.bar" size={48} color="#333333" />
          <ThemedText style={styles.emptyText}>No transactions to display</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Add some income and expenses to see the comparison
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="chart.bar" size={24} color="#a0a0a0" />
        <ThemedText style={styles.title}>Monthly Income vs Expenses</ThemedText>
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        {/* Bar Chart */}
        <ThemedView style={styles.barChart}>
          {/* Income Bar */}
          <ThemedView style={styles.barGroup}>
            <ThemedView style={styles.barLabelContainer}>
              <IconSymbol name="arrow.up.circle.fill" size={20} color="#22c55e" />
              <ThemedText style={styles.barLabel}>Income</ThemedText>
            </ThemedView>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={styles.barTrack}>
                <ThemedView
                  style={[
                    styles.barFill,
                    {
                      height: incomeBarHeight,
                      backgroundColor: '#22c55e',
                    },
                  ]}
                />
              </ThemedView>
              <ThemedView style={styles.barValueContainer}>
                <ThemedText style={[styles.barValue, { color: '#22c55e' }]}>
                  {formatCurrency(totalIncome)}
                </ThemedText>
                <ThemedText style={styles.barPercentage}>
                  {formatPercentage(totalIncome, totalAmount)}%
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Expenses Bar */}
          <ThemedView style={styles.barGroup}>
            <ThemedView style={styles.barLabelContainer}>
              <IconSymbol name="arrow.down.circle.fill" size={20} color="#ef4444" />
              <ThemedText style={styles.barLabel}>Expenses</ThemedText>
            </ThemedView>
            <ThemedView style={styles.barContainer}>
              <ThemedView style={styles.barTrack}>
                <ThemedView
                  style={[
                    styles.barFill,
                    {
                      height: expenseBarHeight,
                      backgroundColor: '#ef4444',
                    },
                  ]}
                />
              </ThemedView>
              <ThemedView style={styles.barValueContainer}>
                <ThemedText style={[styles.barValue, { color: '#ef4444' }]}>
                  {formatCurrency(totalExpenses)}
                </ThemedText>
                <ThemedText style={styles.barPercentage}>
                  {formatPercentage(totalExpenses, totalAmount)}%
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Summary */}
        <ThemedView style={styles.summaryContainer}>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#22c55e' }]}>
              {formatCurrency(totalIncome)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Total Expenses</ThemedText>
            <ThemedText style={[styles.summaryValue, { color: '#ef4444' }]}>
              {formatCurrency(totalExpenses)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={[styles.summaryItem, styles.balanceItem]}>
            <ThemedText style={styles.summaryLabel}>Balance</ThemedText>
            <ThemedText style={[
              styles.summaryValue,
              { color: totalIncome >= totalExpenses ? '#22c55e' : '#ef4444' }
            ]}>
              {formatCurrency(totalIncome - totalExpenses)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  chartContainer: {
    gap: 20,
  },
  barChart: {
    gap: 24,
  },
  barGroup: {
    gap: 12,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  barTrack: {
    width: 60,
    height: maxBarHeight,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    minHeight: 20,
  },
  barValueContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  barPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a0a0a0',
  },
  summaryContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceItem: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#ffffff',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});
