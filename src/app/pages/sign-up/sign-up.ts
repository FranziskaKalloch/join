import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { ContactService } from '../../services/contacts/contact.service';
import { emailValidator, emailExistsValidator } from '../../utils/email.util/email.util';

/**
 * Validates that the input control value contains at least two words.
 * 
 * @param control The abstract control to validate.
 * @returns An object with `notTwoWords: true` if invalid, otherwise null.
 */
const twoWordsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value || '';
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2 || parts[1] === '') {
    return { notTwoWords: true };
  }
  return null;
};

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  private authService = inject(AuthService);
  private contactService = inject(ContactService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  showPassword = false;
  showConfirmPassword = false;
  showSuccessPopup = false;
  isSubmitting = false;
  errorMessage = '';

  signUpForm = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, twoWordsValidator],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailValidator()],
      asyncValidators: [emailExistsValidator(this.contactService, () => undefined)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmedPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    privacyPolicy: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  /**
   * Toggles the visibility state of the password input field.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles the visibility state of the confirmation password input field.
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handles the form submission for registering a new user.
   * Validates the form, checks for password matching, and attempts registration via the auth service.
   * Shows a success message and redirects to login upon success, or displays an error message upon failure.
   */
  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.isSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    const fullName = this.signUpForm.controls.fullName.value;
    const email = this.signUpForm.controls.email.value;
    const password = this.signUpForm.controls.password.value;
    const confirmedPassword = this.signUpForm.controls.confirmedPassword.value;

    if (password !== confirmedPassword) {
      this.signUpForm.controls.confirmedPassword.setErrors({ mismatch: true });
      this.isSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    const signUpSuccessful = await this.authService.signUpNewUser(fullName, email, password);

    if (!signUpSuccessful) {
      this.errorMessage = 'Registration failed. Email might already be in use or contact exists.';
      this.isSubmitting = false;
      this.cdr.detectChanges();
      return;
    }

    this.showSuccessPopup = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}