import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
// This function returns a ValidatorFn that checks if the selected date is in the past. It compares the selected date with today's date and returns a validation error if the selected date is earlier than today. If the control value is empty, it returns null, indicating no validation error.
export function noPastDateValidator(originalDate?: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);

    if (originalDate && control.value === originalDate) {
      return null;
    }

    return selectedDate < today ? { pastDate: true } : null;
  };
}
// This function returns the current date in the format 'YYYY-MM-DD', which is suitable for use as a minimum date in date input fields. It ensures that the date is always formatted correctly, with leading zeros for single-digit months and days.
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}
