import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/auth/auth.service';

import { UserProfileRepository } from '../../../infrastructure/repositories/user-profile.repository';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly userProfileRepository =  inject(UserProfileRepository);

  isSubmitting = false;
  errorMessage = '';

  readonly registerForm = this.fb.nonNullable.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: (group) => {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        return password === confirmPassword
          ? null
          : { passwordMismatch: true };
      },
    }
  );

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const {
      displayName,
      email,
      password,
    } = this.registerForm.getRawValue();

    try {
      const user = await this.authService.register(
        email,
        password
      );

      const now = new Date().toISOString();

      const profile = {
        uid: user.uid,
        email: user.email ?? email,
        displayName,

        currency: 'INR',
        country: 'IN',

        createdAt: now,
        updatedAt: now,
      };

      await this.userProfileRepository.create(profile);

      await this.router.navigate(['/dashboard']);

    } catch (error: unknown) {
        console.error('Registration failed:', error);

        this.errorMessage = this.getAuthErrorMessage(error);

    } finally {
      this.isSubmitting = false;
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
      case 'auth/email-already-in-use':
        return 'An account already exists with this email.';

      case 'auth/invalid-email':
        return 'Please enter a valid email address.';

      case 'auth/weak-password':
        return 'Password is too weak. Use at least 8 characters.';
      case 'permission-denied':
        return 'Account was created, but your LedgerFlow profile could not be saved.';

      default:
        return 'Unable to create your account. Please try again.';
    }
  }
}
