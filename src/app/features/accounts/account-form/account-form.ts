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

import {
  Account,
  AccountType,
} from '../../../domain/account/account.model';

import { AccountStore } from '../account.store';

interface AccountFormDialogData {
  account?: Account;
}

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './account-form.html',
  styleUrl: './account-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountForm {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly accountStore =
    inject(AccountStore);

  private readonly dialogRef =
    inject(MatDialogRef<AccountForm>);

  readonly data = inject<AccountFormDialogData>(
    MAT_DIALOG_DATA,
    {
      optional: true,
    }
  );

  readonly accountTypes: {
    value: AccountType;
    label: string;
  }[] = [
      {
        value: 'bank',
        label: 'Bank Account',
      },
      {
        value: 'cash',
        label: 'Cash',
      },
      {
        value: 'credit-card',
        label: 'Credit Card',
      },
      {
        value: 'investment',
        label: 'Investment',
      },
      {
        value: 'loan',
        label: 'Loan / Debt',
      },
    ];

  readonly isEditMode =
    !!this.data?.account;

  readonly accountForm =
    this.formBuilder.nonNullable.group({
      name: [
        this.data?.account?.name ?? '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],

      type: [
        this.data?.account?.type ?? 'bank',
        Validators.required,
      ],

      currency: [
        this.data?.account?.currency ?? 'INR',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3),
        ],
      ],

      openingBalance: [
        this.data?.account?.openingBalance ?? 0,
        [
          Validators.required,
          Validators.min(0),
        ],
      ],
    });

  isSaving = false;
  errorMessage = '';

  constructor() {
    if (this.isEditMode) {
      this.accountForm.controls.openingBalance.disable();
    }
  }

  async save(): Promise<void> {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      const user =
        this.accountStore.currentUser();

      if (!user) {
        throw new Error(
          'You must be signed in to manage accounts.'
        );
      }

      const formValue =
        this.accountForm.getRawValue();

      if (this.isEditMode) {
        const existingAccount =
          this.data!.account!;

        const updatedAccount: Account = {
          ...existingAccount,

          name: formValue.name.trim(),

          type: formValue.type,

          currency:
            formValue.currency.toUpperCase(),

          updatedAt:
            new Date().toISOString(),
        };

        await this.accountStore.updateAccount(
          updatedAccount
        );

        this.dialogRef.close(
          updatedAccount
        );

        return;
      }

      const now =
        new Date().toISOString();

      const account: Account = {
        id: crypto.randomUUID(),

        userId: user.uid,

        name: formValue.name.trim(),

        type: formValue.type,

        currency:
          formValue.currency.toUpperCase(),

        openingBalance:
          formValue.openingBalance,

        currentBalance:
          formValue.openingBalance,

        isActive: true,

        createdAt: now,

        updatedAt: now,
      };

      await this.accountStore.createAccount(
        account
      );

      this.dialogRef.close(account);

    } catch (error: unknown) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : this.isEditMode
            ? 'Unable to update account.'
            : 'Unable to create account.';

    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
