/**
 * Validate an onboarding form data object.
 * Returns an array of { field, message } errors.
 */
export function validateOnboarding(data) {
  const errors = [];

  // Section 1: Core Details
  if (!data.full_name || !data.full_name.trim()) {
    errors.push({ field: 'full_name', message: 'Full name is required.' });
  }
  if (!data.date_of_birth) {
    errors.push({ field: 'date_of_birth', message: 'Date of birth is required.' });
  }
  if (data.ni_number && !/^[A-Za-z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-Da-d]$/.test(data.ni_number.trim())) {
    errors.push({ field: 'ni_number', message: 'National Insurance number format is invalid (e.g. QQ 12 34 56 A).' });
  }
  if (data.personal_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal_email.trim())) {
    errors.push({ field: 'personal_email', message: 'Personal email format is invalid.' });
  }

  // Section 3: Banking — validate format if provided
  if (data.bank_sort_code && !/^\d{2}-?\d{2}-?\d{2}$/.test(data.bank_sort_code.trim())) {
    errors.push({ field: 'bank_sort_code', message: 'Sort code must be 6 digits (XX-XX-XX).' });
  }
  if (data.bank_account_number && !/^\d{8}$/.test(data.bank_account_number.trim())) {
    errors.push({ field: 'bank_account_number', message: 'Account number must be 8 digits.' });
  }

  return errors;
}
