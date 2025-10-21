import CategoryDropdown from '@/components/CategoryDropdown';
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
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
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
    
    // Load available categories for income
    const categories = storage.getAllCategories('income');
    setAvailableCategories(categories);
    
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

  const handleAddCategory = async (newCategory: string) => {
    // Add the new category to available categories
    setAvailableCategories(prev => [...prev, newCategory].sort());
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
        <ThemedView style={[styles.transactionIcon, { backgroundColor: '#10b981' }]}>
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
        <ThemedText style={[styles.transactionAmount, { color: '#10b981' }]}>
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
          <IconSymbol name="folder" size={20} color="#10b981" />
        </ThemedView>
        <ThemedView style={styles.categoryDetails}>
          <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
          <ThemedText style={styles.categoryCount}>{item.count} transaction{item.count !== 1 ? 's' : ''}</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedText style={[styles.categoryTotal, { color: '#10b981' }]}>
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

      <ThemedView style={styles.summaryCard}>
        <ThemedText style={styles.summaryLabel}>Total Income</ThemedText>
        <ThemedText style={[styles.summaryAmount, { color: '#10b981' }]}>
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
            <CategoryDropdown
              value={category}
              onValueChange={setCategory}
              placeholder="e.g., Salary, Freelance, Business"
              categories={availableCategories}
              onAddCategory={handleAddCategory}
              type="income"
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
            style={[styles.submitButton, { backgroundColor: '#10b981' }]}
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
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    borderTopWidth: 4,
    borderTopColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#a0a0a0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  addButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addForm: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  formTitle: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#e0e0e0',
  },
  input: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    fontWeight: '500',
    color: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ffffff',
  },
  categoryCount: {
    fontSize: 13,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  categoryTotal: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#333333',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ffffff',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#808080',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2d1b1b',
    borderWidth: 1,
    borderColor: '#4a2a2a',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#ffffff',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#a0a0a0',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});

