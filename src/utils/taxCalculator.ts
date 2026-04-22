export interface TaxSlab {
  minIncome: number;
  maxIncome: number;
  rate: number;
  description: string;
}

export interface TaxCalculation {
  totalIncome: number;
  taxableIncome: number;
  taxBeforeCess: number;
  rebate87A: number;
  taxAfterRebateBeforeCess: number;
  cess: number;
  totalTax: number;
  taxAmount?: number;
  effectiveTaxRate: number;
  monthlyTax: number;
  annualPfDeduction: number;
  annualProfessionalTax: number;
  annualDeductions: number;
  monthlyTakeHome: number;
  slabs: {
    slab: TaxSlab;
    amount: number;
    tax: number;
  }[];
}

export type PfMode = 'standard' | 'minimum';

export interface TaxCalculationOptions {
  pfMode?: PfMode;
}

const STANDARD_DEDUCTION = 75000;
const PROFESSIONAL_TAX = 2500;
const MINIMUM_PF_MONTHLY = 1800;
const CESS_RATE = 0.04;
const REBATE_87A_THRESHOLD = 1200000;
const REBATE_87A_MAX = 60000;

// Indian Tax Slabs for FY 2025-26 (New Tax Regime, Budget 2025)
export const TAX_SLABS: TaxSlab[] = [
  { minIncome: 0, maxIncome: 400000, rate: 0, description: "Up to ₹4 Lakhs" },
  { minIncome: 400000, maxIncome: 800000, rate: 5, description: "₹4 Lakhs to ₹8 Lakhs" },
  { minIncome: 800000, maxIncome: 1200000, rate: 10, description: "₹8 Lakhs to ₹12 Lakhs" },
  { minIncome: 1200000, maxIncome: 1600000, rate: 15, description: "₹12 Lakhs to ₹16 Lakhs" },
  { minIncome: 1600000, maxIncome: 2000000, rate: 20, description: "₹16 Lakhs to ₹20 Lakhs" },
  { minIncome: 2000000, maxIncome: 2400000, rate: 25, description: "₹20 Lakhs to ₹24 Lakhs" },
  { minIncome: 2400000, maxIncome: Infinity, rate: 30, description: "Above ₹24 Lakhs" }
];

export function calculateTax(annualIncome: number, options: TaxCalculationOptions = {}): TaxCalculation {
  const pfMode = options.pfMode ?? 'standard';
  const taxableIncome = Math.max(0, annualIncome - STANDARD_DEDUCTION);
  
  let taxBeforeCess = 0;
  const slabBreakdown: { slab: TaxSlab; amount: number; tax: number }[] = [];
  
  for (const slab of TAX_SLABS) {
    if (taxableIncome > slab.minIncome) {
      const slabAmount = Math.min(
        taxableIncome - slab.minIncome,
        slab.maxIncome === Infinity ? taxableIncome - slab.minIncome : slab.maxIncome - slab.minIncome
      );
      
      const slabTax = (slabAmount * slab.rate) / 100;
      taxBeforeCess += slabTax;
      
      if (slabAmount > 0) {
        slabBreakdown.push({
          slab,
          amount: slabAmount,
          tax: slabTax
        });
      }
    }
  }

  const rebate87A =
    taxableIncome <= REBATE_87A_THRESHOLD
      ? Math.min(taxBeforeCess, REBATE_87A_MAX)
      : 0;
  const taxAfterRebateBeforeCess = Math.max(0, taxBeforeCess - rebate87A);
  const cess = taxAfterRebateBeforeCess * CESS_RATE;
  const totalTax = taxAfterRebateBeforeCess + cess;
  const basicSalary = annualIncome * 0.5;
  const annualPfDeduction =
    pfMode === 'minimum'
      ? MINIMUM_PF_MONTHLY * 2 * 12
      : basicSalary * 0.12 * 2;
  const annualProfessionalTax = PROFESSIONAL_TAX;
  const annualDeductions = totalTax + annualPfDeduction + annualProfessionalTax;
  
  const effectiveTaxRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  const monthlyTax = totalTax / 12;
  const monthlyTakeHome = Math.max(0, (annualIncome - annualDeductions) / 12);
  
  return {
    totalIncome: annualIncome,
    taxableIncome,
    taxBeforeCess,
    rebate87A,
    taxAfterRebateBeforeCess,
    cess,
    totalTax,
    taxAmount: totalTax,
    effectiveTaxRate,
    monthlyTax,
    annualPfDeduction,
    annualProfessionalTax,
    annualDeductions,
    monthlyTakeHome,
    slabs: slabBreakdown
  };
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

// Indian numbering system formatter with currency symbol
export function formatCurrency(amount: number): string {
  return formatCurrencyDetailed(amount);
}

// Detailed Indian numbering system formatter (shows full amount)
export function formatCurrencyDetailed(amount: number): string {
  if (amount === 0) return '₹0';
  
  const formatted = formatIndianNumber(amount);
  return `₹${formatted}`;
}

// Format numbers in Indian system without currency symbol
export function formatNumber(amount: number): string {
  if (amount === 0) return '0';
  
  return formatIndianNumber(amount);
}

// Format currency with compact notation (e.g., ₹5L for 5 lakhs)
export function formatCurrencyCompact(amount: number): string {
  if (amount === 0) return '₹0';
  
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(2)}K`;
  } else {
    return `₹${amount.toFixed(2)}`;
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
