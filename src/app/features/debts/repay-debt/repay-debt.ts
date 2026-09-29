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
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Debt } from '../../../domain/debt/debt.model';
import { AccountStore } from '../../../features/accounts/account.store';
import { DebtStore } from '../../../state/debt.store';

@Component({
  selector: 'app-repay-debt',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './repay-debt.html',
  styleUrl: './repay-debt.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepayDebt {
  private readonly fb = inject(FormBuilder);

  private readonly debtStore =
    inject(DebtStore);

  readonly accountStore =
    inject(AccountStore);

  private readonly dialogRef =
    inject(MatDialogRef<RepayDebt>);

  readonly debt =
    inject<Debt>(MAT_DIALOG_DATA);

  readonly form =
    this.fb.nonNullable.group({
      amount: [
        this.debt.outstandingAmount,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(
            this.debt.outstandingAmount
          ),
        ],
      ],

      accountId: [
        '',
        Validators.required,
      ],

      notes: [''],
    });

  saving = false;

  get isLentDebt(): boolean {
    return this.debt.direction === 'lent';
  }

  get title(): string {
    return this.isLentDebt
      ? 'Record Repayment Received'
      : 'Record Debt Repayment';
  }

  get description(): string {
    return this.isLentDebt
      ? 'Record money received from this party.'
      : 'Record money paid back for this debt.';
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();

    if (
      value.amount >
      this.debt.outstandingAmount
    ) {
      this.form.controls.amount.setErrors({
        maxOutstanding: true,
      });

      return;
    }

    this.saving = true;

    try {
      await this.debtStore.repayDebt(
        this.debt,
        value.amount,
        value.accountId,
        value.notes.trim() || null
      );

      this.dialogRef.close(true);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
