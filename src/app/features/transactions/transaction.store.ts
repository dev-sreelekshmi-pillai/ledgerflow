import {
  Injectable,
  computed,
  inject,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';

import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository';

import {
  Transaction,
  getTransactionClassification,
} from '../../domain/transaction/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionStore {
  private readonly authService =
    inject(AuthService);

  private readonly transactionRepository =
    inject(TransactionRepository);

  readonly currentUser = computed(
    () => this.authService.currentUser()
  );

  private readonly transactionsSignal =
    toSignal(
      this.authService.user$.pipe(
        switchMap((user) =>
          user
            ? this.transactionRepository.getAll(
              user.uid
            )
            : of([])
        )
      ),
      {
        initialValue: [],
      }
    );

  readonly transactions = computed(
    () => this.transactionsSignal()
  );

  readonly transactionCount = computed(
    () => this.transactions().length
  );

  readonly totalIncome = computed(() =>
    this.transactions()
      .filter(
        (transaction) =>
          getTransactionClassification(
            transaction.type
          ) === 'income'
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      )
  );

  readonly totalExpenses = computed(() =>
    this.transactions()
      .filter(
        (transaction) =>
          getTransactionClassification(
            transaction.type
          ) === 'expense'
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      )
  );

  readonly netCashFlow = computed(
    () =>
      this.totalIncome() -
      this.totalExpenses()
  );

  async createTransaction(
    transaction: Transaction
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (transaction.userId !== user.uid) {
      throw new Error(
        'Cannot create a transaction for another user.'
      );
    }

    await this.transactionRepository.create(
      transaction
    );
  }
}
