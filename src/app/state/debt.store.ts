import { Injectable, computed, inject, signal } from '@angular/core';

import {
  Debt,
  DebtDirection,
} from '../domain/debt/debt.model';
import { DebtRepository } from '../infrastructure/repositories/debt.repository';
import { Transaction } from '../domain/transaction/transaction.model';
import { AuthService } from '../core/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DebtStore {
  private readonly debtRepository = inject(DebtRepository);
  private readonly authService = inject(AuthService);

  readonly debts = signal<Debt[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeDebts = computed(() =>
    this.debts().filter(
      (debt) => debt.status === 'active'
    )
  );

  readonly settledDebts = computed(() =>
    this.debts().filter(
      (debt) => debt.status === 'settled'
    )
  );

  readonly totalLent = computed(() =>
    this.debts()
      .filter(
        (debt) =>
          debt.direction === 'lent'
      )
      .reduce(
        (total, debt) =>
          total + debt.outstandingAmount,
        0
      )
  );

  readonly totalBorrowed = computed(() =>
    this.debts()
      .filter(
        (debt) =>
          debt.direction === 'borrowed'
      )
      .reduce(
        (total, debt) =>
          total + debt.outstandingAmount,
        0
      )
  );

  readonly netDebtPosition = computed(
    () =>
      this.totalLent() -
      this.totalBorrowed()
  );

  readonly activeDebtCount = computed(
    () => this.activeDebts().length
  );

  loadDebts(): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.debts.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.debtRepository
      .getAll(user.uid)
      .subscribe({
        next: (debts) => {
          this.debts.set(debts);
          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Failed to load debts:',
            error
          );

          this.error.set(
            'Failed to load debts.'
          );

          this.loading.set(false);
        },
      });
  }

  async createDebt(
    debt: Debt
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'You must be logged in to create a debt.'
      );
    }

    if (debt.userId !== user.uid) {
      throw new Error(
        'You cannot create a debt for another user.'
      );
    }

    if (debt.principalAmount <= 0) {
      throw new Error(
        'Debt amount must be greater than zero.'
      );
    }

    const transaction =
      this.createInitialTransaction(debt);

    await this.debtRepository
      .createWithTransaction(
        debt,
        transaction
      );
  }

  async repayDebt(
    debt: Debt,
    amount: number,
    accountId: string,
    notes: string | null = null
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'You must be logged in to repay a debt.'
      );
    }

    if (debt.userId !== user.uid) {
      throw new Error(
        'You cannot modify another user\'s debt.'
      );
    }

    if (debt.status !== 'active') {
      throw new Error(
        'Only active debts can be repaid.'
      );
    }

    if (amount <= 0) {
      throw new Error(
        'Repayment amount must be greater than zero.'
      );
    }

    if (amount > debt.outstandingAmount) {
      throw new Error(
        'Repayment amount cannot exceed the outstanding debt.'
      );
    }

    if (!accountId) {
      throw new Error(
        'An account is required for repayment.'
      );
    }

    const now =
      new Date().toISOString();

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      userId: user.uid,
      type: 'debt-repayment',
      amount,
      currency: debt.currency,
      transactionDate: now,
      description:
        debt.direction === 'lent'
          ? `Debt repayment received`
          : `Debt repayment`,
      sourceAccountId:
        debt.direction === 'borrowed'
          ? accountId
          : null,
      destinationAccountId:
        debt.direction === 'lent'
          ? accountId
          : null,
      categoryId: null,
      partyId: debt.partyId,
      investmentId: null,
      debtId: debt.id,
      notes,
      createdAt: now,
      updatedAt: now,
    };

    await this.debtRepository
      .recordRepayment(
        debt,
        transaction
      );
  }

  getDebtById(
    debtId: string
  ): Debt | undefined {
    return this.debts().find(
      (debt) => debt.id === debtId
    );
  }

  getDebtsByDirection(
    direction: DebtDirection
  ): Debt[] {
    return this.debts().filter(
      (debt) =>
        debt.direction === direction
    );
  }

  getOutstandingAmount(
    debtId: string
  ): number {
    return (
      this.getDebtById(debtId)
        ?.outstandingAmount ?? 0
    );
  }

  private createInitialTransaction(
    debt: Debt
  ): Transaction {
    const now =
      new Date().toISOString();

    const isLent =
      debt.direction === 'lent';

    return {
      id: crypto.randomUUID(),
      userId: debt.userId,
      type: isLent
        ? 'debt-given'
        : 'debt-received',
      amount: debt.principalAmount,
      currency: debt.currency,
      transactionDate: debt.startDate,
      description: isLent
        ? `Money lent`
        : `Money borrowed`,
      sourceAccountId: isLent
        ? debt.accountId
        : null,
      destinationAccountId: isLent
        ? null
        : debt.accountId,
      categoryId: null,
      partyId: debt.partyId,
      investmentId: null,
      debtId: debt.id,
      notes: debt.notes,
      createdAt: now,
      updatedAt: now,
    };
  }
}
