import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Returns a validator function that checks whether the selected date is in the past.
 *
 * @param originalDate - Optional original date value that should be considered valid.
 * @returns A ValidatorFn that returns a validation error when the selected date is before today.
 */
export function noPastDateValidator(originalDate?: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate =
      control.value instanceof Date
        ? new Date(
          control.value.getFullYear(),
          control.value.getMonth(),
          control.value.getDate()
        )
        : parseLocalDate(control.value);
    selectedDate.setHours(0, 0, 0, 0);

    if (originalDate && control.value === originalDate) {
      return null;
    }

    return selectedDate < today ? { pastDate: true } : null;
  };
}

/**
 * Returns the current date as a string in the format 'YYYY-MM-DD'.
 *
 * @returns The current date formatted for HTML date inputs.
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string in 'YYYY-MM-DD' format into a Date object using local timezone.
 *
 * @param value - Date string in ISO-like local format (YYYY-MM-DD).
 * @returns A Date instance set to the provided year, month and day (time set to midnight local).
 */
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date object as 'YYYY-MM-DD'.
 *
 * @param date - Date to format.
 * @returns The formatted date string suitable for HTML date inputs.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


