import { Component, inject, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { emailValidator } from '../../utils/email.util/email.util';

import { AuthService } from '../../services/auth/auth.service';

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

  async guestLogin(): Promise<void> {
    const loginSuccessful = await this.authService.signInAnonymously();

    if (!loginSuccessful) {
      return;
    }

    await this.router.navigate(['/summary']);
  }

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  formMessage = '';
  messageType: 'success' | 'error' | '' = '';


  togglePassword(): void {
    if (!this.password.value) {
      return;
    }

    this.showPassword.update(value => !value);
  }

  ngOnInit() {
    this.password.valueChanges.subscribe(() => {
      if (this.loginError()) {
        this.loginError.set(false);
      }
    });

    this.email.valueChanges.subscribe(value => {
      if (value) {
        this.loginError.set(false);
      }
    });
  }


}
