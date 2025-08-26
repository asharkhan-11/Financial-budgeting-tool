export interface BudgetCategory {
  name: string;
  percentage: number;
  amount: number;
  color: string;
  description: string;
  subcategories?: string[];
}

export interface BudgetPlan {
  monthlyIncome: number;
  categories: BudgetCategory[];
  totalAllocated: number;
  remaining: number;
}

export interface BudgetRecommendation {
  category: string;
  recommendedPercentage: number;
  recommendedAmount: number;
  currentPercentage: number;
  currentAmount: number;
  status: 'good' | 'warning' | 'danger';
  message: string;
}

// 50/30/20 Rule: 50% Needs, 30% Wants, 20% Savings
export function calculateBudgetPlan(monthlyIncome: number): BudgetPlan {
  const needs = monthlyIncome * 0.5;
  const wants = monthlyIncome * 0.3;
  const savings = monthlyIncome * 0.2;
  
  const categories: BudgetCategory[] = [
    {
      name: "Needs (50%)",
      percentage: 50,
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
      name: "Wants (30%)",
      percentage: 30,
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
      name: "Savings & Investments (20%)",
      percentage: 20,
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
}

// Alternative budget allocation for different income levels
export function calculateAdvancedBudgetPlan(monthlyIncome: number, age: number = 30): BudgetPlan {
  let needsPercentage = 50;
  let wantsPercentage = 30;
  let savingsPercentage = 20;
  
  // Adjust based on income level
  if (monthlyIncome > 200000) { // High income
    needsPercentage = 40;
    wantsPercentage = 25;
    savingsPercentage = 35;
  } else if (monthlyIncome < 50000) { // Low income
    needsPercentage = 70;
    wantsPercentage = 20;
    savingsPercentage = 10;
  }
  
  // Adjust based on age
  if (age < 25) {
    savingsPercentage += 5;
    wantsPercentage -= 5;
  } else if (age > 50) {
    savingsPercentage += 10;
    wantsPercentage -= 10;
  }
  
  const needs = monthlyIncome * (needsPercentage / 100);
  const wants = monthlyIncome * (wantsPercentage / 100);
  const savings = monthlyIncome * (savingsPercentage / 100);
  
  const categories: BudgetCategory[] = [
    {
      name: `Needs (${needsPercentage}%)`,
      percentage: needsPercentage,
      amount: needs,
      color: "#ef4444",
      description: "Essential expenses for basic living",
      subcategories: [
        "Housing (Rent/Mortgage)",
        "Utilities & Bills",
        "Food & Groceries",
        "Transportation",
        "Insurance Premiums",
        "Basic Healthcare",
        "Essential Clothing"
      ]
    },
    {
      name: `Wants (${wantsPercentage}%)`,
      percentage: wantsPercentage,
      amount: wants,
      color: "#f59e0b",
      description: "Lifestyle and discretionary spending",
      subcategories: [
        "Entertainment & Recreation",
        "Dining Out & Food Delivery",
        "Shopping & Personal Care",
        "Hobbies & Interests",
        "Travel & Vacations",
        "Technology & Gadgets"
      ]
    },
    {
      name: `Savings & Investments (${savingsPercentage}%)`,
      percentage: savingsPercentage,
      amount: savings,
      color: "#22c55e",
      description: "Building wealth and financial security",
      subcategories: [
        "Emergency Fund (3-6 months expenses)",
        "Retirement Planning (EPF, NPS)",
        "Mutual Funds & Stocks",
        "Fixed Deposits & Bonds",
        "Real Estate Investment",
        "Education & Skill Development"
      ]
    }
  ];
  
  return {
    monthlyIncome,
    categories,
    totalAllocated: monthlyIncome,
    remaining: 0
  };
}

export function analyzeBudget(currentAllocations: { [key: string]: number }, monthlyIncome: number): BudgetRecommendation[] {
  const recommendations: BudgetRecommendation[] = [];
  
  const totalAllocated = Object.values(currentAllocations).reduce((sum, amount) => sum + amount, 0);
  const remaining = monthlyIncome - totalAllocated;
  
  // Check if total allocation is within reasonable range
  if (totalAllocated > monthlyIncome * 1.1) {
    recommendations.push({
      category: "Overall Budget",
      recommendedPercentage: 100,
      recommendedAmount: monthlyIncome,
      currentPercentage: (totalAllocated / monthlyIncome) * 100,
      currentAmount: totalAllocated,
      status: "danger",
      message: "You're overspending by " + formatCurrencyDetailed(totalAllocated - monthlyIncome)
    });
  }
  
  // Check individual categories
  const idealAllocations = {
    "Needs": { min: 40, max: 60, ideal: 50 },
    "Wants": { min: 20, max: 40, ideal: 30 },
    "Savings": { min: 10, max: 40, ideal: 20 }
  };
  
  Object.entries(currentAllocations).forEach(([category, amount]) => {
    const percentage = (amount / monthlyIncome) * 100;
    const ideal = idealAllocations[category as keyof typeof idealAllocations];
    
    if (ideal) {
      let status: 'good' | 'warning' | 'danger' = 'good';
      let message = "Good allocation";
      
      if (percentage < ideal.min) {
        status = percentage < ideal.min * 0.5 ? 'danger' : 'warning';
        message = `Consider increasing ${category.toLowerCase()} allocation`;
      } else if (percentage > ideal.max) {
        status = percentage > ideal.max * 1.5 ? 'danger' : 'warning';
        message = `Consider reducing ${category.toLowerCase()} allocation`;
      }
      
      recommendations.push({
        category,
        recommendedPercentage: ideal.ideal,
        recommendedAmount: monthlyIncome * (ideal.ideal / 100),
        currentPercentage: percentage,
        currentAmount: amount,
        status,
        message
      });
    }
  });
  
  return recommendations;
}

// Custom Indian numbering system formatter
function formatIndianNumber(num: number): string {
  if (num === 0) return '0';
  
  // Round to 2 decimal places
  const roundedNum = Math.round(num * 100) / 100;
  const numStr = Math.abs(roundedNum).toString();
  const [wholePart, decimalPart] = numStr.split('.');
  
  // Indian numbering system: last 3 digits, then groups of 2
  let formatted = '';
  const len = wholePart.length;
  
  if (len <= 3) {
    formatted = wholePart;
  } else {
    // Handle the last 3 digits
    formatted = wholePart.slice(-3);
    
    // Handle the remaining digits in groups of 2
    for (let i = len - 3; i > 0; i -= 2) {
      const start = Math.max(0, i - 2);
      const group = wholePart.slice(start, i);
      formatted = group + ',' + formatted;
    }
  }
  
  // Add decimal part if exists (up to 2 decimal places)
  if (decimalPart) {
    formatted += '.' + decimalPart.padEnd(2, '0').slice(0, 2);
  }
  
  return formatted;
}

function formatCurrencyDetailed(amount: number): string {
  if (amount === 0) return '₹0';
  
  const formatted = formatIndianNumber(amount);
  return `₹${formatted}`;
}
