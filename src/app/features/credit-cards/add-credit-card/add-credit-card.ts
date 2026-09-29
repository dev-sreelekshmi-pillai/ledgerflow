import {
  Component,
  inject,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/auth/auth.service';
import { CreditCardStore } from '../../../state/credit-card';

import { Account } from '../../../domain/account/account.model';
import { CreditCard } from '../../../domain/credit-card/credit-card.model';

@Component({
  selector: 'app-add-credit-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './add-credit-card.html',
  styleUrl: './add-credit-card.css',
})
export class AddCreditCard {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly creditCardStore = inject(CreditCardStore);

  private readonly dialogRef =
    inject(MatDialogRef<AddCreditCard>);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    creditLimit: [
      0,
      [Validators.required, Validators.min(1)],
    ],
    billingDay: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(31),
      ],
    ],
    dueDay: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(31),
      ],
    ],
  });

  isSaving = false;
  errorMessage = '';

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();

    if (!user) {
      this.errorMessage = 'User is not authenticated.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      const values = this.form.getRawValue();

      const now = new Date().toISOString();

      /*
       * One ID for both records.
       *
       * This gives us a simple 1:1 relationship:
       *
       * accounts/{id}
       * creditCards/{id}
       */
      const accountId = crypto.randomUUID();

      const account: Account = {
        id: accountId,
        userId: user.uid,
        name: values.name.trim(),
        type: 'credit-card',
        currency: 'INR',
        openingBalance: 0,
        currentBalance: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const creditCard: CreditCard = {
        id: accountId,
        userId: user.uid,
        accountId,
        name: values.name.trim(),
        creditLimit: values.creditLimit,
        billingDay: values.billingDay,
        dueDay: values.dueDay,
        currency: 'INR',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await this.creditCardStore.createCreditCardWithAccount(
        creditCard,
        account
      );

      this.dialogRef.close(true);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create credit card.';
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
