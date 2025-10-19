import AddTransactionModal from '@/components/AddTransactionModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ExpensesStorage } from '@/services/ExpensesStorage';
import { Transaction } from '@/types/expenses';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

export default function TransactionsScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const colorScheme = useColorScheme();

  const storage = ExpensesStorage.getInstance();

  useEffect(() => {
    loadTransactions();
  }, [currentDate]);

  const loadTransactions = async () => {
    setIsLoading(true);
    await storage.loadData();
    const monthlyTransactions = storage.getAllTransactions(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    setTransactions(monthlyTransactions);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setModalType(type);
    setShowAddModal(true);
  };

  const handleTransactionAdded = () => {
    loadTransactions(); // Refresh the data
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storage.deleteTransaction(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              transactionId
            );
            loadTransactions();
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <ThemedView style={styles.transactionItem}>
      <ThemedView style={styles.transactionLeft}>
        <ThemedView style={[
          styles.transactionIcon,
          { backgroundColor: item.type === 'income' ? '#00aa00' : '#ff4444' }
        ]}>
          <IconSymbol 
            name={item.type === 'income' ? 'plus' : 'minus'} 
            size={16} 
            color="white" 
          />
        </ThemedView>
        <ThemedView style={styles.transactionDetails}>
          <ThemedText style={styles.transactionCategory}>{item.category}</ThemedText>
          {item.description && (
            <ThemedText style={styles.transactionDescription}>{item.description}</ThemedText>
          )}
          <ThemedText style={styles.transactionDate}>{formatDate(item.date)}</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.transactionRight}>
        <ThemedText style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? '#00aa00' : '#ff4444' }
        ]}>
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </ThemedText>
        <TouchableOpacity
          onPress={() => handleDeleteTransaction(item.id)}
          style={styles.deleteButton}
        >
          <IconSymbol name="trash" size={16} color="#ff4444" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
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

      <ThemedView style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#00aa00' }]}
          onPress={() => handleAddTransaction('income')}
        >
          <IconSymbol name="plus" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Add Income</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
          onPress={() => handleAddTransaction('expense')}
        >
          <IconSymbol name="minus" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Add Expense</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {transactions.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="list.bullet" size={48} color="#ccc" />
          <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Add your first income or expense to get started
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          style={styles.transactionsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={modalType}
        year={currentDate.getFullYear()}
        month={currentDate.getMonth()}
        onTransactionAdded={handleTransactionAdded}
      />
    </ThemedView>
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
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
