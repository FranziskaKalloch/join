import { Component } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn  } from '@angular/forms';
import { ContactService } from '../../services/contacts/contact.service';
import { catchError, from, map, of } from 'rxjs';

@Component({
  selector: 'app-email.util',
  imports: [],
  templateUrl: './email.util.html',
  styleUrl: './email.util.scss',
})

export class EmailUtil {}


export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(value) ? null : { invalidEmail: true };
  };
}

export function emailExistsValidator(
  contactService: ContactService,
  getExcludeId: () => number | undefined,
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const value = (control.value ?? '').trim().toLowerCase();

    if (!value || control.errors) {
      return of(null);
    }

    return from(contactService.emailExists(value, getExcludeId())).pipe(
      map((exists) => (exists ? { emailExists: true } : null)),
      catchError(() => of(null)),
    );
  };
}