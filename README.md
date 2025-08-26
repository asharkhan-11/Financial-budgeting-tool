# Financial Budgeting Tool

A comprehensive financial planning application that helps you calculate your take-home salary, plan your monthly budget, and set financial goals. Built with React, TypeScript, and modern web technologies.

## Features

### 💰 Income Calculator
- **CTC to Take-Home Calculator**: Convert your Cost to Company (CTC) to monthly take-home salary
- **Tax Calculation**: Automatic tax calculation based on Indian tax slabs (FY 2025-26 New Tax Regime)
- **Tax Breakdown**: Detailed breakdown of tax liability across different tax slabs
- **Effective Tax Rate**: Shows your effective tax rate for better financial planning
- **Indian Numbering System**: All amounts displayed in Indian format (₹1,00,000)

### 📊 Budget Planner
- **50/30/20 Rule**: Standard budget allocation (50% Needs, 30% Wants, 20% Savings)
- **Advanced Planning**: Customized budget allocation based on income level and age
- **Interactive Charts**: Visual representation of budget allocation using pie charts
- **Budget Recommendations**: Smart recommendations for optimal budget allocation
- **Custom Allocation**: Ability to set custom budget allocations and get feedback

### 🎯 Savings & Investment Planner
- **Goal Setting**: Set multiple financial goals with target amounts and dates
- **Progress Tracking**: Visual progress bars and completion percentages
- **Time to Goal**: Calculate how long it will take to reach your goals
- **Required Contributions**: Determine monthly contributions needed to reach goals
- **Investment Recommendations**: Tailored investment advice based on goal timelines

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd "Financial budgeting tool"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Building for Production
```bash
npm run build
```

## How to Use

### Step 1: Calculate Your Income
1. Go to the "Income Calculator" tab
2. Enter your annual CTC (Cost to Company)
3. Enter your age (used for advanced budget planning)
4. Click "Calculate Income & Tax"
5. Review your tax breakdown and monthly take-home salary

### Step 2: Plan Your Budget
1. Navigate to the "Budget Planner" tab
2. Choose between Standard (50/30/20) or Advanced budget allocation
3. Review the visual budget breakdown
4. Set custom allocations if needed
5. View budget recommendations for optimization

### Step 3: Set Financial Goals
1. Go to the "Savings & Goals" tab
2. Click "Add Goal" to create a new financial goal
3. Enter goal details:
   - Goal name (e.g., "House Down Payment")
   - Target amount
   - Current savings
   - Target date
   - Monthly contribution
   - Expected return rate
4. Track your progress and get investment recommendations

## Tax Calculation Details

The application uses the Indian tax slabs for FY 2025-26 (New Tax Regime):

| Income Range | Tax Rate |
|--------------|----------|
| Up to ₹3 Lakhs | 0% |
| ₹3 Lakhs to ₹6 Lakhs | 5% |
| ₹6 Lakhs to ₹9 Lakhs | 10% |
| ₹9 Lakhs to ₹12 Lakhs | 15% |
| ₹12 Lakhs to ₹15 Lakhs | 20% |
| Above ₹15 Lakhs | 30% |

**Standard Deduction**: ₹50,000

## Indian Numbering System

All monetary values are displayed using the Indian numbering system:
- **Thousands**: ₹1,000 (one thousand)
- **Lakhs**: ₹1,00,000 (one lakh)
- **Crores**: ₹1,00,00,000 (one crore)

Examples:
- ₹5,00,000 (5 lakhs)
- ₹10,00,000 (10 lakhs)
- ₹1,00,00,000 (1 crore)

## Budget Allocation Guidelines

### Standard 50/30/20 Rule
- **50% - Needs**: Essential expenses (rent, utilities, groceries, insurance)
- **30% - Wants**: Lifestyle expenses (entertainment, dining, shopping)
- **20% - Savings**: Emergency fund, investments, debt repayment

### Advanced Allocation
The tool adjusts allocations based on:
- **Income Level**: Higher income allows for more savings
- **Age**: Younger individuals can save more, older individuals may need more for needs
- **Financial Goals**: Customized based on your specific objectives

## Investment Recommendations

### Emergency Fund
- **Target**: 3-6 months of expenses
- **Investment**: High-yield savings account, liquid funds

### Short-term Goals (1-3 years)
- **Investment**: Fixed deposits, liquid funds, short-term debt funds

### Long-term Goals (5+ years)
- **Investment**: Equity mutual funds, stocks, real estate

### Retirement Planning
- **Investment**: EPF, NPS, diversified portfolio

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Export Data**: Download your budget plan as JSON
- **Share Functionality**: Share your budget summary
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Real-time Calculations**: Instant updates as you modify inputs
- **Visual Charts**: Interactive pie charts for budget visualization
- **Indian Formatting**: All amounts displayed in Indian numbering system

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## File Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── IncomeCalculator.tsx
│   ├── BudgetPlanner.tsx
│   └── SavingsCalculator.tsx
├── utils/
│   ├── taxCalculator.ts    # Tax calculation logic
│   └── budgetCalculator.ts # Budget planning logic
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Improving documentation
- Submitting pull requests

## Disclaimer

This tool is for educational and planning purposes only. The tax calculations are based on current Indian tax laws but may not account for all deductions and exemptions. Please consult with a qualified financial advisor or tax professional for personalized advice.

## License

This project is licensed under the MIT License.

---

**Happy Budgeting! 💰📊🎯**
