/**
 * Server-side input validation and sanitization utilities
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return typeof email === 'string' && emailRegex.test(email);
}

export function isPositiveNumber(val: any): boolean {
  const num = Number(val);
  return !isNaN(num) && num > 0;
}

export function isNonNegativeNumber(val: any): boolean {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export function areDatesOrdered(start: string, end: string): boolean {
  if (!isValidDate(start) || !isValidDate(end)) return false;
  return new Date(end).getTime() >= new Date(start).getTime();
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
