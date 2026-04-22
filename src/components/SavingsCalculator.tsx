import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrencyDetailed } from '../utils/taxCalculator';
import { Target, PiggyBank, TrendingUp } from 'lucide-react';

interface SavingsGoal {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  expectedReturn: number;
}

const DEFAULT_EXPECTED_RETURN = 8;

export function SavingsCalculator({ monthlyIncome }: { monthlyIncome: number }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [newGoal, setNewGoal] = useState<Partial<SavingsGoal>>({});
  const [showAddGoal, setShowAddGoal] = useState(false);

  const addGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.targetDate) {
      const goal: SavingsGoal = {
        name: newGoal.name,
        targetAmount: newGoal.targetAmount || 0,
        currentAmount: newGoal.currentAmount || 0,
        targetDate: newGoal.targetDate,
        monthlyContribution: newGoal.monthlyContribution || 0,
        expectedReturn: newGoal.expectedReturn || DEFAULT_EXPECTED_RETURN
      };
      
      setGoals((prev) => [...prev, goal]);
      setNewGoal({});
      setShowAddGoal(false);
    }
  };

  const calculateTimeToGoal = (goal: SavingsGoal) => {
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthlyRate = goal.expectedReturn / 12 / 100;
    
    if (goal.monthlyContribution <= 0) return Infinity;
    
    // Solves for `n` in future value of monthly SIP contributions.
    const months = Math.log(1 + (remainingAmount * monthlyRate) / goal.monthlyContribution) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
  };

  const calculateRequiredContribution = (goal: SavingsGoal) => {
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const targetDate = new Date(goal.targetDate);
    const currentDate = new Date();
    const monthsRemaining = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                           (targetDate.getMonth() - currentDate.getMonth());
    
    if (monthsRemaining <= 0) return remainingAmount;
    
    const monthlyRate = goal.expectedReturn / 12 / 100;
    // Rearranged SIP future value formula to compute monthly contribution.
    const requiredContribution = (remainingAmount * monthlyRate) / 
                                (Math.pow(1 + monthlyRate, monthsRemaining) - 1);
    
    return Math.max(0, requiredContribution);
  };

  const totalMonthlySavings = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const savingsPercentage = monthlyIncome > 0 ? (totalMonthlySavings / monthlyIncome) * 100 : 0;

  return (
    <Card title="Savings & Investment Planner" subtitle="Plan your financial goals and investments">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <PiggyBank className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-sm text-green-600 font-medium">Total Monthly Savings</div>
                <div className="text-xl font-bold text-green-900">{formatCurrencyDetailed(totalMonthlySavings)}</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-blue-600 font-medium">Savings Rate</div>
                <div className="text-xl font-bold text-blue-900">{savingsPercentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <div className="text-sm text-purple-600 font-medium">Active Goals</div>
                <div className="text-xl font-bold text-purple-900">{goals.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Goal Button */}
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-900">Financial Goals</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddGoal(!showAddGoal)}
          >
            {showAddGoal ? 'Cancel' : 'Add Goal'}
          </Button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Goal Name"
                placeholder="e.g., House Down Payment"
                value={newGoal.name || ''}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
              <Input
                label="Target Amount"
                type="number"
                placeholder="Enter target amount"
                value={newGoal.targetAmount || ''}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Current Amount"
                type="number"
                placeholder="Current savings"
                value={newGoal.currentAmount || ''}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Target Date"
                type="date"
                value={newGoal.targetDate || ''}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
              <Input
                label="Monthly Contribution"
                type="number"
                placeholder="Monthly savings"
                value={newGoal.monthlyContribution || ''}
                onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Expected Return (%)"
                type="number"
                placeholder="Annual return rate"
                value={newGoal.expectedReturn || ''}
                onChange={(e) => setNewGoal({ ...newGoal, expectedReturn: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={addGoal} className="w-full">
              Add Goal
            </Button>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const timeToGoal = calculateTimeToGoal(goal);
            const requiredContribution = calculateRequiredContribution(goal);
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">{goal.name}</h5>
                    <p className="text-sm text-gray-600">
                      Target: {formatCurrencyDetailed(goal.targetAmount)} by {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrencyDetailed(goal.currentAmount)} / {formatCurrencyDetailed(goal.targetAmount)}
                    </div>
                    <div className="text-xs text-gray-500">{progress.toFixed(1)}% complete</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Monthly Contribution</div>
                    <div className="font-medium">{formatCurrencyDetailed(goal.monthlyContribution)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Required Contribution</div>
                    <div className="font-medium">{formatCurrencyDetailed(requiredContribution)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time to Goal</div>
                    <div className="font-medium">
                      {timeToGoal === Infinity ? 'Not achievable' : `${timeToGoal} months`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Investment Recommendations */}
        {goals.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-3">Investment Recommendations</h5>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                Emergency Fund: Aim for 3-6 months of expenses
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                Short-term goals (1-3 years): Fixed deposits, liquid funds
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                Long-term goals (5+ years): Equity mutual funds, stocks
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                Retirement: EPF, NPS, and diversified portfolio
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
