import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { calculateBudgetPlan, calculateAdvancedBudgetPlan, analyzeBudget, BudgetPlan, BudgetRecommendation } from '../utils/budgetCalculator';
import { formatCurrency, formatCurrencyDetailed } from '../utils/taxCalculator';
import { PieChart as PieChartIcon, TrendingUp, AlertTriangle, CheckCircle, Edit3, Save } from 'lucide-react';

interface BudgetPlannerProps {
  monthlyIncome: number;
  age?: number;
}

interface SavedBudget {
  percentages: { [key: string]: number };
  timestamp: number;
}

export function BudgetPlanner({ monthlyIncome, age = 30 }: BudgetPlannerProps) {
  const [useAdvancedPlan, setUseAdvancedPlan] = useState(false);
  const [currentAllocations, setCurrentAllocations] = useState<{ [key: string]: number }>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customPercentages, setCustomPercentages] = useState<{ [key: string]: number }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  // Load saved budget on component mount
  useEffect(() => {
    const savedBudget = localStorage.getItem('savedBudget');
    if (savedBudget) {
      try {
        const parsed: SavedBudget = JSON.parse(savedBudget);
        setCustomPercentages(parsed.percentages);
        // Initialize input values for display
        const inputVals: { [key: string]: string } = {};
        Object.entries(parsed.percentages).forEach(([key, value]) => {
          inputVals[key] = value.toString();
        });
        setInputValues(inputVals);
      } catch (error) {
        console.error('Error loading saved budget:', error);
      }
    }
  }, []);

  const budgetPlan = useAdvancedPlan 
    ? calculateAdvancedBudgetPlan(monthlyIncome, age)
    : calculateBudgetPlan(monthlyIncome);

  // Calculate custom budget based on editable percentages
  const getCustomBudgetPlan = (): BudgetPlan => {
    const needs = (customPercentages.Needs || 50) * monthlyIncome / 100;
    const wants = (customPercentages.Wants || 30) * monthlyIncome / 100;
    const savings = (customPercentages.Savings || 20) * monthlyIncome / 100;

    const categories = [
      {
        name: `Needs (${customPercentages.Needs || 50}%)`,
        percentage: customPercentages.Needs || 50,
        amount: needs,
        color: "#ef4444",
        description: "Essential expenses like rent, utilities, groceries, insurance",
        subcategories: [
          "Rent/Mortgage",
          "Utilities (Electricity, Water, Gas)",
          "Groceries & Food",
          "Transportation",
          "Insurance (Health, Life, Vehicle)",
          "Basic Clothing",
          "Healthcare"
        ]
      },
      {
        name: `Wants (${customPercentages.Wants || 30}%)`,
        percentage: customPercentages.Wants || 30,
        amount: wants,
        color: "#f59e0b",
        description: "Non-essential expenses for lifestyle and entertainment",
        subcategories: [
          "Entertainment & Dining Out",
          "Shopping & Fashion",
          "Hobbies & Recreation",
          "Vacations & Travel",
          "Electronics & Gadgets",
          "Personal Care & Beauty"
        ]
      },
      {
        name: `Savings & Investments (${customPercentages.Savings || 20}%)`,
        percentage: customPercentages.Savings || 20,
        amount: savings,
        color: "#22c55e",
        description: "Emergency fund, investments, and financial goals",
        subcategories: [
          "Emergency Fund",
          "Retirement (EPF, NPS, Mutual Funds)",
          "Investment Portfolio",
          "Debt Repayment",
          "Financial Goals (House, Education)"
        ]
      }
    ];

    return {
      monthlyIncome,
      categories,
      totalAllocated: monthlyIncome,
      remaining: 0
    };
  };

  const activeBudgetPlan = isEditing ? getCustomBudgetPlan() : budgetPlan;

  const chartData = activeBudgetPlan.categories.map(category => ({
    name: category.name,
    value: category.amount,
    color: category.color
  }));

  const recommendations = analyzeBudget(currentAllocations, monthlyIncome);

  const handleAllocationChange = (category: string, amount: number) => {
    setCurrentAllocations(prev => ({
      ...prev,
      [category]: amount
    }));
  };

  const handlePercentageChange = (category: string, value: string) => {
    // Update input value for display
    setInputValues(prev => ({
      ...prev,
      [category]: value
    }));

    // Only update percentage if it's a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setCustomPercentages(prev => ({
        ...prev,
        [category]: numValue
      }));
    } else if (value === '' || value === '.') {
      // Allow empty or decimal point for better UX
      setCustomPercentages(prev => ({
        ...prev,
        [category]: 0
      }));
    }
  };

  const handleSaveCustomBudget = () => {
    // Save to localStorage
    const savedBudget: SavedBudget = {
      percentages: customPercentages,
      timestamp: Date.now()
    };
    localStorage.setItem('savedBudget', JSON.stringify(savedBudget));
    
    setIsEditing(false);
    // Show success message (you could add a toast notification here)
    alert('Budget saved successfully!');
  };

  const handleResetToDefault = () => {
    setCustomPercentages({});
    setInputValues({});
    localStorage.removeItem('savedBudget');
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const totalCustomPercentage = Object.values(customPercentages).reduce((sum, p) => sum + p, 0);

  // Get display value for input (show empty string if 0 and not in inputValues)
  const getDisplayValue = (category: string) => {
    if (inputValues[category] !== undefined) {
      return inputValues[category];
    }
    const defaultValue = category === 'Needs' ? 50 : category === 'Wants' ? 30 : 20;
    return customPercentages[category] || defaultValue;
  };

  return (
    <div className="space-y-6">
      <Card title="Budget Planner" subtitle="Plan your monthly budget allocation">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Monthly Income</h4>
              <p className="text-2xl font-bold text-primary-600">{formatCurrencyDetailed(monthlyIncome)}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={!useAdvancedPlan ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setUseAdvancedPlan(false);
                  setIsEditing(false);
                  setCustomPercentages({});
                  setInputValues({});
                }}
              >
                Standard (50/30/20)
              </Button>
              <Button
                variant={useAdvancedPlan ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setUseAdvancedPlan(true);
                  setIsEditing(false);
                  setCustomPercentages({});
                  setInputValues({});
                }}
              >
                Advanced
              </Button>
              <Button
                variant={isEditing ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Save className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
                {isEditing ? 'Save' : 'Customize'}
              </Button>
            </div>
          </div>

          {isEditing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-3">Custom Budget Allocation</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Needs', 'Wants', 'Savings'].map((category) => (
                  <div key={category} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {category} Percentage
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={getDisplayValue(category)}
                        onChange={(e) => handlePercentageChange(category, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrencyDetailed(((customPercentages[category] || (category === 'Needs' ? 50 : category === 'Wants' ? 30 : 20)) * monthlyIncome) / 100)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className={`font-medium ${totalCustomPercentage === 100 ? 'text-green-600' : totalCustomPercentage > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                    Total: {totalCustomPercentage.toFixed(1)}%
                  </span>
                  {totalCustomPercentage !== 100 && (
                    <span className="text-gray-500 ml-2">
                      {totalCustomPercentage > 100 ? 'Over allocated' : 'Under allocated'}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleResetToDefault}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSaveCustomBudget}>
                    Save Budget
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Chart */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Budget Allocation
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrencyDetailed(value), 'Amount']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget Categories */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Budget Categories</h4>
              <div className="space-y-3">
                {activeBudgetPlan.categories.map((category, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{category.name}</h5>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrencyDetailed(category.amount)}</div>
                        <div className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    {/* Subcategories */}
                    {category.subcategories && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Includes:</div>
                        <div className="grid grid-cols-1 gap-1">
                          {category.subcategories.map((subcategory, subIndex) => (
                            <div key={subIndex} className="text-xs text-gray-600 flex items-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                              {subcategory}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Allocation Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Custom Allocation</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {showRecommendations ? 'Hide' : 'Show'} Recommendations
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeBudgetPlan.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {category.name.split(' ')[0]} Allocation
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onChange={(e) => handleAllocationChange(category.name.split(' ')[0], parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>

            {showRecommendations && recommendations.length > 0 && (
              <div className="mt-6 space-y-3">
                <h5 className="font-medium text-gray-900">Budget Recommendations</h5>
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(rec.status)}
                      <div>
                        <div className="font-medium text-gray-900">{rec.category}</div>
                        <div className="text-sm text-gray-600">{rec.message}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrencyDetailed(rec.currentAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Recommended: {formatCurrencyDetailed(rec.recommendedAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
