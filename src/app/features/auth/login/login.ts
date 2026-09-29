import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  isResettingPassword = false;
  resetMessage = '';

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      this.errorMessage = this.getAuthErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  async forgotPassword(): Promise<void> {
    const emailControl = this.loginForm.controls.email;

    if (emailControl.invalid) {
      emailControl.markAsTouched();
      return;
    }

    this.isResettingPassword = true;
    this.resetMessage = '';
    this.errorMessage = '';

    try {
      await this.authService.resetPassword(
        emailControl.value
      );

      this.resetMessage =
        'Password reset email sent. Please check your inbox.';
    } catch (error: unknown) {
      this.errorMessage =
        this.getAuthErrorMessage(error);
    } finally {
      this.isResettingPassword = false;
    }
  }

  private getAuthErrorMessage(error: unknown): string {
    const code =
      typeof error === 'object' &&
        error !== null &&
        'code' in error
        ? String(error.code)
        : '';

    switch (code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account was found with this email.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later.';
      default:
        return 'Unable to sign in. Please try again.';
    }
  }
}
