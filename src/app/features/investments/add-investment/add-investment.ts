import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { InvestmentStore } from '../investment.store';
import { AccountStore } from '../../accounts/account.store';

@Component({
  selector: 'app-add-investment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-investment.html',
  styleUrl: './add-investment.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInvestment {
  private readonly fb = inject(FormBuilder);

  private readonly dialogRef =
    inject(MatDialogRef<AddInvestment>);

  private readonly investmentStore =
    inject(InvestmentStore);

  private readonly accountStore =
    inject(AccountStore);

  readonly accounts = this.accountStore.accounts;

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
    ]),

    type: this.fb.nonNullable.control<
      'mutual-fund' |
      'stock' |
      'etf' |
      'gold' |
      'fixed-deposit' |
      'other'
    >('mutual-fund', Validators.required),

    accountId: this.fb.nonNullable.control(
      '',
      Validators.required
    ),

    investedAmount: this.fb.nonNullable.control(0, [
      Validators.required,
      Validators.min(0.01),
    ]),

    currentValue: this.fb.nonNullable.control(0, [
      Validators.required,
      Validators.min(0),
    ]),

    units: this.fb.nonNullable.control<number | null>(
      null
    ),

    purchaseDate: this.fb.nonNullable.control(
      this.getCurrentDate(),
      Validators.required
    ),

    notes: this.fb.nonNullable.control('', [
      Validators.maxLength(500),
    ]),
  });

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.investmentStore.currentUser();

    if (!user) {
      return;
    }

    const value = this.form.getRawValue();
    const now = new Date().toISOString();

    const investment = {
      id: crypto.randomUUID(),
      userId: user.uid,
      name: value.name.trim(),
      type: value.type,
      accountId: value.accountId,
      investedAmount: value.investedAmount,
      currentValue: value.currentValue,
      units: value.units,
      purchaseDate: value.purchaseDate,
      notes: value.notes.trim() || null,
      currency: 'INR',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.investmentStore.createInvestment(
        investment
      );

      this.dialogRef.close(true);
    } catch (error) {
      console.error(
        'Failed to create investment:',
        error
      );
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
