export interface SalaryBreakdown {
  basicSalary: number;
  hra: number;
  da: number;
  specialAllowance: number;
  otherAllowances: number;
  employeePf: number;
  employerPf: number;
  employerEps: number;
  employerPfContribution: number;
  gratuity: number;
  totalCtc: number;
}

export function formatIndianCurrencyInput(value: string): string {
  const cleanValue = value.replace(/[^\d.]/g, '');
  const parts = cleanValue.split('.');

  if (parts.length > 2) {
    return value;
  }

  let wholePart = parts[0];
  const decimalPart = parts[1] || '';
  wholePart = wholePart.replace(/^0+/, '') || '0';

  if (wholePart.length > 3) {
    const lastThree = wholePart.slice(-3);
    const remaining = wholePart.slice(0, -3);
    let formatted = '';

    for (let i = remaining.length; i > 0; i -= 2) {
      const start = Math.max(0, i - 2);
      const group = remaining.slice(start, i);
      formatted = `${group},${formatted}`;
    }

    wholePart = formatted + lastThree;
  }

  let result = wholePart;
  if (decimalPart) {
    result += `.${decimalPart.slice(0, 2)}`;
  }

  return result;
}

export function calculateSalaryBreakdown(annualCtc: number): SalaryBreakdown {
  const basicSalary = annualCtc * 0.5;
  const hra = basicSalary * 0.4;
  const da = basicSalary * 0.1;
  const specialAllowance = annualCtc * 0.15;
  const otherAllowances = annualCtc * 0.05;

  const employeePf = Math.min(basicSalary * 0.12, 180000);
  const employerPf = Math.min(basicSalary * 0.12, 180000);
  const employerEps = Math.min(basicSalary * 0.0833, 125000);
  const employerPfContribution = employerPf - employerEps;
  const gratuity = basicSalary * 0.0481;

  const totalCtc =
    basicSalary + hra + da + specialAllowance + otherAllowances + employerPf + gratuity;

  return {
    basicSalary,
    hra,
    da,
    specialAllowance,
    otherAllowances,
    employeePf,
    employerPf,
    employerEps,
    employerPfContribution,
    gratuity,
    totalCtc
  };
}
