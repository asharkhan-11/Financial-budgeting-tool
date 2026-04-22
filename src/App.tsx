import { useMemo, useState } from 'react';
import { IncomeCalculator } from './components/IncomeCalculator';
import { BudgetPlanner } from './components/BudgetPlanner';
import { SavingsCalculator } from './components/SavingsCalculator';
import { formatCurrencyCompact, formatCurrencyDetailed } from './utils/taxCalculator';
import { Calculator, PieChart, PiggyBank, Share2 } from 'lucide-react';

type AppTab = 'income' | 'budget' | 'savings';

interface IncomeSummary {
  monthlyInHand: number;
  annualCtc: number;
  age: number;
}

const tabs: Array<{ id: AppTab; label: string; icon: typeof Calculator }> = [
  { id: 'income', label: 'Income Calculator', icon: Calculator },
  { id: 'budget', label: 'Budget Planner', icon: PieChart },
  { id: 'savings', label: 'Savings Calculator', icon: PiggyBank }
];

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('income');
  const [summary, setSummary] = useState<IncomeSummary>({
    monthlyInHand: 0,
    annualCtc: 0,
    age: 30
  });

  const handleIncomeCalculated = (income: number, userAge: number, ctc: number) => {
    setSummary({
      monthlyInHand: income,
      annualCtc: ctc,
      age: userAge
    });
  };

  const shareData = useMemo(
    () => ({
      title: 'Financial Budgeting Tool',
      text: `My monthly budget: In-hand income: ${formatCurrencyDetailed(summary.monthlyInHand)}, Age: ${summary.age}`,
      url: window.location.href
    }),
    [summary.monthlyInHand, summary.age]
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareData.text);
      alert('Budget details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Financial Budgeting Tool</h1>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary.monthlyInHand > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly In-hand</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrencyCompact(summary.monthlyInHand)}</p>
                  <p className="text-sm text-gray-500">{formatCurrencyDetailed(summary.monthlyInHand)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Age</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.age}</p>
                  <p className="text-sm text-gray-500">years old</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annual CTC</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrencyCompact(summary.annualCtc)}</p>
                  <p className="text-sm text-gray-500">{formatCurrencyDetailed(summary.annualCtc)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-8">
          <div className={activeTab === 'income' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'income'}>
            <IncomeCalculator onIncomeCalculated={handleIncomeCalculated} />
          </div>
          <div className={activeTab === 'budget' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'budget'}>
            <BudgetPlanner monthlyIncome={summary.monthlyInHand} age={summary.age} />
          </div>
          <div className={activeTab === 'savings' ? 'block' : 'hidden'} aria-hidden={activeTab !== 'savings'}>
            <SavingsCalculator monthlyIncome={summary.monthlyInHand} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Tax calculations are based on Indian tax slabs for FY 2025-26 (New Tax Regime)</p>
            <p className="mt-2">This tool is for educational purposes only. Please consult a financial advisor for professional advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
