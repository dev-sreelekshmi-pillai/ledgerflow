import {
  Component,
  Inject,
  inject,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../core/auth/auth.service';

import { CreditCardStore } from '../../../state/credit-card';
import { AccountStore } from '../../accounts/account.store';

import { CreditCard } from '../../../domain/credit-card/credit-card.model';
import { Account } from '../../../domain/account/account.model';
import { DecimalPipe } from '@angular/common';

interface PayCreditCardDialogData {
  creditCardId: string;
}

@Component({
  selector: 'app-pay-credit-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    DecimalPipe,
  ],
  templateUrl: './pay-credit-card.html',
  styleUrl: './pay-credit-card.css',
})
export class PayCreditCard {
  private readonly fb = inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly creditCardStore =
    inject(CreditCardStore);

  private readonly accountStore =
    inject(AccountStore);

  private readonly dialogRef =
    inject(MatDialogRef<PayCreditCard>);

  readonly creditCard: CreditCard | undefined;

  readonly sourceAccounts = this.accountStore.accounts;

  saving = false;
  errorMessage = '';

  readonly form = this.fb.group({
    sourceAccountId: [
      '',
      Validators.required,
    ],

    amount: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
      ],
    ],

    transactionDate: [
      this.getToday(),
      Validators.required,
    ],

    description: [
      '',
      [
        Validators.required,
        Validators.maxLength(200),
      ],
    ],

    notes: [
      '',
      Validators.maxLength(500),
    ],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    readonly data: PayCreditCardDialogData
  ) {
    this.creditCard =
      this.creditCardStore.getCreditCardById(
        this.data.creditCardId
      );
  }

  get outstandingAmount(): number {
    if (!this.creditCard) {
      return 0;
    }

    const account =
      this.accountStore.accounts().find(
        (item) =>
          item.id === this.creditCard!.accountId
      );

    return account?.currentBalance ?? 0;
  }

  get availablePaymentAmount(): number {
    return Math.max(
      this.outstandingAmount,
      0
    );
  }

  get eligibleSourceAccounts(): Account[] {
    return this.sourceAccounts().filter(
      (account) =>
        account.type === 'bank' ||
        account.type === 'cash'
    );
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user =
      this.authService.currentUser();

    if (!user) {
      this.errorMessage =
        'User is not authenticated.';
      return;
    }

    if (!this.creditCard) {
      this.errorMessage =
        'Credit card could not be found.';
      return;
    }

    const amount = Number(
      this.form.value.amount
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      this.errorMessage =
        'Enter a valid payment amount.';
      return;
    }

    if (amount > this.outstandingAmount) {
      this.errorMessage =
        'Payment cannot exceed the outstanding card balance.';
      return;
    }

    const sourceAccount =
      this.accountStore.accounts().find(
        (account) =>
          account.id ===
          this.form.value.sourceAccountId
      );

    if (!sourceAccount) {
      this.errorMessage =
        'Select a valid bank or cash account.';
      return;
    }

    if (
      sourceAccount.type !== 'bank' &&
      sourceAccount.type !== 'cash'
    ) {
      this.errorMessage =
        'Credit card payments must come from a bank or cash account.';
      return;
    }

    if (amount > sourceAccount.currentBalance) {
      this.errorMessage =
        'Payment exceeds the available source account balance.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const now =
      new Date().toISOString();

    try {
      await this.creditCardStore.recordPayment({
        id: crypto.randomUUID(),
        userId: user.uid,
        type: 'credit-card-payment',
        amount,
        currency: this.creditCard.currency,

        transactionDate:
          this.form.value.transactionDate!,

        description:
          this.form.value.description!.trim(),

        sourceAccountId:
          sourceAccount.id,

        destinationAccountId:
          this.creditCard.accountId,

        categoryId: null,
        partyId: null,
        investmentId: null,
        debtId: null,

        notes:
          this.form.value.notes?.trim() || null,

        createdAt: now,
        updatedAt: now,
      });

      this.dialogRef.close(true);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to record credit card payment.';
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private getToday(): string {
    return new Date()
      .toISOString()
      .split('T')[0];
  }
}
