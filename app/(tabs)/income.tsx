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
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

export default function IncomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [incomeTransactions, setIncomeTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colorScheme = useColorScheme();

  const storage = ExpensesStorage.getInstance();

  useEffect(() => {
    loadIncomeTransactions();
  }, [currentDate]);

  const loadIncomeTransactions = async () => {
    setIsLoading(true);
    await storage.loadData();
    const allTransactions = storage.getAllTransactions(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    const incomeOnly = allTransactions.filter(t => t.type === 'income');
    setIncomeTransactions(incomeOnly);
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

  const handleAddIncome = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please fill in amount and category');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await storage.addTransaction(currentDate.getFullYear(), currentDate.getMonth(), {
        amount: numericAmount,
        category: category.trim(),
        description: description.trim() || undefined,
        date: new Date().toISOString(),
        type: 'income',
      });

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setShowAddForm(false);
      
      loadIncomeTransactions();
      Alert.alert('Success', 'Income added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add income');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = (transactionId: string) => {
    Alert.alert(
      'Delete Income',
      'Are you sure you want to delete this income entry?',
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
            loadIncomeTransactions();
          },
        },
      ]
    );
  };

  const getTotalIncome = () => {
    return incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getCategories = () => {
    const categories = incomeTransactions.map(t => t.category);
    const uniqueCategories = [...new Set(categories)];
    return uniqueCategories.map(category => ({
      name: category,
      total: incomeTransactions
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0),
      count: incomeTransactions.filter(t => t.category === category).length
    }));
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <ThemedView style={styles.transactionItem}>
      <ThemedView style={styles.transactionLeft}>
        <ThemedView style={[styles.transactionIcon, { backgroundColor: '#00aa00' }]}>
          <IconSymbol name="plus" size={16} color="white" />
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
        <ThemedText style={[styles.transactionAmount, { color: '#00aa00' }]}>
          +{formatCurrency(item.amount)}
        </ThemedText>
        <TouchableOpacity
          onPress={() => handleDeleteIncome(item.id)}
          style={styles.deleteButton}
        >
          <IconSymbol name="trash" size={16} color="#ff4444" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderCategory = ({ item }: { item: { name: string; total: number; count: number } }) => (
    <ThemedView style={styles.categoryItem}>
      <ThemedView style={styles.categoryLeft}>
        <ThemedView style={styles.categoryIcon}>
          <IconSymbol name="folder" size={20} color="#00aa00" />
        </ThemedView>
        <ThemedView style={styles.categoryDetails}>
          <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
          <ThemedText style={styles.categoryCount}>{item.count} transaction{item.count !== 1 ? 's' : ''}</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedText style={[styles.categoryTotal, { color: '#00aa00' }]}>
        {formatCurrency(item.total)}
      </ThemedText>
    </ThemedView>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const categories = getCategories();

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

      <ThemedView style={styles.summaryCard}>
        <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
        <ThemedText style={[styles.summaryAmount, { color: '#00aa00' }]}>
          {formatCurrency(getTotalIncome())}
        </ThemedText>
      </ThemedView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddForm(!showAddForm)}
      >
        <IconSymbol name="plus" size={20} color="white" />
        <ThemedText style={styles.addButtonText}>
          {showAddForm ? 'Cancel' : 'Add Income'}
        </ThemedText>
      </TouchableOpacity>

      {showAddForm && (
        <ThemedView style={styles.addForm}>
          <ThemedText type="subtitle" style={styles.formTitle}>Add New Income</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Amount (LKR)</ThemedText>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Salary, Freelance, Business"
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description (Optional)</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a note..."
              multiline
              numberOfLines={3}
            />
          </ThemedView>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#00aa00' }]}
            onPress={handleAddIncome}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Income'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {categories.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Categories</ThemedText>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.name}
            scrollEnabled={false}
          />
        </ThemedView>
      )}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Income Transactions</ThemedText>
        {incomeTransactions.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="plus.circle" size={48} color="#ccc" />
            <ThemedText style={styles.emptyText}>No income recorded yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Add your first income entry to get started
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={incomeTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
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
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#00aa00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addForm: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
