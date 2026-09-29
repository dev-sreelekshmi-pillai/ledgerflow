import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AccountStore } from './account.store';
import { AccountForm } from './account-form/account-form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Account,
  getAccountTypeLabel,
} from '../../domain/account/account.model';
@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
    MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Accounts {
    readonly getAccountTypeLabel =
      getAccountTypeLabel;
  private readonly snackBar =
    inject(MatSnackBar);
  readonly accountStore =
    inject(AccountStore);

  private readonly dialog =
    inject(MatDialog);

  openAccountForm(): void {
    this.dialog.open(AccountForm, {
      width: '480px',
      maxWidth: '95vw',
    });
  }

  openEditAccountForm(
    account: Account
  ): void {
    this.dialog.open(AccountForm, {
      width: '480px',
      maxWidth: '95vw',
      data: {
        account,
      },
    });
  }
  async deactivateAccount(account: Account): Promise<void> {
    const confirmed = window.confirm(
      `Deactivate "${account.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await this.accountStore.updateAccount({
        ...account,
        isActive: false,
        updatedAt: new Date().toISOString(),
      });

      this.snackBar.open(
        `${account.name} has been deactivated.`,
        'Close',
        {
          duration: 3000,
        }
      );
    } catch (error: unknown) {
      this.snackBar.open(
        error instanceof Error
          ? error.message
          : 'Unable to deactivate account.',
        'Close',
        {
          duration: 4000,
        }
      );
    }
  }
}
