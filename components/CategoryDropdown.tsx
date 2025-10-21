import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

interface CategoryDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  categories: string[];
  onAddCategory: (category: string) => void;
  type: 'income' | 'expense';
}

export default function CategoryDropdown({
  value,
  onValueChange,
  placeholder = 'Select a category',
  categories,
  onAddCategory,
  type,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleSelectCategory = (category: string) => {
    onValueChange(category);
    setIsOpen(false);
  };

  const handleAddNewCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const trimmedCategory = newCategory.trim();
    if (categories.includes(trimmedCategory)) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    onAddCategory(trimmedCategory);
    onValueChange(trimmedCategory);
    setNewCategory('');
    setShowAddForm(false);
    setIsOpen(false);
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleSelectCategory(item)}
    >
      <ThemedText style={styles.categoryText}>{item}</ThemedText>
    </TouchableOpacity>
  );

  const renderAddCategoryForm = () => (
    <ThemedView style={styles.addCategoryForm}>
      <ThemedText style={styles.addCategoryTitle}>Add New Category</ThemedText>
      <TextInput
        style={styles.addCategoryInput}
        value={newCategory}
        onChangeText={setNewCategory}
        placeholder={`e.g., ${type === 'income' ? 'Salary, Freelance' : 'Groceries, Rent'}`}
        autoFocus
      />
      <ThemedView style={styles.addCategoryButtons}>
        <TouchableOpacity
          style={styles.addCategoryCancelButton}
          onPress={() => {
            setShowAddForm(false);
            setNewCategory('');
          }}
        >
          <ThemedText style={styles.addCategoryCancelText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addCategorySubmitButton}
          onPress={handleAddNewCategory}
        >
          <ThemedText style={styles.addCategorySubmitText}>Add</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <ThemedText style={[styles.dropdownText, !value && styles.placeholderText]}>
          {value || placeholder}
        </ThemedText>
        <IconSymbol name="chevron.down" size={20} color="#a0a0a0" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsOpen(false)}
              >
                <IconSymbol name="xmark" size={20} color="#a0a0a0" />
              </TouchableOpacity>
            </ThemedView>

            {showAddForm ? (
              renderAddCategoryForm()
            ) : (
              <>
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item}
                  style={styles.categoriesList}
                  showsVerticalScrollIndicator={false}
                />
                
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={() => setShowAddForm(true)}
                >
                  <IconSymbol name="plus" size={16} color="#10b981" />
                  <ThemedText style={styles.addNewText}>Add New Category</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
  },
  placeholderText: {
    color: '#a0a0a0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  categoriesList: {
    maxHeight: 300,
  },
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1a2a1a',
    borderWidth: 1,
    borderColor: '#10b981',
    marginTop: 12,
    gap: 8,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  addCategoryForm: {
    paddingTop: 10,
  },
  addCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  addCategoryInput: {
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 20,
  },
  addCategoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addCategoryCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  addCategoryCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a0a0a0',
  },
  addCategorySubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  addCategorySubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
