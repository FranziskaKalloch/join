import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { emailValidator } from '../../utils/email.util/email.util';

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './log-in.html',
  styleUrl: './log-in.scss',
})
export class LogIn {
  private authService = inject(AuthService);
  private router = inject(Router);
  showPassword = signal(false);
  loginError = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailValidator()],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  // for Log-In Button:
  /**
   * Attempts to sign in the user using the values from the login form.
   * Navigates to the summary page if the login was successful.
   *
   * @returns A promise that resolves when the login process has finished.
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;

    const loginSuccessful = await this.authService.signIn(email, password);

    if (!loginSuccessful) {
      this.loginError.set(true);
      this.password.setValue('', { emitEvent: false });
      this.password.markAsUntouched();
      return;
    }

    await this.router.navigate(['/summary']);
  }

  /**
   * Signs the user in anonymously as a guest.
   *
   * After a successful guest login, the user is redirected
   * to the summary page.
   *
   * @returns A promise that resolves when the guest login process has finished.
   */
  async guestLogin(): Promise<void> {
    const loginSuccessful = await this.authService.signInAnonymously();

    if (!loginSuccessful) {
      return;
    }

    await this.router.navigate(['/summary']);
  }

  /**
   * Returns the email form control from the login form.
   *
   * @returns The email form control.
   */
  get email() {
    return this.loginForm.controls.email;
  }

  /**
   * Returns the password form control from the login form.
   *
   * @returns The password form control.
   */
  get password() {
    return this.loginForm.controls.password;
  }

  formMessage = '';
  messageType: 'success' | 'error' | '' = '';

  /**
   * Toggles the visibility of the password.
   *
   * The password visibility is only changed if the password
   * field currently contains a value.
   */
  togglePassword(): void {
    if (!this.password.value) {
      return;
    }

    this.showPassword.update((value) => !value);
  }

  /**
   * Initializes subscriptions for the login form controls.
   *
   * Clears the login error when the user changes the password
   * or enters a value in the email field.
   */
  ngOnInit(): void {
    this.password.valueChanges.subscribe(() => {
      if (this.loginError()) {
        this.loginError.set(false);
      }
    });

    this.email.valueChanges.subscribe((value) => {
      if (value) {
        this.loginError.set(false);
      }
    });
  }
}
