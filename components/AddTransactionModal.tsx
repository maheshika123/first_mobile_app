import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ExpensesStorage } from '@/services/ExpensesStorage';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  year: number;
  month: number;
  onTransactionAdded: () => void;
}

export default function AddTransactionModal({
  visible,
  onClose,
  type,
  year,
  month,
  onTransactionAdded,
}: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const storage = ExpensesStorage.getInstance();

  const handleSubmit = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please fill in amount and category');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await storage.addTransaction(year, month, {
        amount: numericAmount,
        category: category.trim(),
        description: description.trim() || undefined,
        date: new Date().toISOString(),
        type,
      });

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      
      onTransactionAdded();
      onClose();
      Alert.alert('Success', `${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.modal}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Add {type === 'income' ? 'Income' : 'Expense'}
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color="#666" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.form}>
           <ThemedView style={styles.inputGroup}>
             <ThemedText style={styles.label}>Amount (LKR)</ThemedText>
             <TextInput
               style={styles.input}
               value={amount}
               onChangeText={setAmount}
               placeholder="0.00"
               keyboardType="numeric"
               autoFocus
             />
           </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder={type === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Groceries, Rent'}
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

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: type === 'income' ? '#00aa00' : '#ff4444' }
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    // backgroundColor set dynamically
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
