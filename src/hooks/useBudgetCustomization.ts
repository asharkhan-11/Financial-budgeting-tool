import { useEffect, useState } from 'react';

export const DEFAULT_PERCENTAGES = {
  Needs: 50,
  Wants: 30,
  Savings: 20
} as const;

export type BudgetCategoryKey = keyof typeof DEFAULT_PERCENTAGES;

interface SavedBudget {
  percentages: Record<string, number>;
  timestamp: number;
}

const STORAGE_KEY = 'savedBudget';

export function useBudgetCustomization() {
  const [isEditing, setIsEditing] = useState(false);
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedBudget = localStorage.getItem(STORAGE_KEY);
    if (!savedBudget) {
      return;
    }

    try {
      const parsed: SavedBudget = JSON.parse(savedBudget);
      setCustomPercentages(parsed.percentages);

      const inputVals: Record<string, string> = {};
      Object.entries(parsed.percentages).forEach(([key, value]) => {
        inputVals[key] = value.toString();
      });
      setInputValues(inputVals);
    } catch (error) {
      console.error('Error loading saved budget:', error);
    }
  }, []);

  const resetCustomizationState = () => {
    setIsEditing(false);
    setCustomPercentages({});
    setInputValues({});
  };

  const handlePercentageChange = (category: BudgetCategoryKey, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [category]: value
    }));

    const numValue = parseFloat(value);
    if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setCustomPercentages((prev) => ({
        ...prev,
        [category]: numValue
      }));
    } else if (value === '' || value === '.') {
      setCustomPercentages((prev) => ({
        ...prev,
        [category]: 0
      }));
    }
  };

  const getDisplayValue = (category: BudgetCategoryKey): string | number => {
    if (inputValues[category] !== undefined) {
      return inputValues[category];
    }
    return customPercentages[category] || DEFAULT_PERCENTAGES[category];
  };

  const saveCustomBudget = () => {
    const savedBudget: SavedBudget = {
      percentages: customPercentages,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBudget));
    setIsEditing(false);
    alert('Budget saved successfully!');
  };

  const resetToDefault = () => {
    resetCustomizationState();
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    isEditing,
    setIsEditing,
    customPercentages,
    totalCustomPercentage: Object.values(customPercentages).reduce((sum, p) => sum + p, 0),
    resetCustomizationState,
    handlePercentageChange,
    getDisplayValue,
    saveCustomBudget,
    resetToDefault
  };
}
