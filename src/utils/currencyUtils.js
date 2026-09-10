export const formatCurrency = (value = 0) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0);
export const parseAmount = (value) => Math.round((Number(value) || 0) * 100) / 100;
