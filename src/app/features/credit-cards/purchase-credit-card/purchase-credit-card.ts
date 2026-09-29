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
import { CreditCard } from '../../../domain/credit-card/credit-card.model';

import { CategoryStore } from '../../categories/category.store';
import { PartyStore } from '../../../state/party.store';

interface PurchaseCreditCardDialogData {
  creditCardId: string;
}

@Component({
  selector: 'app-purchase-credit-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './purchase-credit-card.html',
  styleUrl: './purchase-credit-card.css',
})
export class PurchaseCreditCard {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly creditCardStore = inject(CreditCardStore);
  private readonly categoryStore = inject(CategoryStore);
  private readonly partyStore = inject(PartyStore);

  private readonly dialogRef =
    inject(MatDialogRef<PurchaseCreditCard>);

  readonly creditCard: CreditCard | undefined;


  readonly categories =
    this.categoryStore.categories;

  readonly parties =
    this.partyStore.activeParties;

  saving = false;
  errorMessage = '';

  readonly form = this.fb.group({
    amount: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
      ],
    ],

    partyId: [
      '',
    ],

    categoryId: [
      '',
      Validators.required,
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
    readonly data: PurchaseCreditCardDialogData
  ) {
    this.creditCard =
    this.creditCardStore.getCreditCardById(
      this.data.creditCardId
    ); }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();

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
        'Enter a valid purchase amount.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const now = new Date().toISOString();

    try {
      await this.creditCardStore.createPurchase({
        id: crypto.randomUUID(),
        userId: user.uid,
        type: 'expense',
        amount,
        currency: this.creditCard.currency,
        transactionDate:
          this.form.value.transactionDate!,
        description:
          this.form.value.description!.trim(),

        sourceAccountId:
          this.creditCard.accountId,

        destinationAccountId: null,

        categoryId:
          this.form.value.categoryId!,

        partyId:
          this.form.value.partyId || null,

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
          : 'Failed to record credit card purchase.';
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
