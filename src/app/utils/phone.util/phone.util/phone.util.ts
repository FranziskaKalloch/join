import { Component } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-phone.util',
  imports: [],
  templateUrl: './phone.util.html',
  styleUrl: './phone.util.scss',
})
export class PhoneUtil {}

/**
 * Create a ValidatorFn that validates phone numbers.
 *
 * Rules:
 * - Allows an optional leading '+'.
 * - Digits may be grouped and separated by spaces or hyphens.
 * - Total digit count must be between 6 and 20.
 *
 * @returns A ValidatorFn that returns null when the control value is a valid
 *          phone number, or { phone: true } when invalid.
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();

    if (!value) {
      return null;
    }

    if (!/^\+?[0-9]+(?:[ -][0-9]+)*$/.test(value)) {
      return { phone: true };
    }
    
    const digits = value.replace(/\D/g, '');

    if (digits.length < 6 || digits.length > 20) {
      return { phone: true };
    }

    return null;
  };
}
