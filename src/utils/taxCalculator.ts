export interface TaxSlab {
  minIncome: number;
  maxIncome: number;
  rate: number;
  description: string;
}

export interface TaxCalculation {
  totalIncome: number;
  taxableIncome: number;
  taxAmount: number;
  effectiveTaxRate: number;
  monthlyTax: number;
  monthlyTakeHome: number;
  slabs: {
    slab: TaxSlab;
    amount: number;
    tax: number;
  }[];
}

// Indian Tax Slabs for FY 2025-26 (New Tax Regime)
export const TAX_SLABS: TaxSlab[] = [
  { minIncome: 0, maxIncome: 300000, rate: 0, description: "Up to ₹3 Lakhs" },
  { minIncome: 300000, maxIncome: 600000, rate: 5, description: "₹3 Lakhs to ₹6 Lakhs" },
  { minIncome: 600000, maxIncome: 900000, rate: 10, description: "₹6 Lakhs to ₹9 Lakhs" },
  { minIncome: 900000, maxIncome: 1200000, rate: 15, description: "₹9 Lakhs to ₹12 Lakhs" },
  { minIncome: 1200000, maxIncome: 1500000, rate: 20, description: "₹12 Lakhs to ₹15 Lakhs" },
  { minIncome: 1500000, maxIncome: Infinity, rate: 30, description: "Above ₹15 Lakhs" }
];

export function calculateTax(annualIncome: number): TaxCalculation {
  const standardDeduction = 50000; // Standard deduction
  const taxableIncome = Math.max(0, annualIncome - standardDeduction);
  
  let totalTax = 0;
  const slabBreakdown: { slab: TaxSlab; amount: number; tax: number }[] = [];
  
  for (const slab of TAX_SLABS) {
    if (taxableIncome > slab.minIncome) {
      const slabAmount = Math.min(
        taxableIncome - slab.minIncome,
        slab.maxIncome === Infinity ? taxableIncome - slab.minIncome : slab.maxIncome - slab.minIncome
      );
      
      const slabTax = (slabAmount * slab.rate) / 100;
      totalTax += slabTax;
      
      if (slabAmount > 0) {
        slabBreakdown.push({
          slab,
          amount: slabAmount,
          tax: slabTax
        });
      }
    }
  }
  
  const effectiveTaxRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
  const monthlyTax = totalTax / 12;
  const monthlyTakeHome = (annualIncome - totalTax) / 12;
  
  return {
    totalIncome: annualIncome,
    taxableIncome,
    taxAmount: totalTax,
    effectiveTaxRate,
    monthlyTax,
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
  if (amount === 0) return '₹0';
  
  const formatted = formatIndianNumber(amount);
  return `₹${formatted}`;
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
