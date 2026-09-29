import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DecimalPipe } from '@angular/common';
import { CategoryStore } from '../../categories/category.store';
import { TransactionType } from '../../../domain/transaction/transaction.model';

import { AccountStore } from '../../accounts/account.store';
import { TransactionStore } from '../transaction.store';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransaction {
  constructor() {
    this.updateValidators();
  }

  private readonly fb = inject(FormBuilder);

  private readonly dialogRef = inject(MatDialogRef<AddTransaction>);

  private readonly accountStore = inject(AccountStore);

  private readonly transactionStore = inject(TransactionStore);

  readonly accounts = this.accountStore.accounts;
  private readonly categoryStore =
    inject(CategoryStore);

  readonly categories =
    this.categoryStore.categories;
  readonly transactionTypes: {
    value: TransactionType;
    label: string;
  }[] = [
    {
      value: 'income',
      label: 'Income',
    },
    {
      value: 'expense',
      label: 'Expense',
    },
    {
      value: 'transfer',
      label: 'Transfer',
    },
  ];

  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<TransactionType>('expense', Validators.required),

    amount: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0.01)]),

    transactionDate: this.fb.nonNullable.control(this.getToday(), Validators.required),

    description: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),

    sourceAccountId: this.fb.nonNullable.control(''),

    destinationAccountId: this.fb.nonNullable.control(''),

    categoryId: this.fb.nonNullable.control(''),

    partyId: this.fb.nonNullable.control(''),

    notes: this.fb.nonNullable.control(''), investmentId: this.fb.nonNullable.control<string | null>(null),
  });

  private updateValidators(): void {
    const sourceControl =
      this.form.controls.sourceAccountId;

    const destinationControl =
      this.form.controls.destinationAccountId;

    const categoryControl =
      this.form.controls.categoryId;

    sourceControl.clearValidators();
    destinationControl.clearValidators();
    categoryControl.clearValidators();

    if (this.isExpense) {
      sourceControl.setValidators(
        Validators.required
      );

      categoryControl.setValidators(
        Validators.required
      );
    }

    if (this.isIncome) {
      destinationControl.setValidators(
        Validators.required
      );
    }

    if (this.isTransfer) {
      sourceControl.setValidators(
        Validators.required
      );

      destinationControl.setValidators(
        Validators.required
      );
    }

    sourceControl.updateValueAndValidity();
    destinationControl.updateValueAndValidity();
    categoryControl.updateValueAndValidity();
  }

  get transactionType(): TransactionType {
    return this.form.controls.type.value;
  }

  get isIncome(): boolean {
    return this.transactionType === 'income';
  }

  get isExpense(): boolean {
    return this.transactionType === 'expense';
  }

  get isTransfer(): boolean {
    return this.transactionType === 'transfer';
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  onTypeChange(): void {
    this.form.patchValue({
      sourceAccountId: '',
      destinationAccountId: '',
      categoryId: '',
      partyId: '',
    });

    this.updateValidators();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.transactionStore.currentUser();

    if (!user) {
      return;
    }

    const value = this.form.getRawValue();
    if (
      this.isTransfer &&
      value.sourceAccountId ===
      value.destinationAccountId
    ) {
      this.form.controls.destinationAccountId.setErrors({
        sameAccount: true,
      });

      return;
    }
    const transaction = {
      id: crypto.randomUUID(),
      userId: user.uid,
      type: value.type,
      amount: value.amount,
      currency: 'INR',
      transactionDate: value.transactionDate,
      description: value.description.trim(),
      sourceAccountId: value.sourceAccountId || '',
      destinationAccountId: value.destinationAccountId || null,
      categoryId: value.categoryId || null,
      partyId: value.partyId || null, investmentId: null, debtId: null,
      notes: value.notes.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.transactionStore.createTransaction(transaction);

      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  }
}
