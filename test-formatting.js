// Test Indian numbering system formatting with 2 decimal places
function formatIndianNumber(num) {
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

function formatCurrencyDetailed(amount) {
  if (amount === 0) return '₹0';
  
  const formatted = formatIndianNumber(amount);
  return `₹${formatted}`;
}

function formatCurrencyCompact(amount) {
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

// Test cases
console.log('Testing Indian Numbering System with 2 Decimal Places:');
console.log('500000.123:', formatCurrencyDetailed(500000.123)); // Should show ₹5,00,000.12
console.log('1000000.456:', formatCurrencyDetailed(1000000.456)); // Should show ₹10,00,000.46
console.log('50000.789:', formatCurrencyDetailed(50000.789)); // Should show ₹50,000.79
console.log('10000000.999:', formatCurrencyDetailed(10000000.999)); // Should show ₹1,00,00,001.00

console.log('\nTesting Compact Format with 2 Decimal Places:');
console.log('500000.123:', formatCurrencyCompact(500000.123)); // Should show ₹5.00L
console.log('1000000.456:', formatCurrencyCompact(1000000.456)); // Should show ₹10.00L
console.log('50000.789:', formatCurrencyCompact(50000.789)); // Should show ₹50.00K
console.log('10000000.999:', formatCurrencyCompact(10000000.999)); // Should show ₹1.00Cr
