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
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../core/auth/auth.service';
import {
  Debt,
  DebtDirection,
} from '../../../domain/debt/debt.model';
import { AccountStore } from '../../accounts/account.store';
import { DebtStore } from '../../../state/debt.store';
import { PartyStore } from '../../../state/party.store';

@Component({
  selector: 'app-add-debt',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-debt.html',
  styleUrl: './add-debt.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDebt {
  private readonly fb = inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly debtStore =
    inject(DebtStore);

  readonly partyStore =
    inject(PartyStore);

  readonly accountStore =
    inject(AccountStore);

  private readonly dialogRef =
    inject(MatDialogRef<AddDebt>);

  readonly form =
    this.fb.nonNullable.group({
      direction: [
        'lent' as DebtDirection,
        Validators.required,
      ],

      partyId: [
        '',
        Validators.required,
      ],

      accountId: [
        '',
        Validators.required,
      ],

      principalAmount: [
        0,
        [
          Validators.required,
          Validators.min(0.01),
        ],
      ],

      startDate: [
        this.getToday(),
        Validators.required,
      ],

      notes: [''],
    });

  readonly directions: {
    value: DebtDirection;
    label: string;
  }[] = [
      {
        value: 'lent',
        label: 'Money Lent',
      },
      {
        value: 'borrowed',
        label: 'Money Borrowed',
      },
    ];

  saving = false;

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user =
      this.authService.currentUser();

    if (!user) {
      return;
    }

    const value =
      this.form.getRawValue();

    if (value.principalAmount <= 0) {
      return;
    }

    this.saving = true;

    const now =
      new Date().toISOString();

    const debt: Debt = {
      id: crypto.randomUUID(),

      userId: user.uid,

      partyId: value.partyId,

      direction: value.direction,

      accountId: value.accountId,

      principalAmount:
        value.principalAmount,

      outstandingAmount:
        value.principalAmount,

      startDate:
        value.startDate,

      currency: 'INR',

      status: 'active',

      notes:
        value.notes.trim() || null,

      createdAt: now,

      updatedAt: now,
    };

    try {
      await this.debtStore.createDebt(
        debt
      );

      this.dialogRef.close(debt);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private getToday(): string {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }
}
