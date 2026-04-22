import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { calculateBudgetPlan, calculateAdvancedBudgetPlan, analyzeBudget, BudgetPlan } from '../utils/budgetCalculator';
import { formatCurrencyDetailed } from '../utils/taxCalculator';
import { PieChart as PieChartIcon, TrendingUp, AlertTriangle, CheckCircle, Edit3, Save } from 'lucide-react';
import {
  useBudgetCustomization,
  DEFAULT_PERCENTAGES,
  type BudgetCategoryKey
} from '../hooks/useBudgetCustomization';

interface BudgetPlannerProps {
  monthlyIncome: number;
  age?: number;
}

export function BudgetPlanner({ monthlyIncome, age = 30 }: BudgetPlannerProps) {
  const [useAdvancedPlan, setUseAdvancedPlan] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const {
    isEditing,
    setIsEditing,
    customPercentages,
    totalCustomPercentage,
    resetCustomizationState,
    handlePercentageChange,
    getDisplayValue,
    saveCustomBudget,
    resetToDefault
  } = useBudgetCustomization();

  const standardPlan = calculateBudgetPlan(monthlyIncome);
  const advancedPlan = calculateAdvancedBudgetPlan(monthlyIncome, age);
  const budgetPlan = useAdvancedPlan ? advancedPlan : standardPlan;

  // Calculate custom budget based on editable percentages
  const getCustomBudgetPlan = (): BudgetPlan => {
    const needsPercentage = customPercentages.Needs || DEFAULT_PERCENTAGES.Needs;
    const wantsPercentage = customPercentages.Wants || DEFAULT_PERCENTAGES.Wants;
    const savingsPercentage = customPercentages.Savings || DEFAULT_PERCENTAGES.Savings;
    const needs = needsPercentage * monthlyIncome / 100;
    const wants = wantsPercentage * monthlyIncome / 100;
    const savings = savingsPercentage * monthlyIncome / 100;

    const categories = [
      {
        name: `Needs (${needsPercentage}%)`,
        percentage: needsPercentage,
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
        name: `Wants (${wantsPercentage}%)`,
        percentage: wantsPercentage,
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
        name: `Savings & Investments (${savingsPercentage}%)`,
        percentage: savingsPercentage,
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

  const recommendations = analyzeBudget(
    activeBudgetPlan.categories.reduce<{ [key: string]: number }>((acc, category) => {
      const key = category.name.startsWith('Needs')
        ? 'Needs'
        : category.name.startsWith('Wants')
          ? 'Wants'
          : 'Savings';
      acc[key] = category.amount;
      return acc;
    }, {}),
    monthlyIncome
  );
  const actionableRecommendations = recommendations.filter((rec) => rec.status !== 'good');

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

  const getPlanPercentages = (plan: BudgetPlan) => {
    const getPercentage = (prefix: string) =>
      plan.categories.find((category) => category.name.startsWith(prefix))?.percentage ?? 0;

    return {
      needs: getPercentage('Needs'),
      wants: getPercentage('Wants'),
      savings: getPercentage('Savings')
    };
  };

  const standardPercentages = getPlanPercentages(standardPlan);
  const advancedPercentages = getPlanPercentages(advancedPlan);
  const advancedDelta = {
    needs: advancedPercentages.needs - standardPercentages.needs,
    wants: advancedPercentages.wants - standardPercentages.wants,
    savings: advancedPercentages.savings - standardPercentages.savings
  };
  const isAdvancedDifferent =
    Math.abs(advancedDelta.needs) > 0.01 ||
    Math.abs(advancedDelta.wants) > 0.01 ||
    Math.abs(advancedDelta.savings) > 0.01;

  const advancedDrivers: string[] = [];
  if (monthlyIncome > 200000) {
    advancedDrivers.push('high income profile (> ₹2,00,000/month)');
  } else if (monthlyIncome < 50000) {
    advancedDrivers.push('lower income profile (< ₹50,000/month)');
  } else {
    advancedDrivers.push('mid income profile (₹50,000 - ₹2,00,000/month), so base split stays 50/30/20');
  }

  if (age < 25) {
    advancedDrivers.push('age below 25, so savings increase by 5% and wants reduce by 5%');
  } else if (age > 50) {
    advancedDrivers.push('age above 50, so savings increase by 10% and wants reduce by 10%');
  } else {
    advancedDrivers.push('age between 25 and 50, so no age-based adjustment');
  }

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
                  resetCustomizationState();
                }}
              >
                Standard
              </Button>
              <Button
                variant={useAdvancedPlan ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setUseAdvancedPlan(true);
                  resetCustomizationState();
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
          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
            {useAdvancedPlan ? (
              <span>
                Advanced is active: dynamic split based on income and age. Current split is
                {' '}
                <span className="font-medium">
                  Needs {advancedPercentages.needs}% / Wants {advancedPercentages.wants}% / Savings {advancedPercentages.savings}%
                </span>
                .
              </span>
            ) : (
              <span>
                Standard is active: fixed
                {' '}
                <span className="font-medium">
                  Needs {standardPercentages.needs}% / Wants {standardPercentages.wants}% / Savings {standardPercentages.savings}%
                </span>
                {' '}
                rule.
              </span>
            )}
            <div className="text-xs text-gray-500">
              {isAdvancedDifferent ? (
                <span>
                  Advanced vs Standard delta: Needs {advancedDelta.needs > 0 ? '+' : ''}{advancedDelta.needs}%,
                  Wants {advancedDelta.wants > 0 ? '+' : ''}{advancedDelta.wants}%,
                  Savings {advancedDelta.savings > 0 ? '+' : ''}{advancedDelta.savings}%.
                </span>
              ) : (
                <span>
                  Advanced currently gives the same split as Standard for your profile.
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Why: {advancedDrivers.join(' + ')}.
            </div>
          </div>

          {isEditing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-3">Custom Budget Allocation</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(DEFAULT_PERCENTAGES) as BudgetCategoryKey[]).map((category) => (
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
                      {formatCurrencyDetailed(((customPercentages[category] || DEFAULT_PERCENTAGES[category]) * monthlyIncome) / 100)}
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
                  <Button variant="outline" size="sm" onClick={resetToDefault}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={saveCustomBudget}>
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

          {/* Budget Recommendations */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Budget Recommendations</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {showRecommendations ? 'Hide' : 'Show'} Recommendations
              </Button>
            </div>

            {showRecommendations && (
              <div className="mt-6 space-y-3">
                <h5 className="font-medium text-gray-900">Actionable Recommendations</h5>
                {actionableRecommendations.length === 0 ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    Your current allocation is within recommended ranges. No changes needed.
                  </div>
                ) : (
                  actionableRecommendations.map((rec, index) => (
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
                          Current: {formatCurrencyDetailed(rec.currentAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Recommended: {formatCurrencyDetailed(rec.recommendedAmount)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
