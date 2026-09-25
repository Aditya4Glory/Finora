export const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other',
];

export const ALL_CATEGORIES = Array.from(
  new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])
);

export const CATEGORY_COLORS = {
  Food: '#f97316',        // Orange
  Shopping: '#ec4899',    // Pink
  Transport: '#3b82f6',   // Blue
  Bills: '#eab308',       // Yellow
  Entertainment: '#8b5cf6', // Violet
  Health: '#10b981',      // Emerald
  Education: '#06b6d4',   // Cyan
  Travel: '#14b8a6',      // Teal
  Salary: '#22c55e',      // Green
  Freelance: '#6366f1',   // Indigo
  Business: '#0ea5e9',    // Sky
  Investment: '#84cc16',  // Lime
  Gift: '#d946ef',        // Fuchsia
  Other: '#64748b',       // Slate
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount_high', label: 'Amount: High to Low' },
  { value: 'amount_low', label: 'Amount: Low to High' },
];
