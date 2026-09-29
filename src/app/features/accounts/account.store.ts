import {
  Injectable,
  computed,
  inject,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { AccountRepository } from '../../infrastructure/repositories/account.repository';

import {
  Account,
  getAccountClassification,
} from '../../domain/account/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountStore {
  private readonly authService =
    inject(AuthService);

  private readonly accountRepository =
    inject(AccountRepository);

  readonly currentUser = computed(
    () => this.authService.currentUser()
  );

  private readonly accountsSignal = toSignal(
    this.authService.user$.pipe(
      switchMap((user) =>
        user
          ? this.accountRepository.getAll(user.uid)
          : of([])
      )
    ),
    {
      initialValue: [],
    }
  );

  readonly accounts = computed(
    () => this.accountsSignal()
  );

  readonly accountCount = computed(
    () => this.accounts().length
  );

  readonly totalAssetBalance = computed(() =>
    this.accounts()
      .filter(
        (account) =>
          getAccountClassification(account.type) ===
          'asset'
      )
      .reduce(
        (total, account) =>
          total + account.currentBalance,
        0
      )
  );

  readonly totalLiabilityBalance = computed(() =>
    this.accounts()
      .filter(
        (account) =>
          getAccountClassification(account.type) ===
          'liability'
      )
      .reduce(
        (total, account) =>
          total + account.currentBalance,
        0
      )
  );

  readonly netWorth = computed(
    () =>
      this.totalAssetBalance() -
      this.totalLiabilityBalance()
  );

  async createAccount(
    account: Account
  ): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (account.userId !== user.uid) {
      throw new Error(
        'Cannot create an account for another user.'
      );
    }

    await this.accountRepository.create(account);
  }

  async updateAccount(
    account: Account
  ): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (account.userId !== user.uid) {
      throw new Error(
        'Cannot update an account belonging to another user.'
      );
    }

    await this.accountRepository.update(account);
  }

  async deleteAccount(
    accountId: string
  ): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    await this.accountRepository.delete(
      user.uid,
      accountId
    );
  }
}
