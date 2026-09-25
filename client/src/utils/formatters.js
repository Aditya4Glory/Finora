/**
 * Format numeric value as currency (₹ Indian Rupee by default)
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
};

/**
 * Format a date string into readable format (e.g. "15 Mar 2026")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Format a date string into YYYY-MM-DD for HTML input[type="date"]
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
};
