import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

interface ExpensePieChartProps {
  totalIncome: number;
  totalExpenses: number;
}

const screenWidth = Dimensions.get('window').width;
const chartSize = Math.min(screenWidth - 80, 280);

export default function ExpensePieChart({ totalIncome, totalExpenses }: ExpensePieChartProps) {
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
  const incomePercentage = totalAmount > 0 ? (totalIncome / totalAmount) * 100 : 0;
  const expensePercentage = totalAmount > 0 ? (totalExpenses / totalAmount) * 100 : 0;

  if (totalAmount === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <IconSymbol name="chart.pie" size={24} color="#a0a0a0" />
          <ThemedText style={styles.title}>Monthly Income vs Expenses</ThemedText>
        </ThemedView>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="chart.pie" size={48} color="#333333" />
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
        <IconSymbol name="chart.pie" size={24} color="#a0a0a0" />
        <ThemedText style={styles.title}>Monthly Income vs Expenses</ThemedText>
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        {/* Pie Chart using overlapping circles */}
        <ThemedView style={styles.pieChart}>
          {/* Background circle */}
          <ThemedView style={styles.backgroundCircle} />
          
          {/* Income segment - full circle with clipping */}
          {incomePercentage > 0 && (
            <ThemedView style={styles.segmentContainer}>
              <ThemedView
                style={[
                  styles.incomeSegment,
                  {
                    backgroundColor: '#22c55e',
                    transform: [{ rotate: '0deg' }],
                  },
                ]}
              />
            </ThemedView>
          )}
          
          {/* Expenses segment - positioned after income */}
          {expensePercentage > 0 && (
            <ThemedView style={styles.segmentContainer}>
              <ThemedView
                style={[
                  styles.expenseSegment,
                  {
                    backgroundColor: '#ef4444',
                    transform: [{ rotate: `${incomePercentage * 3.6}deg` }],
                  },
                ]}
              />
            </ThemedView>
          )}
          
          {/* Center circle with balance */}
          <ThemedView style={styles.centerCircle}>
            <ThemedText style={styles.centerText}>Balance</ThemedText>
            <ThemedText style={[
              styles.centerAmount,
              { color: totalIncome >= totalExpenses ? '#22c55e' : '#ef4444' }
            ]}>
              {formatCurrency(totalIncome - totalExpenses)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.legendContainer}>
        {/* Income Legend */}
        <ThemedView style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#22c55e' }]} />
          <ThemedView style={styles.legendTextContainer}>
            <ThemedText style={styles.legendName}>Income</ThemedText>
            <ThemedText style={styles.legendAmount}>
              {formatCurrency(totalIncome)} ({formatPercentage(totalIncome, totalAmount)}%)
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Expenses Legend */}
        <ThemedView style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <ThemedView style={styles.legendTextContainer}>
            <ThemedText style={styles.legendName}>Expenses</ThemedText>
            <ThemedText style={styles.legendAmount}>
              {formatCurrency(totalExpenses)} ({formatPercentage(totalExpenses, totalAmount)}%)
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
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChart: {
    width: chartSize,
    height: chartSize,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    width: chartSize,
    height: chartSize,
    borderRadius: chartSize / 2,
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#333333',
  },
  segmentContainer: {
    position: 'absolute',
    width: chartSize,
    height: chartSize,
    borderRadius: chartSize / 2,
    overflow: 'hidden',
  },
  incomeSegment: {
    position: 'absolute',
    width: chartSize,
    height: chartSize,
    borderRadius: chartSize / 2,
    opacity: 0.8,
  },
  expenseSegment: {
    position: 'absolute',
    width: chartSize,
    height: chartSize,
    borderRadius: chartSize / 2,
    opacity: 0.8,
  },
  centerCircle: {
    width: chartSize * 0.6,
    height: chartSize * 0.6,
    borderRadius: (chartSize * 0.6) / 2,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    zIndex: 10,
  },
  centerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  centerAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0a0a0',
  },
  legendContainer: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#a0a0a0',
    textAlign: 'right',
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