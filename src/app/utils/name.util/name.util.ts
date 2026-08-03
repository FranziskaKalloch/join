import { Component } from '@angular/core';
import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-name.util',
  imports: [],
  templateUrl: './name.util.html',
  styleUrl: './name.util.scss',
})
export class NameUtil { }

/**
 * Splits a full name into first and last name parts.
 *
 * @param fullName The full name to split.
 * @returns An object with first and last name values.
 */
export function splitFullName(fullName: string): {
  firstname: string;
  lastname: string;
} {
  const parts = fullName.trim().split(/\s+/);

  return {
    firstname: parts[0] ?? '',
    lastname: parts.slice(1).join(' ')
  };
}

/**
 * Validates that a full name has first and last name parts.
 *
 * @param control The form control to validate.
 * @returns A validation error object or null.
 */
export function fullNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').trim();
    if (!value) {
      return null;
    }
    const { firstname, lastname } = splitFullName(value);
    if (!lastname) {
      return { fullName: true };
    }
    if (firstname.length < 3 || lastname.length < 3) {
      return { nameTooShort: true };
    }
    return null;
  };
}
