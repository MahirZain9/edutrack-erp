/**
 * Format currency amount to Indian Rupee (₹) standard
 * E.g., 23700 -> ₹ 23,700
 * E.g., 150000 -> ₹ 1,50,000
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0';
  return '₹ ' + new Intl.NumberFormat('en-IN').format(amount);
};

/**
 * Format standard YYYY-MM-DD date to Indian standard DD-MM-YYYY
 * E.g., "2026-06-15" -> "15-06-2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Check if standard ISO date YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};
