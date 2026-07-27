import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  private authService = inject(AuthService);
  private router = inject(Router);

  signUpForm = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    confirmedPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    privacyPolicy: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  /**
   * Validates the sign-up form, checks whether both passwords match,
   * and registers a new user through the AuthService.
   * Navigates to the login page if the registration was successful.
   *
   * @returns A promise that resolves when the sign-up process has finished.
   */
  async onSubmit(): Promise<void> {
    if (this.signUpForm.invalid) {
      return;
    }

    const fullName = this.signUpForm.controls.fullName.value;
    const email = this.signUpForm.controls.email.value;
    const password = this.signUpForm.controls.password.value;
    const confirmedPassword = this.signUpForm.controls.confirmedPassword.value;

    if (password !== confirmedPassword) {
      // Fehlermeldung: Passwörter stimmen nicht überein
      return;
    }

    const signUpSuccessful = await this.authService.signUpNewUser(fullName, email, password);

    if (!signUpSuccessful) {
      // Fehlermeldung anzeigen
      return;
    }

    await this.router.navigate(['/login']);
  }
}
