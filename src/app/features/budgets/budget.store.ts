import { computed, inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';
import { BudgetRepository } from '../../infrastructure/repositories/budget.repository';
import { TransactionStore } from '../transactions/transaction.store';
import { Budget } from '../../domain/budget/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetStore {
  private readonly authService = inject(AuthService);
  private readonly budgetRepository = inject(BudgetRepository);
  private readonly transactionStore = inject(TransactionStore);

  readonly currentUser = computed(() => this.authService.currentUser());

  private readonly budgetsSignal = toSignal(
    this.authService.user$.pipe(
      switchMap(user =>
        user
          ? this.budgetRepository.getAll(user.uid)
          : of([])
      )
    ),
    {
      initialValue: [],
    }
  );

  readonly budgets = computed(() => this.budgetsSignal());

  readonly budgetCount = computed(() => this.budgets().length);

  async createBudget(budget: Budget): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    if (budget.userId !== user.uid) {
      throw new Error(
        'Cannot create a budget for another user.'
      );
    }

    await this.budgetRepository.create(budget);
  }

  async updateBudget(budget: Budget): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    if (budget.userId !== user.uid) {
      throw new Error(
        'Cannot update a budget for another user.'
      );
    }

    await this.budgetRepository.update(budget);
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    await this.budgetRepository.delete(user.uid, budgetId);
  }

  getSpentAmount(budget: Budget): number {
    return this.transactionStore
      .transactions()
      .filter(
        transaction =>
          transaction.type === 'expense' &&
          transaction.categoryId === budget.categoryId &&
          transaction.transactionDate.startsWith(budget.month)
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );
  }

  getRemainingAmount(budget: Budget): number {
    return budget.amount - this.getSpentAmount(budget);
  }

  getUsagePercentage(budget: Budget): number {
    if (budget.amount <= 0) {
      return 0;
    }

    return (this.getSpentAmount(budget) / budget.amount) * 100;
  }

  getBudgetStatus(
    budget: Budget
  ): 'on-track' | 'near-limit' | 'over-budget' {
    const percentage = this.getUsagePercentage(budget);

    if (percentage >= 100) {
      return 'over-budget';
    }

    if (percentage >= 80) {
      return 'near-limit';
    }

    return 'on-track';
  }
}
