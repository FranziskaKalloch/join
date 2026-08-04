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
   * Handles the form submission process by validating data, executing registration, and triggering navigation.
   */
  async onSubmit(): Promise<void> {
    this.resetSubmissionState();

    if (this.isFormInvalid()) {
      return;
    }

    if (this.isPasswordMismatch()) {
      return;
    }

    await this.processRegistration();
  }

  /**
   * Resets error messages and sets the submission state to active.
   */
  private resetSubmissionState(): void {
    this.errorMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();
  }

  /**
   * Checks if the form is invalid, marks all fields as touched, and handles state cleanup if true.
   * 
   * @returns True if form is invalid, otherwise false.
   */
  private isFormInvalid(): boolean {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.finalizeSubmissionFailure();
      return true;
    }
    return false;
  }

  /**
   * Validates if the password and confirmation password fields match.
   * 
   * @returns True if passwords mismatch, otherwise false.
   */
  private isPasswordMismatch(): boolean {
    const password = this.signUpForm.controls.password.value;
    const confirmedPassword = this.signUpForm.controls.confirmedPassword.value;

    if (password !== confirmedPassword) {
      this.signUpForm.controls.confirmedPassword.setErrors({ mismatch: true });
      this.finalizeSubmissionFailure();
      return true;
    }
    return false;
  }

  /**
   * Sends the user registration request to the authentication service and handles the result.
   */
  private async processRegistration(): Promise<void> {
    const { fullName, email, password } = this.extractFormValues();
    const signUpSuccessful = await this.authService.signUpNewUser(fullName, email, password);

    if (!signUpSuccessful) {
      this.handleRegistrationFailure();
      return;
    }

    this.handleRegistrationSuccess();
  }

  /**
   * Extracts raw values from the sign-up form controls.
   * 
   * @returns An object containing form field values.
   */
  private extractFormValues() {
    return {
      fullName: this.signUpForm.controls.fullName.value,
      email: this.signUpForm.controls.email.value,
      password: this.signUpForm.controls.password.value,
    };
  }

  /**
   * Sets error state variables when registration fails.
   */
  private handleRegistrationFailure(): void {
    this.errorMessage = 'Registration failed. Email might already be in use or contact exists.';
    this.finalizeSubmissionFailure();
  }

  /**
   * Reverts submission loading state and triggers change detection.
   */
  private finalizeSubmissionFailure(): void {
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  /**
   * Handles successful registration by displaying the success popup and starting the redirect timer.
   */
  private handleRegistrationSuccess(): void {
    this.showSuccessPopup = true;
    this.cdr.detectChanges();
    this.scheduleRedirectToLogin();
  }

  /**
   * Schedules a delayed navigation redirection to the login view.
   */
  private scheduleRedirectToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}