import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { calculateTax, formatCurrencyCompact, formatCurrencyDetailed } from '../utils/taxCalculator';
import { Calculator, TrendingUp, FileText, PieChart } from 'lucide-react';
import { calculateSalaryBreakdown, formatIndianCurrencyInput } from '../utils/incomeCalculator';

interface IncomeCalculatorProps {
  onIncomeCalculated?: (monthlyInHand: number, age: number, annualCtc: number) => void;
}

export function IncomeCalculator({ onIncomeCalculated }: IncomeCalculatorProps) {
  const [ctc, setCtc] = useState<string>('');
  const [age, setAge] = useState<string>('30');
  const [pfMode, setPfMode] = useState<'standard' | 'minimum'>('standard');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCtc(formatIndianCurrencyInput(e.target.value));
  };

  const ctcNumber = parseFloat(ctc.replace(/,/g, '')) || 0;
  const ageNumber = parseInt(age) || 30;
  const taxCalculation = calculateTax(ctcNumber, { pfMode });

  // Notify parent component when income is calculated
  useEffect(() => {
    if (ctcNumber > 0 && onIncomeCalculated) {
      onIncomeCalculated(taxCalculation.monthlyTakeHome, ageNumber, ctcNumber);
    }
  }, [ctcNumber, ageNumber, taxCalculation.monthlyTakeHome, onIncomeCalculated]);

  const salaryBreakdown = calculateSalaryBreakdown(ctcNumber);

  return (
    <div className="space-y-6">
      <Card title="Income Calculator" subtitle="Calculate your CTC, tax, and monthly take-home">
        <div className="space-y-6">
          {/* CTC Input */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ctc" className="block text-sm font-medium text-gray-700 mb-2">
                  Annual CTC (Cost to Company)
                </label>
                <div className="relative">
                  <Input
                    id="ctc"
                    type="text"
                    placeholder="Enter your annual CTC"
                    value={ctc}
                    onChange={handleInputChange}
                    className="text-lg font-semibold"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age (for advanced budget planning)
                </label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="text-lg font-semibold"
                  min="18"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PF Deduction Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-start gap-2 border border-gray-300 rounded-lg p-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pfMode"
                    value="standard"
                    checked={pfMode === 'standard'}
                    onChange={() => setPfMode('standard')}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    12% of basic salary (basic = 50% of CTC), multiplied by 2 (employee + employer)
                  </span>
                </label>
                <label className="flex items-start gap-2 border border-gray-300 rounded-lg p-3 cursor-pointer">
                  <input
                    type="radio"
                    name="pfMode"
                    value="minimum"
                    checked={pfMode === 'minimum'}
                    onChange={() => setPfMode('minimum')}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    Minimum PF: ₹1800 x 2 per month (employee + employer)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          {ctcNumber > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Annual CTC</h3>
                </div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrencyCompact(ctcNumber)}</div>
                <div className="text-sm text-blue-700">{formatCurrencyDetailed(ctcNumber)}</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Total Tax</h3>
                </div>
                <div className="text-2xl font-bold text-red-900">{formatCurrencyCompact(taxCalculation.totalTax)}</div>
                <div className="text-sm text-red-700">{formatCurrencyDetailed(taxCalculation.totalTax)}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Monthly Take-Home</h3>
                </div>
                <div className="text-2xl font-bold text-green-900">{formatCurrencyCompact(taxCalculation.monthlyTakeHome)}</div>
                <div className="text-sm text-green-700">{formatCurrencyDetailed(taxCalculation.monthlyTakeHome)}</div>
              </div>
            </div>
          )}

          {/* Tax Breakdown */}
          {ctcNumber > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tax Breakdown (FY 2025-26 New Tax Regime)</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  {showBreakdown ? 'Hide' : 'Show'} Salary Breakdown
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Income Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Total Income:</span>
                        <span className="font-medium">{formatCurrencyDetailed(taxCalculation.totalIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Standard Deduction:</span>
                        <span className="font-medium">-{formatCurrencyDetailed(75000)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Taxable Income:</span>
                        <span className="font-bold">{formatCurrencyDetailed(taxCalculation.taxableIncome)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tax Calculation</h4>
                    <div className="space-y-2 text-sm">
                      {taxCalculation.slabs.map((slabItem, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600">
                            {slabItem.slab.maxIncome === Infinity
                              ? `Above ${formatCurrencyDetailed(slabItem.slab.minIncome)} (${slabItem.slab.rate}%):`
                              : `${formatCurrencyDetailed(slabItem.slab.minIncome)} - ${formatCurrencyDetailed(slabItem.slab.maxIncome)} (${slabItem.slab.rate}%):`}
                          </span>
                          <span className="font-medium">{formatCurrencyDetailed(slabItem.tax)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Tax Before Cess:</span>
                        <span className="font-bold text-red-600">{formatCurrencyDetailed(taxCalculation.taxBeforeCess)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Health & Education Cess (4%):</span>
                        <span className="font-medium">{formatCurrencyDetailed(taxCalculation.cess)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Total Tax (incl. cess):</span>
                        <span className="font-bold text-red-600">{formatCurrencyDetailed(taxCalculation.totalTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Salary Breakdown */}
          {ctcNumber > 0 && showBreakdown && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Detailed Salary Breakdown
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center">Earnings</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Basic Salary</span>
                      <span className="font-medium">{formatCurrencyDetailed(salaryBreakdown.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">HRA</span>
                      <span className="font-medium">{formatCurrencyDetailed(salaryBreakdown.hra)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Dearness Allowance</span>
                      <span className="font-medium">{formatCurrencyDetailed(salaryBreakdown.da)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Special Allowance</span>
                      <span className="font-medium">{formatCurrencyDetailed(salaryBreakdown.specialAllowance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Other Allowances</span>
                      <span className="font-medium">{formatCurrencyDetailed(salaryBreakdown.otherAllowances)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-900">Gross Salary</span>
                        <span className="text-green-600">{formatCurrencyDetailed(salaryBreakdown.basicSalary + salaryBreakdown.hra + salaryBreakdown.da + salaryBreakdown.specialAllowance + salaryBreakdown.otherAllowances)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center">Deductions</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        PF Deduction ({pfMode === 'minimum' ? 'Minimum PF' : '12% of Basic x 2'})
                      </span>
                      <span className="font-medium text-red-600">-{formatCurrencyDetailed(taxCalculation.annualPfDeduction)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Professional Tax</span>
                      <span className="font-medium text-red-600">-{formatCurrencyDetailed(taxCalculation.annualProfessionalTax)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-900">Total Deductions</span>
                        <span className="text-red-600">-{formatCurrencyDetailed(taxCalculation.annualPfDeduction + taxCalculation.annualProfessionalTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employer-side Components */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-4 text-center">Employer-side Components</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-blue-700 mb-1">Employer PF</div>
                    <div className="font-semibold text-blue-900">{formatCurrencyDetailed(salaryBreakdown.employerPf)}</div>
                    <div className="text-xs text-blue-600">(12% of Basic)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-700 mb-1">EPS</div>
                    <div className="font-semibold text-blue-900">{formatCurrencyDetailed(salaryBreakdown.employerEps)}</div>
                    <div className="text-xs text-blue-600">(8.33% of Basic)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-700 mb-1">Gratuity</div>
                    <div className="font-semibold text-blue-900">{formatCurrencyDetailed(salaryBreakdown.gratuity)}</div>
                    <div className="text-xs text-blue-600">(4.81% of Basic)</div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 text-center">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Gross Salary:</span>
                      <span className="font-medium">{formatCurrencyDetailed(salaryBreakdown.basicSalary + salaryBreakdown.hra + salaryBreakdown.da + salaryBreakdown.specialAllowance + salaryBreakdown.otherAllowances)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Less: Deductions:</span>
                      <span className="font-medium text-red-600">-{formatCurrencyDetailed(taxCalculation.annualPfDeduction + taxCalculation.annualProfessionalTax)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span className="text-gray-900">Net Salary:</span>
                      <span className="text-green-600">{formatCurrencyDetailed((salaryBreakdown.basicSalary + salaryBreakdown.hra + salaryBreakdown.da + salaryBreakdown.specialAllowance + salaryBreakdown.otherAllowances) - (taxCalculation.annualPfDeduction + taxCalculation.annualProfessionalTax))}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Less: Income Tax:</span>
                      <span className="font-medium text-red-600">-{formatCurrencyDetailed(taxCalculation.totalTax)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span className="text-gray-900">Monthly Take-Home:</span>
                      <span className="text-green-600 font-bold">{formatCurrencyDetailed(taxCalculation.monthlyTakeHome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
